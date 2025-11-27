import os
import requests
import pandas as pd
import torch
from transformers import BertTokenizer, BertForSequenceClassification
from scipy.special import softmax
import numpy as np
from typing import List, Tuple, Optional

# Default API key (can be overridden by environment variable FINBERT_NEWS_API_KEY)
API_KEY = os.getenv("FINBERT_NEWS_API_KEY", "pub_6830389454d2be3370f4b9fd5786223c9d6ad")
BASE_URL = "https://newsdata.io/api/1/news"
MODEL_NAME = "yiyanghkust/finbert-tone"

# Lazy-loaded globals
_tokenizer: Optional[BertTokenizer] = None
_model: Optional[BertForSequenceClassification] = None
_device: Optional[torch.device] = None


def _load_model():
    """
    Lazy-load the tokenizer and model into module-level globals.
    Uses GPU if available.
    """
    global _tokenizer, _model, _device
    if _tokenizer is None or _model is None:
        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        _tokenizer = BertTokenizer.from_pretrained(MODEL_NAME)
        _model = BertForSequenceClassification.from_pretrained(MODEL_NAME)
        _model.to(_device)
    return _tokenizer, _model, _device


def fetch_news(
    company: str,
    api_key: Optional[str] = None,
    country: str = "in",
    language: str = "en",
) -> List[Tuple[str, str]]:
    """
    Fetch news articles for the given company.
    Returns a list of tuples: (full_text, title)
    """
    key = api_key or API_KEY
    params = {"apikey": key, "q": company, "country": country, "language": language}
    try:
        response = requests.get(BASE_URL, params=params, timeout=8)
        response.raise_for_status()
        data = response.json()
    except Exception:
        # On any error, return empty list (caller should handle no-news case)
        return []

    news_list: List[Tuple[str, str]] = []
    for article in data.get("results", []):
        title = article.get("title", "") or ""
        description = article.get("description", "") or ""
        news_text = (title + " " + description).strip()
        if news_text:
            news_list.append((news_text, title))
    return news_list


def analyze_sentiment(
    news_list: List[Tuple[str, str]], verbose: bool = False
) -> Tuple[float, List[Tuple[float, str, Tuple[float, float, float]]]]:
    """
    Analyze sentiment for a list of (news_text, title).
    Returns:
      - average sentiment score (float)
      - reasons: list of tuples (sentiment_score, title, (negative_prob, neutral_prob, positive_prob))
    Score scaling: (positive - negative) * 10
    """
    if not news_list:
        return 0.0, []

    tokenizer, model, device = _load_model()

    scores: List[float] = []
    reasons: List[Tuple[float, str, Tuple[float, float, float]]] = []

    for news, title in news_list:
        inputs = tokenizer(
            news, return_tensors="pt", padding=True, truncation=True, max_length=512
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model(**inputs).logits

        probs = softmax(outputs.cpu().numpy()[0])
        negative, neutral, positive = float(probs[0]), float(probs[1]), float(probs[2])
        sentiment_score = (positive - negative) * 10.0  # scaled

        if verbose:
            # Show limited debug info when requested
            snippet = (news[:100] + "...") if len(news) > 100 else news
            print(f"\nNews: {snippet}")
            print(
                f"Sentiment Probabilities -> Negative: {negative:.4f}, Neutral: {neutral:.4f}, Positive: {positive:.4f}"
            )
            print(f"Calculated Sentiment Score: {sentiment_score:.4f}")

        scores.append(sentiment_score)
        reasons.append((sentiment_score, title, (negative, neutral, positive)))

    avg_score = float(np.mean(scores)) if scores else 0.0
    return avg_score, reasons


def estimate_impact(sentiment_score: float) -> float:
    """
    Convert sentiment score to a predicted impact percentage.
    """
    if sentiment_score < -0.5:
        return round(sentiment_score * 2, 2)
    elif sentiment_score > 0.5:
        return round(sentiment_score * 2, 2)
    else:
        return round(sentiment_score * 1, 2)


def get_stock_news_impact(
    company: str, api_key: Optional[str] = None, verbose: bool = False
) -> Tuple[float, List[Tuple[float, str, Tuple[float, float, float]]]]:
    """
    High-level helper to fetch news, analyze sentiment, and estimate impact.
    Returns (impact_percent, reasons)
    """
    news_list = fetch_news(company, api_key=api_key)
    if not news_list:
        if verbose:
            print("No news found for this company.")
        return 0.0, [(-0.0, "No news found", (0.0, 1.0, 0.0))]

    sentiment_score, reasons = analyze_sentiment(news_list, verbose=verbose)
    impact = estimate_impact(sentiment_score)

    if verbose:
        print(f"\n===== Final Impact Calculation =====")
        print(f"Company: {company}")
        print(f"Average Sentiment Score: {sentiment_score:.4f}")
        print(f"Predicted Impact: {impact}%\n")

    return impact, reasons


__all__ = [
    "fetch_news",
    "analyze_sentiment",
    "estimate_impact",
    "get_stock_news_impact",
]
