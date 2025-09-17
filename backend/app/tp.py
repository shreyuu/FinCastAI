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
from datetime import datetime, timedelta
import requests
from transformers import pipeline
from pandas.tseries.offsets import BDay
from typing import List, Dict, Optional
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score,accuracy_score
import numpy as np
from transformers import BertTokenizer, BertForSequenceClassification
from scipy.special import softmax
import torch
from pydantic import BaseModel


# API Keys and Configuration for newIo {News sentiment}
API_KEY = "pub_6830389454d2be3370f4b9fd5786223c9d6ad"
BASE_URL = "https://newsdata.io/api/1/news"
MODEL_NAME = "yiyanghkust/finbert-tone"
tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)
model = BertForSequenceClassification.from_pretrained(MODEL_NAME)

# Initialize FinBERT Sentiment Analysis Pipeline
sentiment_pipeline = pipeline("text-classification", model="ProsusAI/finbert")

# FastAPI App Setup
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class StockRequest(BaseModel):
    ticker: str
    start_date: str
    end_date: str
    forecast_out: int = 7

class StockNewsImpactResponse(BaseModel):
    impact: float
    reasons: list

class StockPrice(BaseModel):
    name: str
    price: float

class StockPricesResponse(BaseModel):
    stocks: List[StockPrice]

# Market Calendar
MARKET_HOLIDAYS_2025 = [
    "2025-01-01",  # New Year's Day
    "2025-01-26",  # Republic Day
    "2025-03-17",  # Holi
    "2025-04-14",  # Dr. Ambedkar Jayanti
    "2025-04-18",  # Good Friday
    "2025-05-01",  # Maharashtra Day
    "2025-08-15",  # Independence Day
    "2025-10-02",  # Gandhi Jayanti
    "2025-10-24",  # Dussehra
    "2025-11-12",  # Diwali
    "2025-12-25",  # Christmas
]

def get_next_business_days(start_date: datetime, num_days: int) -> List[datetime]:
    business_days = []
    current_date = pd.Timestamp(start_date)
    
    while len(business_days) < num_days:
        if current_date.strftime('%Y-%m-%d') not in MARKET_HOLIDAYS_2025 and current_date.weekday() < 5:
            business_days.append(current_date)
        current_date = current_date + BDay(1)  # Move to the next business day
    
    return business_days


def fetch_news(company: str):
    params = {
        "apikey": API_KEY,
        "q": company,
        "country": "in",
        "language": "en"
    }
    response = requests.get(BASE_URL, params=params)
    data = response.json()
    
    news_list = []
    for article in data.get("results", []):
        title = article.get("title", "")
        description = article.get("description", "")
        news_text = (title if title else "") + " " + (description if description else "")
        news_list.append((news_text.strip(), title))
    
    return news_list

def analyze_sentiment(news_list):
    scores = []
    reasons = []
    
    for news, title in news_list:
        inputs = tokenizer(news, return_tensors="pt", padding=True, truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs).logits
        probabilities = softmax(outputs.numpy()[0])
        
        negative, neutral, positive = probabilities
        sentiment_score = (positive - negative) * 10
        scores.append(sentiment_score)
        reasons.append((sentiment_score, title))
    
    avg_score = np.mean(scores) if scores else 0
    return avg_score, reasons

def estimate_impact(sentiment_score):
    if sentiment_score < -0.5:
        return round(sentiment_score * 2, 2)
    elif sentiment_score > 0.5:
        return round(sentiment_score * 2, 2)
    else:
        return round(sentiment_score * 1, 2)
