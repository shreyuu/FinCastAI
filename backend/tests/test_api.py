"""Characterisation tests for the four served endpoints plus /health.

These pin *current* behaviour, including the parts the audit flags as wrong
(ERR-01: failures return HTTP 200 with an "error" key). When phase 4 changes
that contract, these tests should fail loudly — that is the point. Each such
test is marked with a CHARACTERISES comment naming the finding.
"""

import pandas as pd
import pytest

from market_fixtures import FakeYFinance, history_2d, ohlcv


# ---------------------------------------------------------------- /health


def test_health_returns_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# --------------------------------------------------------- /stock-prices


def test_stock_prices_reports_price_change_and_colour(client, main, monkeypatch):
    monkeypatch.setattr(
        main, "yf", FakeYFinance(history_frame=history_2d(prev_close=100.0, last_close=110.0))
    )
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"Reliance": "RELIANCE.NS"})

    body = client.get("/stock-prices").json()

    assert body["stocks"] == [
        {"name": "Reliance", "price": 110.0, "color": "green", "percent_change": 10.0}
    ]


def test_stock_prices_marks_a_fall_red(client, main, monkeypatch):
    monkeypatch.setattr(
        main, "yf", FakeYFinance(history_frame=history_2d(prev_close=100.0, last_close=95.0))
    )
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"TCS": "TCS.NS"})

    stock = client.get("/stock-prices").json()["stocks"][0]

    assert stock["color"] == "red"
    assert stock["percent_change"] == -5.0


def test_stock_prices_falls_back_to_grey_with_insufficient_history(
    client, main, monkeypatch
):
    one_day = pd.DataFrame({"Close": [100.0]}, index=pd.bdate_range("2025-06-02", periods=1))
    monkeypatch.setattr(main, "yf", FakeYFinance(history_frame=one_day))
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"Thin": "THIN.NS"})

    stock = client.get("/stock-prices").json()["stocks"][0]

    assert stock == {"name": "Thin", "price": 0.0, "color": "grey", "percent_change": 0.0}


def test_stock_prices_issues_one_request_per_ticker(client, main, monkeypatch):
    """CHARACTERISES PERF-01: 15 configured tickers means 15 sequential calls.

    When phase 4 batches the download this test should fail; replace it with an
    assertion that exactly one batched call is made.
    """
    fake = FakeYFinance(history_frame=history_2d())
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(
        main.Config, "STOCK_TICKERS", {"A": "A.NS", "B": "B.NS", "C": "C.NS"}
    )

    client.get("/stock-prices")

    assert fake.ticker_calls == ["A.NS", "B.NS", "C.NS"]


def test_stock_prices_returns_200_with_error_key_on_upstream_failure(
    client, main, monkeypatch
):
    """CHARACTERISES ERR-01: upstream failure is reported as HTTP 200."""

    class Exploding(FakeYFinance):
        def Ticker(self, ticker):
            raise RuntimeError("yfinance is down")

    monkeypatch.setattr(main, "yf", Exploding())
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"A": "A.NS"})

    r = client.get("/stock-prices")

    assert r.status_code == 200
    assert "yfinance is down" in r.json()["error"]


# ------------------------------------------------------- /news-impact/{c}


def test_news_impact_with_no_articles(client, main, monkeypatch):
    monkeypatch.setattr(main, "fetch_news", lambda company: [])

    body = client.get("/news-impact/Reliance").json()

    assert body == {
        "company": "Reliance",
        "impact": 0.0,
        "reasons": ["No relevant news found."],
    }


def test_news_impact_scales_positive_sentiment(
    client, main, monkeypatch, labelled_pipeline
):
    """CHARACTERISES DUP-01: the endpoint's scaling is mean(score*10) * 2.

    A single positive article at score 0.9 must yield 0.9*10*2 = 18.0. Phase 3
    collapses three different scalings into one; this pins the surviving value.
    """
    monkeypatch.setattr(main, "fetch_news", lambda company: ["Profits soar"])
    main.sentiment_pipeline = labelled_pipeline([("positive", 0.9)])

    body = client.get("/news-impact/Reliance").json()

    assert body["impact"] == 18.0
    assert body["reasons"][0].startswith("[Positive] Profits soar")


def test_news_impact_scales_negative_sentiment(
    client, main, monkeypatch, labelled_pipeline
):
    monkeypatch.setattr(main, "fetch_news", lambda company: ["Fraud probe opened"])
    main.sentiment_pipeline = labelled_pipeline([("negative", 0.5)])

    body = client.get("/news-impact/Reliance").json()

    assert body["impact"] == -10.0
    assert body["reasons"][0].startswith("[Negative] Fraud probe opened")


def test_news_impact_treats_neutral_as_zero(client, main, monkeypatch, labelled_pipeline):
    monkeypatch.setattr(main, "fetch_news", lambda company: ["Board meets Tuesday"])
    main.sentiment_pipeline = labelled_pipeline([("neutral", 0.99)])

    body = client.get("/news-impact/Reliance").json()

    assert body["impact"] == 0.0
    assert body["reasons"][0].startswith("[Neutral]")


