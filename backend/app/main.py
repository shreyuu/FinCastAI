import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.svm import SVR
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import requests
from transformers import pipeline
from pandas.tseries.offsets import BDay
from typing import List, Dict, Optional  # ensure Optional is available
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import ta
import time
import threading

# ============================================================
# Configuration Import
# ============================================================
from .config import Config

# Initialize FinBERT Sentiment Analysis Pipeline
sentiment_pipeline = pipeline("text-classification", model=Config.FINBERT_MODEL)

# FastAPI App Setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Pydantic Models
# ============================================================
class StockRequest2(BaseModel):
    company: str
    ticker: str
    owned_stock: bool


class StockRequest(BaseModel):
    ticker: str
    start_date: str
    end_date: str
    forecast_out: int = 7


class NewsResponse(BaseModel):
    company: str
    impact: float
    reasons: List[str]


class StockPrice(BaseModel):
    name: str
    price: float
    color: str
    percent_change: float


class StockPricesResponse(BaseModel):
    stocks: List[StockPrice]


class BollingerBands(BaseModel):
    Low: float
    Mid: float
    Up: float


class IndicatorResponse(BaseModel):
    company: str
    ticker: str
    impact: float
    RSI: float
    EMA: float
    MACD: float
    Bollinger_Bands: BollingerBands
    OBV: float
    trade_decision: str


class PricePoint(BaseModel):
    date: str
    price: float
    type: str


class HealthResponse(BaseModel):
    status: str


class PredictionResponse(BaseModel):
    name: str
    data: List[PricePoint]
    Hdata: List[PricePoint]
    curprice: float
    sentiment_score: float
    adjustment_factor: float
    stock_prices: List[StockPrice]


# ============================================================
# Market Calendar
# ============================================================
MARKET_HOLIDAYS_2025 = Config.MARKET_HOLIDAYS_2025


def get_next_business_days(start_date: datetime, num_days: int) -> List[datetime]:
    business_days = []
    current_date = pd.Timestamp(start_date)

    while len(business_days) < num_days:
        if (
            current_date.strftime("%Y-%m-%d") not in MARKET_HOLIDAYS_2025
            and current_date.weekday() < 5
        ):
            business_days.append(current_date)
        current_date = current_date + BDay(1)
    return business_days


# ============================================================
# News Fetching & Sentiment Analysis
# ============================================================
def fetch_news(company: str) -> List[str]:
    """
    Fetch latest news articles for a company using NewsData.io API
    """
    url = f"https://newsdata.io/api/1/news?apikey={Config.NEWS_API_KEY}&q={company}&country=in"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if "results" not in data:
            return []

        return [
            article["title"] + " " + (article.get("description", "") or "")
            for article in data["results"]
        ]
    except Exception as e:
        print(f"Error fetching news: {str(e)}")
        return []


def _signed_sentiment_scores(news_list: List[str]) -> List[float]:
    """Run FinBERT once over the batch and return per-article signed scores.

    Positive articles yield +score, negative yield -score, neutral yield 0.
    """
    results = sentiment_pipeline(news_list)
    scores = []
    for result in results:
        label = result["label"]
        score = result["score"]
        if label == "positive":
            scores.append(score)
        elif label == "negative":
            scores.append(-score)
        else:
            scores.append(0.0)
    return scores


# A sentiment score is the mean signed FinBERT confidence over the batch, in
# [-1, 1]. The /news-impact endpoint reports it as a percentage via
# IMPACT_SCALE; /predict and /Indicotor use the raw value. Keeping one
# definition and one scale factor here avoids the three divergent scalings this
# module used to carry.
IMPACT_SCALE = 20.0


def analyze_sentiment(news_list: List[str]) -> float:
    """Mean signed FinBERT score for a batch of articles, in [-1, 1]."""
    if not news_list:
        return 0.0
    try:
        scores = _signed_sentiment_scores(news_list)
        return float(np.mean(scores)) if scores else 0.0
    except Exception as e:
        print(f"Error analyzing sentiment: {str(e)}")
        return 0.0