@app.post("/predict")
async def predict_stock(data: StockRequest):
    """
    Predict stock prices using historical data, sentiment analysis, and SVR
    """
    try:
        # Debug: Print the input parameters
        print(f"Input parameters: ticker={data.ticker}, start_date={data.start_date}, end_date={data.end_date}")
        
        # Fetch stock data
        stock_data = yf.download(data.ticker, start=data.start_date, end=data.end_date)
        
        # Debug: Print what we received from Yahoo Finance
        print(f"Downloaded stock data shape: {stock_data.shape}")
        print(f"Downloaded stock data columns: {stock_data.columns}")
        print(f"Downloaded stock data index: {stock_data.index}")
        print(f"First 5 rows of stock data:")
        print(stock_data.head())

        if stock_data.empty:
            return {"error": "Stock data not available"}

        # Create a copy of the original data for historical prices
        original_stock_data = stock_data.copy()

        # Fetch and analyze news sentiment
        company_name = data.ticker.split(".")[0]
        sentiment_score = analyze_sentiment(fetch_news(company_name))

        # Ensure sentiment_score is a float
        try:
            sentiment_score = float(sentiment_score)
        except ValueError:
            sentiment_score = 0.0  # Default to neutral sentiment if conversion fails

        # Build historical_prices from the original data
        historical_prices = []
        
        # Debug: Check if the index and Close column exist
        print(f"Original stock data index type: {type(original_stock_data.index)}")
        print(f"Original stock data has Close column: {'Close' in original_stock_data.columns}")
        
        if 'Close' in original_stock_data.columns and len(original_stock_data) > 0:
            # Explicitly iterate over the dataframe rows to ensure we're accessing the data correctly
            for date_idx, row in original_stock_data.iterrows():
                try:
                    price = row['Close']
                    formatted_date = date_idx.strftime("%Y-%m-%d")
                    historical_prices.append({
                        "date": formatted_date,
                        "price": float(price),
                        "type": "historical"
                    })
                    print(f"Added historical price: {formatted_date}, {price}")
                except (ValueError, TypeError, AttributeError) as e:
                    print(f"Error processing row at {date_idx}: {e}")
        else:
            print("Cannot create historical prices: 'Close' column missing or dataframe is empty")

        # Debug: Print the first few historical prices to verify
        print(f"First 5 historical prices: {historical_prices[:5]}")
        print(f"Total historical prices: {len(historical_prices)}")

        # Define features
        features = ['Open', 'High', 'Low', 'Close', 'Volume']
        
        # Add numeric sentiment column
        stock_data['Sentiment'] = sentiment_score

        # Create target variable
        stock_data['Target'] = stock_data['Close'].shift(-data.forecast_out)
        stock_data.fillna(method="ffill", inplace=True) 
        stock_data.dropna(inplace=True)

        # Ensure no invalid data before training
        if stock_data.isnull().values.any():
            return {"error": "Data contains NaN values after processing"}

        # Prepare training data
        X = stock_data[features + ['Sentiment']].values
        y = stock_data['Target'].values

        if len(X) == 0 or len(y) == 0:
            return {"error": "Not enough data for training"}

        # Split and scale data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test) 
        # Train SVR model
        svr = SVR(kernel='rbf', C=1e3, gamma=0.1)
        svr.fit(X_train_scaled, y_train)

        # Prepare prediction data
        last_data = stock_data[features + ['Sentiment']].tail(data.forecast_out).values
        last_data_scaled = scaler.transform(last_data)

        # Make predictions
        predictions = svr.predict(last_data_scaled)

        # Adjust predictions based on sentiment
        sentiment_adjustment = 1 + sentiment_score * 0.1
        predictions *= sentiment_adjustment

        # Generate prediction dates
        last_date = max(stock_data.index[-1], pd.Timestamp.today().normalize())
        prediction_dates = get_next_business_days(last_date, len(predictions))

        # Prepare prediction response
        prediction_data = [
            {"date": date.strftime("%Y-%m-%d"), "price": float(price), "type": "prediction"}
            for date, price in zip(prediction_dates, predictions)
        ]
        
        # Calculate and print accuracy metrics
        y_pred_test = svr.predict(X_test_scaled)

# Calculate various metrics
        mse = mean_squared_error(y_test, y_pred_test)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test, y_pred_test)
        r2 = r2_score(y_test, y_pred_test)

# Calculate Mean Absolute Percentage Error (MAPE)
        mape = np.mean(np.abs((y_test - y_pred_test) / y_test)) * 100

# Print all metrics to terminal
        print("\n==== MODEL EVALUATION METRICS ====")
        print(f"Mean Squared Error (MSE): {mse:.4f}")
        print(f"Root Mean Squared Error (RMSE): {rmse:.4f}")
        print(f"Mean Absolute Error (MAE): {mae:.4f}")
        print(f"Mean Absolute Percentage Error (MAPE): {mape:.2f}%")
        print(f"R-squared (R²): {r2:.4f}")
        print("================================\n")

        # Return the combined data
        return {
            "data": historical_prices + prediction_data,
            "Hdata": historical_prices,
            "sentiment_score": float(sentiment_score),
            "adjustment_factor": float(sentiment_score * 0.1)
        }

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(error_details)  # Logs the full error traceback
        return {"error": f"Prediction failed: {str(e)}"}

@app.get("/stock-prices")
async def get_stock_prices():
    """
    Get current stock prices for a predefined list of companies
    """
    stock_tickers = {
        "TCS": "TCS.NS",
        "Tata Steel": "TATASTEEL.NS",
        "Reliance": "RELIANCE.NS",
        "ICICI Bank": "ICICIBANK.NS"
    }
    
    try:
        stock_prices = []
        
        for stock_name, ticker in stock_tickers.items():
            stock = yf.Ticker(ticker)
            hist = stock.history(period="1d")
            
            if not hist.empty:
                stock_price = float(hist["Close"].iloc[-1])
                stock_prices.append({"name": stock_name, "price": stock_price})
            else:
                stock_prices.append({"name": stock_name, "price": 0.0})
        
        return {"stocks": stock_prices}
        
    except Exception as e:
        return {"error": f"Failed to fetch stock prices: {str(e)}"}

@app.get("/news-impact/{company}")
async def news_impact(company: str):
    """
    Get news sentiment impact for a company based on its name.
    """
    news_list = fetch_news(company)
    if not news_list:
        return {"impact": 0, "reasons": [("No news found", "Neutral")]}    
    sentiment_score, reasons = analyze_sentiment(news_list)
    impact = estimate_impact(sentiment_score)
    return {"impact": impact, "reasons": reasons}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)