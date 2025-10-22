import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Centralized configuration for the backend application"""

    # API Keys
    NEWS_API_KEY = os.getenv(
        "NEWS_API_KEY", "pub_6830389454d2be3370f4b9fd5786223c9d6ad"
    )

    # Model Configuration
    FINBERT_MODEL = os.getenv("FINBERT_MODEL", "ProsusAI/finbert")

    # Database Configuration
    DATABASE_URL = os.getenv("DATABASE_URL")

    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))

    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

    # Market Configuration
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