def sentiment_impact(news_list: List[str]) -> float:
    """Sentiment expressed as a percentage impact, rounded for display."""
    return round(analyze_sentiment(news_list) * IMPACT_SCALE, 2)


# ============================================================
# Technical Indicators
# ============================================================
def fetch_stock_indicators(ticker):
    stock = yf.Ticker(ticker)
    df = stock.history(period="1mo", interval="1d")

    if df.empty:
        return None

    df["EMA"] = ta.trend.ema_indicator(df["Close"], window=20)
    df["RSI"] = ta.momentum.rsi(df["Close"], window=14)
    df["MACD"] = ta.trend.macd(df["Close"])
    df["Bollinger_Up"], df["Bollinger_Mid"], df["Bollinger_Low"] = (
        ta.volatility.bollinger_hband(df["Close"]),
        ta.volatility.bollinger_mavg(df["Close"]),
        ta.volatility.bollinger_lband(df["Close"]),
    )
    df["OBV"] = ta.volume.on_balance_volume(df["Close"], df["Volume"])
    df.fillna(0, inplace=True)
    return df.iloc[-1].to_dict()


# ============================================================
# Stock Prediction Endpoint
# ============================================================
@app.post("/predict", response_model=PredictionResponse)
async def predict_stock(data: StockRequest):
    """
    Predict stock prices using historical data, sentiment analysis, and SVR
    """
    try:
        stock_data = yf.download(data.ticker, start=data.start_date, end=data.end_date)

        if stock_data.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No market data for ticker {data.ticker!r}. Check the symbol.",
            )

        company_name = data.ticker.split(".")[0]
        sentiment_score = analyze_sentiment(fetch_news(company_name))
        sentiment_score = float(sentiment_score)

        historical_prices = []
        if "Close" in stock_data.columns:
            for date_idx, row in stock_data.iterrows():
                historical_prices.append(
                    {
                        "date": date_idx.strftime("%Y-%m-%d"),
                        "price": float(row["Close"]),
                        "type": "historical",
                    }
                )

        # Prepare training data
        features = ["Open", "High", "Low", "Close", "Volume"]
        feature_cols = features + ["Sentiment"]
        stock_data["Sentiment"] = sentiment_score
        stock_data["Target"] = stock_data["Close"].shift(-data.forecast_out)

        # Fill gaps in feature columns only; do NOT fabricate target labels.
        stock_data[feature_cols] = stock_data[feature_cols].ffill()

        # Train only on rows that have a real (known) future target.
        train_data = stock_data.dropna(subset=feature_cols + ["Target"])
        if train_data.empty:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Not enough history to train: {len(stock_data)} rows for a "
                    f"{data.forecast_out}-day forecast. Widen the date range."
                ),
            )

        X = train_data[feature_cols].values
        y = train_data["Target"].values
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        svr = SVR(kernel="rbf", C=1e3, gamma=0.1)
        svr.fit(X_train_scaled, y_train)

        # Forecast from the most recent rows (whose targets are not yet known).
        last_data = stock_data[feature_cols].tail(data.forecast_out).values
        last_data_scaled = scaler.transform(last_data)
        predictions = svr.predict(last_data_scaled)

        predictions *= 1 + sentiment_score * 0.1

        last_date = max(stock_data.index[-1], pd.Timestamp.today().normalize())
        next_day = last_date + BDay(1)
        prediction_dates = get_next_business_days(next_day, len(predictions))

        prediction_data = [
            {
                "date": date.strftime("%Y-%m-%d"),
                "price": float(price),
                "type": "prediction",
            }
            for date, price in zip(prediction_dates, predictions)
        ]

        y_pred_test = svr.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred_test)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred_test)
        r2 = r2_score(y_test, y_pred_test)
        # Guard against division by zero in MAPE (skip zero-priced targets).
        nonzero = y_test != 0
        if np.any(nonzero):
            mape = (
                np.mean(
                    np.abs((y_test[nonzero] - y_pred_test[nonzero]) / y_test[nonzero])
                )
                * 100
            )
        else:
            mape = float("nan")

        print("\n==== MODEL EVALUATION METRICS ====")
        print(
            f"MSE: {mse:.4f} | RMSE: {rmse:.4f} | MAE: {mae:.4f} | MAPE: {mape:.2f}% | R²: {r2:.4f}"
        )
        print("==================================\n")

        # The last two rows of the frame we already downloaded carry the same
        # information the old second yf.Ticker(...).history("2d") call fetched.
        #
        # Caveat: if end_date is in the past this is the close on that date, not
        # today's price. The GET wrapper defaults end_date to today, so the
        # normal path is unaffected; a caller asking for a historical window
        # gets the last close in that window, which is the honest answer.
        quote = _quote_from_closes(_closes_for(stock_data, data.ticker))
        current_close = quote["price"]
        stock_prices = [{"name": data.ticker, **quote}]

        return {
            "name": data.ticker,
            "data": historical_prices + prediction_data,
            "Hdata": historical_prices,
            "curprice": current_close,
            "sentiment_score": float(sentiment_score),
            "adjustment_factor": float(sentiment_score * 0.1),
            "stock_prices": stock_prices,
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback

        print(traceback.format_exc())
        raise HTTPException(status_code=502, detail=f"Prediction failed: {e}")


# ============================================================
# Stock Prices Endpoint
# ============================================================
QUOTE_CACHE_TTL_SECONDS = 60
_quote_cache: Dict[str, object] = {"key": None, "at": 0.0, "value": None}
_quote_cache_lock = threading.Lock()


def _quote_from_closes(closes: pd.Series) -> Dict[str, object]:
    """Latest price, direction and percent change from a Close series."""
    closes = closes.dropna()
    if len(closes) >= 2:
        previous = float(closes.iloc[-2])
        latest = float(closes.iloc[-1])
        if previous == 0:
            return {"price": latest, "color": "grey", "percent_change": 0.0}
        change = ((latest - previous) / previous) * 100
        return {
            "price": latest,
            "color": "green" if latest > previous else "red",
            "percent_change": round(change, 2),
        }
    if len(closes) == 1:
        return {"price": float(closes.iloc[-1]), "color": "grey", "percent_change": 0.0}
    return {"price": 0.0, "color": "grey", "percent_change": 0.0}


def _closes_for(frame: pd.DataFrame, ticker: str) -> pd.Series:
    """Pull one ticker's Close column out of a batched yfinance download.

    A multi-ticker download returns MultiIndex columns; a single-ticker one may
    return either shape depending on the yfinance version, so handle both.
    """
    if frame is None or frame.empty:
        return pd.Series(dtype=float)
    if isinstance(frame.columns, pd.MultiIndex):
        for key in ((ticker, "Close"), ("Close", ticker)):
            if key in frame.columns:
                return frame[key]
        return pd.Series(dtype=float)
    return frame["Close"] if "Close" in frame.columns else pd.Series(dtype=float)


def _fetch_quotes(tickers: Dict[str, str]) -> List[Dict[str, object]]:
    """One batched download for every ticker, cached briefly.

    Previously this issued one blocking yf.Ticker().history() per symbol -
    fifteen sequential round trips on every landing-page load.
    """
    key = ",".join(sorted(tickers.values()))
    now = time.time()

    with _quote_cache_lock:
        if (
            _quote_cache["key"] == key
            and now - float(_quote_cache["at"]) < QUOTE_CACHE_TTL_SECONDS
            and _quote_cache["value"] is not None
        ):
            return list(_quote_cache["value"])  # type: ignore[arg-type]

    frame = yf.download(
        " ".join(tickers.values()),
        period="5d",
        interval="1d",
        group_by="ticker",
        progress=False,
        auto_adjust=True,
    )

    quotes = [
        {"name": name, **_quote_from_closes(_closes_for(frame, ticker))}
        for name, ticker in tickers.items()
    ]

    with _quote_cache_lock:
        _quote_cache.update({"key": key, "at": now, "value": list(quotes)})
    return quotes


@app.get("/stock-prices", response_model=StockPricesResponse)
async def get_stock_prices():
    try:
        return {"stocks": _fetch_quotes(Config.STOCK_TICKERS)}
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Failed to fetch stock prices: {e}"
        )


