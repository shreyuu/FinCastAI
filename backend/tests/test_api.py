"""Characterisation tests for the four served endpoints plus /health.

As of phase 4 these assert the intended contract: real HTTP status codes
(404 unknown ticker, 422 untrainable range, 502 upstream failure), declared
response models, and a single batched market-data call per request.
"""

import pandas as pd
import pytest

from market_fixtures import FakeYFinance, multi_ohlcv, ohlcv


# ---------------------------------------------------------------- /health


def test_health_returns_ok(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


# --------------------------------------------------------- /stock-prices


def test_stock_prices_reports_price_change_and_colour(client, main, monkeypatch):
    monkeypatch.setattr(
        main,
        "yf",
        FakeYFinance(download_frame=multi_ohlcv({"RELIANCE.NS": [100.0, 110.0]})),
    )
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"Reliance": "RELIANCE.NS"})

    body = client.get("/stock-prices").json()

    assert body["stocks"] == [
        {"name": "Reliance", "price": 110.0, "color": "green", "percent_change": 10.0}
    ]


def test_stock_prices_marks_a_fall_red(client, main, monkeypatch):
    monkeypatch.setattr(
        main, "yf", FakeYFinance(download_frame=multi_ohlcv({"TCS.NS": [100.0, 95.0]}))
    )
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"TCS": "TCS.NS"})

    stock = client.get("/stock-prices").json()["stocks"][0]

    assert stock["color"] == "red"
    assert stock["percent_change"] == -5.0


def test_stock_prices_falls_back_to_grey_with_insufficient_history(
    client, main, monkeypatch
):
    monkeypatch.setattr(
        main, "yf", FakeYFinance(download_frame=multi_ohlcv({"THIN.NS": [100.0]}))
    )
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"Thin": "THIN.NS"})

    stock = client.get("/stock-prices").json()["stocks"][0]

    assert stock == {
        "name": "Thin",
        "price": 100.0,
        "color": "grey",
        "percent_change": 0.0,
    }


def test_stock_prices_reports_zero_for_a_ticker_with_no_data(client, main, monkeypatch):
    monkeypatch.setattr(
        main, "yf", FakeYFinance(download_frame=multi_ohlcv({"REAL.NS": [100.0, 101.0]}))
    )
    monkeypatch.setattr(
        main.Config, "STOCK_TICKERS", {"Real": "REAL.NS", "Missing": "GONE.NS"}
    )

    stocks = {s["name"]: s for s in client.get("/stock-prices").json()["stocks"]}

    assert stocks["Missing"] == {
        "name": "Missing",
        "price": 0.0,
        "color": "grey",
        "percent_change": 0.0,
    }
    assert stocks["Real"]["price"] == 101.0


def test_stock_prices_makes_one_batched_call_for_every_ticker(client, main, monkeypatch):
    """PERF-01 fixed: one download for all tickers, not one call each."""
    fake = FakeYFinance(
        download_frame=multi_ohlcv(
            {"A.NS": [1.0, 2.0], "B.NS": [3.0, 4.0], "C.NS": [5.0, 6.0]}
        )
    )
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(
        main.Config, "STOCK_TICKERS", {"A": "A.NS", "B": "B.NS", "C": "C.NS"}
    )
    main._quote_cache.update({"key": None, "at": 0.0, "value": None})

    client.get("/stock-prices")

    assert fake.ticker_calls == [], "should not fall back to per-ticker yf.Ticker"
    assert len(fake.download_calls) == 1
    requested = fake.download_calls[0][0].split()
    assert sorted(requested) == ["A.NS", "B.NS", "C.NS"]


def test_stock_prices_serves_a_repeat_request_from_cache(client, main, monkeypatch):
    fake = FakeYFinance(download_frame=multi_ohlcv({"A.NS": [1.0, 2.0]}))
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"A": "A.NS"})
    main._quote_cache.update({"key": None, "at": 0.0, "value": None})

    first = client.get("/stock-prices").json()
    second = client.get("/stock-prices").json()

    assert first == second
    assert len(fake.download_calls) == 1, "second request should hit the cache"


