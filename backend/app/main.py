import os
from fastapi import FastAPI
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
import asyncio
from sklearn.ensemble import VotingRegressor

# ============================================================
# Configuration Import
# ============================================================
from config import Config

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
    impact: float
    reasons: List[str]


class StockPrice(BaseModel):
    name: str
    price: float


class StockPricesResponse(BaseModel):
    stocks: List[StockPrice]


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


def analyze_sentiment1(news_list: List[str]) -> float:
    """Lightweight sentiment scoring"""
    if not news_list:
        return 0.0

    try:
        sentiments = []
        for news in news_list:
            result = sentiment_pipeline(news)[0]
            sentiment = result["label"]
            score = result["score"]

            if sentiment == "positive":
                sentiments.append(score)
            elif sentiment == "negative":
                sentiments.append(-score)
            else:
                sentiments.append(0)
        return float(np.mean(sentiments)) if sentiments else 0.0
    except Exception as e:
        print(f"Error analyzing sentiment: {str(e)}")
        return 0.0


def analyze_sentiment(news_list: List[str]) -> float:
    """Detailed sentiment analysis"""
    if not news_list:
        return 0.0
    try:
        sentiments = []
        for news in news_list:
            result = sentiment_pipeline(news)[0]
            sentiment = result["label"]
            score = result["score"]
            if sentiment == "positive":
                sentiment_score = score * 10
            elif sentiment == "negative":
                sentiment_score = -score * 10
            else:
                sentiment_score = 0.0
            sentiments.append(sentiment_score)
        avg_sentiment = float(np.mean(sentiments)) if sentiments else 0.0
        return round(avg_sentiment * 2, 2)
    except Exception as e:
        print(f"Error analyzing sentiment: {str(e)}")
        return 0.0


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
@app.post("/predict")
async def predict_stock(data: StockRequest):
    """
    Predict stock prices using historical data, sentiment analysis, and SVR
    """
    try:
        stock_data = yf.download(data.ticker, start=data.start_date, end=data.end_date)
        await asyncio.sleep(1)

        if stock_data.empty:
            return {"error": "Stock data not available"}

        company_name = data.ticker.split(".")[0]
        sentiment_score = analyze_sentiment1(fetch_news(company_name))
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
        stock_data["Sentiment"] = sentiment_score
        stock_data["Target"] = stock_data["Close"].shift(-data.forecast_out)
        stock_data.fillna(method="ffill", inplace=True)
        stock_data.dropna(inplace=True)

        X = stock_data[features + ["Sentiment"]].values
        y = stock_data["Target"].values
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        svr = SVR(kernel="rbf", C=1e3, gamma=0.1)
        svr.fit(X_train_scaled, y_train)

        ensemble_model = VotingRegressor(estimators=[("svr", svr)])
        ensemble_model.fit(X_train_scaled, y_train)

        last_data = stock_data[features + ["Sentiment"]].tail(data.forecast_out).values
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
        mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100

        print("\n==== MODEL EVALUATION METRICS ====")
        print(
            f"MSE: {mse:.4f} | RMSE: {rmse:.4f} | MAE: {mae:.4f} | MAPE: {mape:.2f}% | R²: {r2:.4f}"
        )
        print("==================================\n")

        stock = yf.Ticker(data.ticker)
        hist = stock.history(period="2d")

        stock_prices = []
        if len(hist) >= 2:
            yesterday_close = float(hist["Close"].iloc[-2])
            current_close = float(hist["Close"].iloc[-1])
            color = "green" if current_close > yesterday_close else "red"
            percent_change = ((current_close - yesterday_close) / yesterday_close) * 100
        else:
            current_close = float(hist["Close"].iloc[-1])
            color = "grey"
            percent_change = 0.0

        stock_prices.append(
            {
                "name": data.ticker,
                "price": current_close,
                "color": color,
                "percent_change": round(percent_change, 2),
            }
        )

        return {
            "name": data.ticker,
            "data": historical_prices + prediction_data,
            "Hdata": historical_prices,
            "curprice": current_close,
            "sentiment_score": float(sentiment_score),
            "adjustment_factor": float(sentiment_score * 0.1),
            "stock_prices": stock_prices,
        }

    except Exception as e:
        import traceback

        print(traceback.format_exc())
        return {"error": f"Prediction failed: {str(e)}"}


# ============================================================
# Stock Prices Endpoint
# ============================================================
@app.get("/stock-prices")
async def get_stock_prices():
    stock_tickers = Config.STOCK_TICKERS
    try:
        stock_prices = []
        for stock_name, ticker in stock_tickers.items():
            stock = yf.Ticker(ticker)
            hist = stock.history(period="2d")
            if len(hist) >= 2:
                yesterday_close = float(hist["Close"].iloc[-2])
                current_close = float(hist["Close"].iloc[-1])
                color = "green" if current_close > yesterday_close else "red"
                percent_change = (
                    (current_close - yesterday_close) / yesterday_close
                ) * 100
            else:
                current_close, color, percent_change = 0.0, "grey", 0.0
            stock_prices.append(
                {
                    "name": stock_name,
                    "price": current_close,
                    "color": color,
                    "percent_change": round(percent_change, 2),
                }
            )
        return {"stocks": stock_prices}
    except Exception as e:
        return {"error": f"Failed to fetch stock prices: {str(e)}"}


# ============================================================
# News Sentiment Endpoint
# ============================================================
@app.get("/news-impact/{company}")
async def news_impact(company: str):
    try:
        news_list = fetch_news(company)
        if not news_list:
            return {
                "company": company,
                "impact": 0.0,
                "reasons": ["No relevant news found."],
            }
        impact = analyze_sentiment(news_list)
        reasons = []
        for news in news_list:
            result = sentiment_pipeline(news)[0]
            sentiment_label = result["label"]
            score = result["score"]
            if sentiment_label == "positive":
                sentiment_text = "[Positive]"
            elif sentiment_label == "negative":
                sentiment_text = "[Negative]"
            else:
                sentiment_text = "[Neutral]"
            reasons.append(f"{sentiment_text} {news[:150]}...")
        return {"company": company, "impact": float(impact), "reasons": reasons}
    except Exception as e:
        return {"error": f"Failed to analyze news impact: {str(e)}"}


# ============================================================
# Indicator & Trade Decision Endpoint
# ============================================================
@app.post("/Indicotor")
def predict_stock_impact(stock_request: StockRequest2):
    news_list = fetch_news(stock_request.company)
    sentiment_score = analyze_sentiment1(news_list)
    stock_data = fetch_stock_indicators(stock_request.ticker)

    if stock_data is None:
        return {"error": "Stock data not available"}

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
@app.get("/health")
async def health():
    return {"status": "ok"}


# Provide a lightweight GET wrapper so frontend code using GET /predict_stock can still work.
# This constructs the expected request model and delegates to the existing POST handler.
@app.get("/predict_stock")
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
