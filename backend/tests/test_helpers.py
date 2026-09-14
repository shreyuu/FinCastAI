"""Unit tests for the pure helpers in main.py.

`get_next_business_days` and the sentiment scorers have no I/O, so they are
tested directly rather than through an endpoint.
"""

from datetime import datetime

import pandas as pd
import pytest


# ------------------------------------------------- get_next_business_days


def test_business_days_skips_the_weekend(main):
    # 2025-01-03 is a Friday; the next two trading days are Mon 6th and Tue 7th.
    days = main.get_next_business_days(datetime(2025, 1, 3), 3)

    assert [d.strftime("%Y-%m-%d") for d in days] == [
        "2025-01-03",
        "2025-01-06",
        "2025-01-07",
    ]


def test_business_days_skips_a_market_holiday(main):
    # 2025-01-26 (Republic Day) is a Sunday, so use Holi: Mon 2025-03-17.
    days = main.get_next_business_days(datetime(2025, 3, 14), 3)
    got = [d.strftime("%Y-%m-%d") for d in days]

    assert "2025-03-17" not in got, "Holi is a listed market holiday"
    assert got == ["2025-03-14", "2025-03-18", "2025-03-19"]


def test_business_days_returns_exactly_the_count_requested(main):
    for n in (1, 5, 22):
        assert len(main.get_next_business_days(datetime(2025, 1, 1), n)) == n


def test_business_days_never_returns_a_weekend_or_holiday(main):
    days = main.get_next_business_days(datetime(2025, 1, 1), 60)

    for d in days:
        assert d.weekday() < 5
        assert d.strftime("%Y-%m-%d") not in main.MARKET_HOLIDAYS_2025


def test_market_holidays_are_sorted_and_unique(main):
    holidays = main.MARKET_HOLIDAYS_2025
    assert holidays == sorted(holidays)
    assert len(holidays) == len(set(holidays))


# --------------------------------------------------------- sentiment maths


def test_signed_scores_map_labels_to_signs(main, labelled_pipeline):
    main.sentiment_pipeline = labelled_pipeline(
        [("positive", 0.8), ("negative", 0.4), ("neutral", 0.99)]
    )

    assert main._signed_sentiment_scores(["a", "b", "c"]) == [0.8, -0.4, 0.0]


def test_analyze_sentiment_averages_signed_scores(main, labelled_pipeline):
    main.sentiment_pipeline = labelled_pipeline([("positive", 0.6), ("negative", 0.2)])

    assert main.analyze_sentiment(["a", "b"]) == pytest.approx(0.2)


def test_analyze_sentiment_returns_zero_for_no_news(main):
    assert main.analyze_sentiment([]) == 0.0


def test_analyze_sentiment_swallows_pipeline_errors(main):
    """CHARACTERISES ERR-01: a model failure is reported as neutral sentiment."""

    def boom(_inputs, *a, **kw):
        raise RuntimeError("model exploded")

    main.sentiment_pipeline = boom

    assert main.analyze_sentiment(["a"]) == 0.0


def test_sentiment_impact_is_the_raw_score_times_the_scale(main, labelled_pipeline):
    """DUP-01 is resolved: one score, one documented scale factor.

    The three divergent scalings main.py used to carry are now a single
    IMPACT_SCALE applied on top of analyze_sentiment.
    """
    main.sentiment_pipeline = labelled_pipeline([("positive", 0.5)])
    assert main.analyze_sentiment(["a"]) == pytest.approx(0.5)

    main.sentiment_pipeline = labelled_pipeline([("positive", 0.5)])
    assert main.sentiment_impact(["a"]) == pytest.approx(0.5 * main.IMPACT_SCALE)


def test_impact_scale_preserves_the_previous_news_impact_values(main, labelled_pipeline):
    """The old inline scaling was mean(score*10) * 2, i.e. x20. Keep that."""
    assert main.IMPACT_SCALE == 20.0

    main.sentiment_pipeline = labelled_pipeline([("positive", 0.9)])
    assert main.sentiment_impact(["a"]) == pytest.approx(18.0)


# ------------------------------------------------------------- fetch_news


def test_fetch_news_joins_title_and_description(main, monkeypatch):
    class Resp:
        status_code = 200

        def raise_for_status(self):
            pass

        def json(self):
            return {
                "results": [
                    {"title": "Profits up", "description": "by 20 percent"},
                    {"title": "No description", "description": None},
                ]
            }

    monkeypatch.setattr(main.requests, "get", lambda *a, **kw: Resp())

    assert main.fetch_news("Reliance") == ["Profits up by 20 percent", "No description "]


def test_fetch_news_returns_empty_when_the_api_omits_results(main, monkeypatch):
    class Resp:
        def raise_for_status(self):
            pass

        def json(self):
            return {"status": "error", "message": "rate limited"}

    monkeypatch.setattr(main.requests, "get", lambda *a, **kw: Resp())

    assert main.fetch_news("Reliance") == []


def test_fetch_news_returns_empty_on_transport_error(main, monkeypatch):
    def boom(*a, **kw):
        raise RuntimeError("connection refused")

    monkeypatch.setattr(main.requests, "get", boom)

    assert main.fetch_news("Reliance") == []


# ------------------------------------------------ fetch_stock_indicators


def test_fetch_stock_indicators_returns_none_for_empty_history(main, monkeypatch):
    from market_fixtures import FakeYFinance

    monkeypatch.setattr(main, "yf", FakeYFinance(history_frame=pd.DataFrame()))

    assert main.fetch_stock_indicators("RELIANCE.NS") is None


def test_fetch_stock_indicators_computes_the_expected_columns(main, monkeypatch):
    from market_fixtures import FakeYFinance, ohlcv

    monkeypatch.setattr(main, "yf", FakeYFinance(history_frame=ohlcv(days=60)))

    row = main.fetch_stock_indicators("RELIANCE.NS")

    for key in ("EMA", "RSI", "MACD", "Bollinger_Up", "Bollinger_Mid", "Bollinger_Low", "OBV"):
        assert key in row, f"{key} missing from indicator row"
    assert not pd.isna(row["RSI"])