def test_news_impact_averages_mixed_articles(
    client, main, monkeypatch, labelled_pipeline
):
    monkeypatch.setattr(main, "fetch_news", lambda c: ["good", "bad", "meh"])
    main.sentiment_pipeline = labelled_pipeline(
        [("positive", 0.6), ("negative", 0.3), ("neutral", 0.9)]
    )

    body = client.get("/news-impact/Reliance").json()

    # mean(6.0, -3.0, 0.0) = 1.0, then * 2
    assert body["impact"] == 2.0
    assert len(body["reasons"]) == 3


def test_news_impact_runs_the_pipeline_once_for_the_whole_batch(
    client, main, monkeypatch
):
    """FinBERT is the slowest thing here; it must be called once, not per article."""
    calls = []

    class Counting:
        def __call__(self, inputs, *a, **kw):
            calls.append(inputs)
            return [{"label": "neutral", "score": 1.0} for _ in inputs]

    monkeypatch.setattr(main, "fetch_news", lambda c: ["a", "b", "c", "d"])
    main.sentiment_pipeline = Counting()

    client.get("/news-impact/Reliance")

    assert len(calls) == 1
    assert calls[0] == ["a", "b", "c", "d"]


def test_news_impact_returns_200_with_error_key_on_failure(client, main, monkeypatch):
    """CHARACTERISES ERR-01."""

    def boom(company):
        raise RuntimeError("news api down")

    monkeypatch.setattr(main, "fetch_news", boom)

    r = client.get("/news-impact/Reliance")

    assert r.status_code == 200
    assert "news api down" in r.json()["error"]


# ------------------------------------------------------------- /Indicotor


def _indicator_row(rsi):
    return {
        "RSI": rsi,
        "EMA": 100.0,
        "MACD": 1.0,
        "Bollinger_Low": 90.0,
        "Bollinger_Mid": 100.0,
        "Bollinger_Up": 110.0,
        "OBV": 5000.0,
    }


def _post_indicator(client, owned=False):
    return client.post(
        "/Indicotor",
        json={"company": "Reliance", "ticker": "RELIANCE.NS", "owned_stock": owned},
    )


def test_indicator_reports_missing_stock_data(client, main, monkeypatch):
    monkeypatch.setattr(main, "fetch_news", lambda c: [])
    monkeypatch.setattr(main, "fetch_stock_indicators", lambda t: None)

    assert _post_indicator(client).json() == {"error": "Stock data not available"}


@pytest.mark.parametrize(
    "label,score,rsi,owned,expected",
    [
        ("positive", 0.9, 50.0, False, "Buy"),
        ("positive", 0.9, 50.0, True, "Buy"),
        ("negative", 0.9, 50.0, False, "Avoid"),
        ("negative", 0.9, 50.0, True, "Sell"),
        ("neutral", 0.9, 50.0, True, "Hold"),
        ("neutral", 0.9, 50.0, False, "No Action"),
    ],
)
def test_indicator_trade_decision_matrix(
    client, main, monkeypatch, labelled_pipeline, label, score, rsi, owned, expected
):
    monkeypatch.setattr(main, "fetch_news", lambda c: ["headline"])
    monkeypatch.setattr(main, "fetch_stock_indicators", lambda t: _indicator_row(rsi))
    main.sentiment_pipeline = labelled_pipeline([(label, score)])

    assert _post_indicator(client, owned).json()["trade_decision"] == expected


def test_indicator_overbought_blocks_a_buy(client, main, monkeypatch, labelled_pipeline):
    """RSI >= 70 means positive sentiment must not produce a Buy."""
    monkeypatch.setattr(main, "fetch_news", lambda c: ["headline"])
    monkeypatch.setattr(main, "fetch_stock_indicators", lambda t: _indicator_row(85.0))
    main.sentiment_pipeline = labelled_pipeline([("positive", 0.9)])

    assert _post_indicator(client).json()["trade_decision"] == "No Action"


def test_indicator_returns_rounded_indicator_payload(
    client, main, monkeypatch, labelled_pipeline
):
    monkeypatch.setattr(main, "fetch_news", lambda c: ["headline"])
    monkeypatch.setattr(main, "fetch_stock_indicators", lambda t: _indicator_row(55.555))
    main.sentiment_pipeline = labelled_pipeline([("positive", 0.9)])

    body = _post_indicator(client).json()

    assert body["company"] == "Reliance"
    assert body["ticker"] == "RELIANCE.NS"
    # 55.55, not 55.56: 55.555 is not exactly representable in binary and its
    # nearest double sits just below the midpoint, so round() goes down. Worth
    # pinning — these are prices and indicators, and the same effect applies to
    # every rounded field in this payload.
    assert body["RSI"] == 55.55
    assert body["Bollinger_Bands"] == {"Low": 90.0, "Mid": 100.0, "Up": 110.0}
    assert body["impact"] == 9.0  # 0.9 * 10


def test_indicator_rejects_a_malformed_body(client):
    r = client.post("/Indicotor", json={"company": "Reliance"})
    assert r.status_code == 422  # pydantic validation still produces a real code


