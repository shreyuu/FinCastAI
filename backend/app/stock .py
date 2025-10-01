from fastapi import FastAPI
import yfinance as yf

app = FastAPI()


@app.get("/stock-prices")
async def get_stock_prices():
    stock_tickers = {
        "TCS": "TCS.NS",
        "Tata Steel": "TATASTEEL.NS",
        "Reliance": "RELIANCE.NS",
        "ICICI Bank": "ICICIBANK.NS",
        "Infosys": "INFY.NS",
        "HDFC Bank": "HDFCBANK.NS",
        "Bharti Airtel": "BHARTIARTL.NS",
        "Hindustan Unilever": "HINDUNILVR.NS",
        "Asian Paints": "ASIANPAINT.NS",
        "Maruti Suzuki": "MARUTI.NS",
        "State Bank of India": "SBIN.NS",
        "Larsen & Toubro": "LT.NS",
        "Bajaj Finance": "BAJFINANCE.NS",
        "Kotak Mahindra Bank": "KOTAKBANK.NS",
        "Sun Pharma": "SUNPHARMA.NS",
        # Add more stocks here
    }

    result = []
    for name, ticker in stock_tickers.items():
        stock = yf.Ticker(ticker)
        hist = stock.history(period="2d")  # Get last 2 days to calculate % change

        if hist.empty or len(hist) < 2:
            continue  # Skip if no data or not enough data

        latest_close = hist["Close"].iloc[-1]
        prev_close = hist["Close"].iloc[-2]
        percent_change = ((latest_close - prev_close) / prev_close) * 100
        color = "green" if percent_change >= 0 else "red"

        result.append(
            {
                "name": name,
                "price": round(latest_close, 2),
                "percent_change": round(percent_change, 2),
                "color": color,
            }
        )

    return {"stocks": result}