# ============================================================
# News Sentiment Endpoint
# ============================================================
@app.get("/news-impact/{company}", response_model=NewsResponse)
async def news_impact(company: str):
    try:
        news_list = fetch_news(company)
        if not news_list:
            return {
                "company": company,
                "impact": 0.0,
                "reasons": ["No relevant news found."],
            }

        # Run the (slow) FinBERT pipeline once for the whole batch.
        results = sentiment_pipeline(news_list)

        label_to_text = {"positive": "[Positive]", "negative": "[Negative]"}
        reasons = [
            f"{label_to_text.get(r['label'], '[Neutral]')} {news[:150]}..."
            for news, r in zip(news_list, results)
        ]

        signed = [
            r["score"] if r["label"] == "positive"
            else -r["score"] if r["label"] == "negative"
            else 0.0
            for r in results
        ]
        impact = round(float(np.mean(signed)) * IMPACT_SCALE, 2) if signed else 0.0
        return {"company": company, "impact": float(impact), "reasons": reasons}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Failed to analyze news impact: {e}"
        )


# ============================================================
# Indicator & Trade Decision Endpoint
# ============================================================
@app.post("/Indicotor", response_model=IndicatorResponse)
def predict_stock_impact(stock_request: StockRequest2):
    news_list = fetch_news(stock_request.company)
    sentiment_score = analyze_sentiment(news_list)
    stock_data = fetch_stock_indicators(stock_request.ticker)

    if stock_data is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No market data for ticker {stock_request.ticker!r}. "
                "Check the symbol."
            ),
        )

    impact = sentiment_score * 10
    trade_signal = "No Action"
    if sentiment_score > 0.05 and stock_data["RSI"] < 70:
        trade_signal = "Buy"
    elif sentiment_score < -0.05 and stock_data["RSI"] > 30:
        trade_signal = "Sell" if stock_request.owned_stock else "Avoid"
    elif stock_request.owned_stock:
        trade_signal = "Hold"

    return {
        "company": stock_request.company,
        "ticker": stock_request.ticker,
        "impact": round(impact, 2),
        "RSI": round(stock_data["RSI"], 2),
        "EMA": round(stock_data["EMA"], 2),
        "MACD": round(stock_data["MACD"], 2),
        "Bollinger_Bands": {
            "Low": round(stock_data["Bollinger_Low"], 2),
            "Mid": round(stock_data["Bollinger_Mid"], 2),
            "Up": round(stock_data["Bollinger_Up"], 2),
        },
        "OBV": round(stock_data["OBV"], 2),
        "trade_decision": trade_signal,
    }


# ============================================================
# Add simple health endpoint for frontend /health checks
# ============================================================
@app.get("/health", response_model=HealthResponse)
async def health():
    return {"status": "ok"}


# Provide a lightweight GET wrapper so frontend code using GET /predict_stock can still work.
# This constructs the expected request model and delegates to the existing POST handler.
@app.get("/predict_stock", response_model=PredictionResponse)
async def predict_stock_get(
    ticker: str,
    start_date: str = "2020-01-01",
    end_date: Optional[str] = None,
    forecast_out: int = 7,
):
    if end_date is None:
        end_date = datetime.today().strftime("%Y-%m-%d")
    # Use the same Pydantic model that the POST /predict endpoint expects
    req = StockRequest(
        ticker=ticker,
        start_date=start_date,
        end_date=end_date,
        forecast_out=forecast_out,
    )
    return await predict_stock(req)


# ============================================================
# Run Server
# ============================================================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=Config.HOST, port=Config.PORT)