# ---------------------------------------------- /predict and /predict_stock


def _fake_yf(days=90):
    return FakeYFinance(
        download_frame=ohlcv(days=days),
        history_frame=history_2d(prev_close=100.0, last_close=110.0),
    )


def test_predict_reports_unavailable_stock_data(client, main, monkeypatch):
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=pd.DataFrame()))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    body = client.get("/predict_stock?ticker=RELIANCE.NS").json()

    assert body == {"error": "Stock data not available"}


def test_predict_reports_insufficient_training_data(client, main, monkeypatch):
    """Fewer rows than forecast_out leaves no row with a known future target."""
    monkeypatch.setattr(
        main, "yf", FakeYFinance(download_frame=ohlcv(days=3), history_frame=history_2d())
    )
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    body = client.get("/predict_stock?ticker=RELIANCE.NS&forecast_out=7").json()

    assert body == {"error": "Not enough data to train the model"}


def test_predict_returns_history_and_forecast(client, main, monkeypatch):
    monkeypatch.setattr(main, "yf", _fake_yf())
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    body = client.get("/predict_stock?ticker=RELIANCE.NS&forecast_out=7").json()

    assert body["name"] == "RELIANCE.NS"
    assert body["curprice"] == 110.0
    assert len(body["Hdata"]) == 90
    assert all(p["type"] == "historical" for p in body["Hdata"])

    predictions = [p for p in body["data"] if p["type"] == "prediction"]
    assert len(predictions) == 7
    assert len(body["data"]) == 97
    assert body["stock_prices"][0]["color"] == "green"


def test_predict_forecast_dates_skip_weekends_and_market_holidays(
    client, main, monkeypatch
):
    monkeypatch.setattr(main, "yf", _fake_yf())
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    body = client.get("/predict_stock?ticker=RELIANCE.NS&forecast_out=7").json()
    dates = [p["date"] for p in body["data"] if p["type"] == "prediction"]

    assert dates == sorted(dates)
    for d in dates:
        ts = pd.Timestamp(d)
        assert ts.weekday() < 5, f"{d} falls on a weekend"
        assert d not in main.MARKET_HOLIDAYS_2025, f"{d} is a market holiday"


def test_predict_sentiment_shifts_the_forecast(client, main, monkeypatch, labelled_pipeline):
    """Predictions are scaled by (1 + sentiment * 0.1); positive news lifts them."""
    monkeypatch.setattr(main, "yf", _fake_yf())
    monkeypatch.setattr(main, "fetch_news", lambda c: ["Great results"])

    main.sentiment_pipeline = labelled_pipeline([("neutral", 1.0)])
    flat = client.get("/predict_stock?ticker=RELIANCE.NS").json()

    main.sentiment_pipeline = labelled_pipeline([("positive", 0.8)])
    bullish = client.get("/predict_stock?ticker=RELIANCE.NS").json()

    assert flat["sentiment_score"] == 0.0
    assert bullish["sentiment_score"] == pytest.approx(0.8)
    assert bullish["adjustment_factor"] == pytest.approx(0.08)

    flat_first = [p for p in flat["data"] if p["type"] == "prediction"][0]["price"]
    bull_first = [p for p in bullish["data"] if p["type"] == "prediction"][0]["price"]
    assert bull_first > flat_first


def test_predict_downloads_the_same_ticker_twice(client, main, monkeypatch):
    """CHARACTERISES PERF-02: one yf.download plus a separate yf.Ticker call.

    Phase 4 derives current price from the frame already downloaded; when it
    does, `ticker_calls` should be empty and this test should fail.
    """
    fake = _fake_yf()
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    client.get("/predict_stock?ticker=RELIANCE.NS")

    assert [t for t, _ in fake.download_calls] == ["RELIANCE.NS"]
    assert fake.ticker_calls == ["RELIANCE.NS"]


def test_predict_post_and_get_agree(client, main, monkeypatch):
    """The GET wrapper must delegate to the POST handler, not diverge from it."""
    monkeypatch.setattr(main, "yf", _fake_yf())
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    got = client.get(
        "/predict_stock?ticker=RELIANCE.NS&start_date=2025-01-01"
        "&end_date=2025-06-01&forecast_out=5"
    ).json()
    posted = client.post(
        "/predict",
        json={
            "ticker": "RELIANCE.NS",
            "start_date": "2025-01-01",
            "end_date": "2025-06-01",
            "forecast_out": 5,
        },
    ).json()

    assert got["Hdata"] == posted["Hdata"]
    assert got["curprice"] == posted["curprice"]
    assert len(got["data"]) == len(posted["data"])


def test_predict_returns_200_with_error_key_on_failure(client, main, monkeypatch):
    """CHARACTERISES ERR-01."""

    class Exploding(FakeYFinance):
        def download(self, *a, **kw):
            raise RuntimeError("network unreachable")

    monkeypatch.setattr(main, "yf", Exploding())
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get("/predict_stock?ticker=RELIANCE.NS")

    assert r.status_code == 200
    assert "network unreachable" in r.json()["error"]
