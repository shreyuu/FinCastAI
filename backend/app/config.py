import os
from pathlib import Path
from dotenv import load_dotenv


# --- Load .env file from the project root ---
BASE_DIR = Path(__file__).resolve().parent.parent  # /backend
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)


class Config:
    """Centralized configuration for the backend application"""

    # === API Keys ===
    NEWS_API_KEY = os.getenv(
        "NEWS_API_KEY", "pub_6830389454d2be3370f4b9fd5786223c9d6ad"  # default fallback
    )

    # === Model Configuration ===
    FINBERT_MODEL = os.getenv("FINBERT_MODEL", "ProsusAI/finbert")

    # === Database Configuration ===
    DATABASE_URL = os.getenv("DATABASE_URL")

    # === Server Configuration ===
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))

    # === CORS Configuration ===
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

    # === Market Configuration ===
    MARKET_HOLIDAYS_2025 = [
        "2025-01-01",
        "2025-01-26",
        "2025-03-17",
        "2025-04-14",
        "2025-04-18",
        "2025-05-01",
        "2025-08-15",
        "2025-10-02",
        "2025-10-24",
        "2025-11-12",
        "2025-12-25",
    ]

    # === Debugging / Logging ===
    DEBUG = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    # Add default stock tickers used by the API
    STOCK_TICKERS = {
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
    }

    @classmethod
    def summary(cls):
        """Prints key configuration values for debugging"""
        print(f"Loaded .env from: {ENV_PATH}")
        print(f"NEWS_API_KEY: {cls.NEWS_API_KEY[:10]}...")
        print(f"DATABASE_URL: {cls.DATABASE_URL}")
        print(f"HOST: {cls.HOST}")
        print(f"PORT: {cls.PORT}")
        print(f"ALLOWED_ORIGINS: {cls.ALLOWED_ORIGINS}")
        print(f"DEBUG: {cls.DEBUG}")


# Optional: uncomment for quick verification when running directly
# if __name__ == "__main__":
#     Config.summary()