def test_stock_prices_refetches_once_the_cache_expires(client, main, monkeypatch):
    fake = FakeYFinance(download_frame=multi_ohlcv({"A.NS": [1.0, 2.0]}))
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"A": "A.NS"})
    main._quote_cache.update({"key": None, "at": 0.0, "value": None})

    client.get("/stock-prices")
    # pretend the cached entry is older than its TTL
    main._quote_cache["at"] = main._quote_cache["at"] - (
        main.QUOTE_CACHE_TTL_SECONDS + 1
    )
    client.get("/stock-prices")

    assert len(fake.download_calls) == 2


def test_stock_prices_returns_502_when_the_upstream_fails(client, main, monkeypatch):
    """ERR-01 fixed: upstream failure is a real status code, not a 200."""

    class Exploding(FakeYFinance):
        def download(self, *a, **kw):
            raise RuntimeError("yfinance is down")

    monkeypatch.setattr(main, "yf", Exploding())
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"A": "A.NS"})
    main._quote_cache.update({"key": None, "at": 0.0, "value": None})

    r = client.get("/stock-prices")

    assert r.status_code == 502
    assert "yfinance is down" in r.json()["detail"]


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
    """A single positive article at score 0.9 yields 0.9 * IMPACT_SCALE = 18.0."""
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


def test_news_impact_returns_502_when_the_news_api_fails(client, main, monkeypatch):
    """ERR-01 fixed."""

    def boom(company):
        raise RuntimeError("news api down")

    monkeypatch.setattr(main, "fetch_news", boom)

    r = client.get("/news-impact/Reliance")

    assert r.status_code == 502
    assert "news api down" in r.json()["detail"]


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


def test_indicator_returns_404_for_an_unknown_ticker(client, main, monkeypatch):
    """ERR-01 fixed: an unknown ticker is a 404, not a 200 with an error key."""
    monkeypatch.setattr(main, "fetch_news", lambda c: [])
    monkeypatch.setattr(main, "fetch_stock_indicators", lambda t: None)

    r = _post_indicator(client)

    assert r.status_code == 404
    assert "RELIANCE.NS" in r.json()["detail"]


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
    return FakeYFinance(download_frame=ohlcv(days=days))


def test_predict_returns_404_for_an_unknown_ticker(client, main, monkeypatch):
    """ERR-01 fixed."""
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=pd.DataFrame()))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get("/predict_stock?ticker=NOSUCH.NS")

    assert r.status_code == 404
    assert "NOSUCH.NS" in r.json()["detail"]


def test_predict_returns_422_when_the_range_is_too_short_to_train(
    client, main, monkeypatch
):
    """Fewer rows than forecast_out leaves no row with a known future target."""
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=ohlcv(days=3)))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get("/predict_stock?ticker=RELIANCE.NS&forecast_out=7")

    assert r.status_code == 422
    assert "Widen the date range" in r.json()["detail"]


def test_predict_returns_history_and_forecast(client, main, monkeypatch):
    monkeypatch.setattr(main, "yf", _fake_yf())
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    body = client.get("/predict_stock?ticker=RELIANCE.NS&forecast_out=7").json()

    assert body["name"] == "RELIANCE.NS"
    # ohlcv() rises by 1.0/day from 100.0, so the final close is 189.0 and the
    # one before it 188.0 -- derived from the downloaded frame, not a second call.
    assert body["curprice"] == 189.0
    assert body["stock_prices"][0]["percent_change"] == pytest.approx(0.53, abs=0.01)
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


def test_predict_fetches_the_ticker_exactly_once(client, main, monkeypatch):
    """PERF-02 fixed: current price comes from the frame already downloaded."""
    fake = _fake_yf()
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    client.get("/predict_stock?ticker=RELIANCE.NS")

    assert [t for t, _ in fake.download_calls] == ["RELIANCE.NS"]
    assert fake.ticker_calls == [], "no second round trip for the current price"


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


def test_predict_returns_502_when_the_upstream_fails(client, main, monkeypatch):
    """ERR-01 fixed."""

    class Exploding(FakeYFinance):
        def download(self, *a, **kw):
            raise RuntimeError("network unreachable")

    monkeypatch.setattr(main, "yf", Exploding())
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get("/predict_stock?ticker=RELIANCE.NS")

    assert r.status_code == 502
    assert "network unreachable" in r.json()["detail"]


def test_predict_does_not_mask_a_404_as_a_502(client, main, monkeypatch):
    """The broad handler must re-raise HTTPException, not swallow it."""
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=pd.DataFrame()))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    assert client.get("/predict_stock?ticker=NOSUCH.NS").status_code == 404
