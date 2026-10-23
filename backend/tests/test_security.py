"""Regression tests for the findings in SECURITY_AUDIT.md.

Each test names the finding it guards and failed before that finding's fix.
"""

import inspect

import numpy as np
import pytest

from market_fixtures import FakeYFinance, ohlcv


# ------------------------------------------------- SEC-04: event-loop blocking


@pytest.mark.parametrize(
    "handler", ["predict_stock", "predict_stock_get", "get_stock_prices", "news_impact"]
)
def test_blocking_routes_are_sync_so_they_run_in_the_threadpool(main, handler):
    """An `async def` doing blocking I/O and CPU work stalls every other request."""
    assert not inspect.iscoroutinefunction(getattr(main, handler))


class LockCheckingYFinance(FakeYFinance):
    """Fails the request if yfinance is entered without holding the module lock.

    yf.download resets the global `shared._DFS` on every call, so two threads
    downloading at once can receive each other's tickers.
    """

    def __init__(self, main, **kw):
        super().__init__(**kw)
        self._main = main

    def download(self, *a, **kw):
        assert self._main._yf_lock.locked(), "yf.download called without _yf_lock"
        return super().download(*a, **kw)

    def Ticker(self, ticker):
        assert self._main._yf_lock.locked(), "yf.Ticker called without _yf_lock"
        return super().Ticker(ticker)


def test_predict_holds_the_yfinance_lock(client, main, monkeypatch):
    monkeypatch.setattr(main, "yf", LockCheckingYFinance(main, download_frame=ohlcv(90)))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    assert client.get("/predict_stock?ticker=RELIANCE.NS").status_code == 200


def test_stock_prices_holds_the_yfinance_lock(client, main, monkeypatch):
    monkeypatch.setattr(main, "yf", LockCheckingYFinance(main, download_frame=ohlcv(5)))
    monkeypatch.setattr(main.Config, "STOCK_TICKERS", {"A": "A.NS"})
    main._quote_cache.update({"key": None, "at": 0.0, "value": None})

    assert client.get("/stock-prices").status_code == 200


def test_indicators_hold_the_yfinance_lock(main, monkeypatch):
    monkeypatch.setattr(main, "yf", LockCheckingYFinance(main, history_frame=ohlcv(90)))

    assert main.fetch_stock_indicators("RELIANCE.NS") is not None


# ---------------------------------------------- SEC-05: unbounded input sizes


@pytest.mark.parametrize(
    "query",
    [
        "ticker=A%20B%20C",  # yf.download treats spaces as a list of tickers
        "ticker=A,B",
        "ticker=" + "X" * 21,
        "ticker=RELIANCE.NS&forecast_out=0",
        "ticker=RELIANCE.NS&forecast_out=-1",
        "ticker=RELIANCE.NS&forecast_out=31",
        "ticker=RELIANCE.NS&start_date=yesterday",
        "ticker=RELIANCE.NS&start_date=2025-02-01&end_date=2025-01-01",
    ],
)
def test_predict_get_rejects_out_of_bounds_input(client, main, monkeypatch, query):
    fake = FakeYFinance(download_frame=ohlcv(90))
    monkeypatch.setattr(main, "yf", fake)
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get(f"/predict_stock?{query}")

    assert r.status_code == 422
    assert fake.download_calls == []


def test_predict_post_rejects_a_reversed_date_range(client, main, monkeypatch):
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=ohlcv(90)))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.post(
        "/predict",
        json={"ticker": "TCS.NS", "start_date": "2025-06-01", "end_date": "2025-06-01"},
    )

    assert r.status_code == 422


@pytest.mark.parametrize("ticker", ["M&M.NS", "^NSEI", "BRK-B", "EURUSD=X"])
def test_predict_accepts_real_yahoo_symbols(client, main, monkeypatch, ticker):
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=ohlcv(90)))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get("/predict_stock", params={"ticker": ticker})

    assert r.status_code == 200


@pytest.mark.parametrize(
    "body",
    [
        {"company": "Reliance", "ticker": "A B", "owned_stock": False},
        {"company": "R" * 101, "ticker": "RELIANCE.NS", "owned_stock": False},
        {"company": "", "ticker": "RELIANCE.NS", "owned_stock": False},
    ],
)
def test_indicator_rejects_out_of_bounds_input(client, main, monkeypatch, body):
    monkeypatch.setattr(main, "fetch_news", lambda c: pytest.fail("fetched news"))

    assert client.post("/Indicotor", json=body).status_code == 422


def test_news_impact_rejects_an_overlong_company(client, main, monkeypatch):
    monkeypatch.setattr(main, "fetch_news", lambda c: pytest.fail("fetched news"))

    assert client.get("/news-impact/" + "R" * 101).status_code == 422


def test_svr_trains_on_at_most_max_training_rows(client, main, monkeypatch):
    """A wide date range must not turn one request into a minutes-long SVR fit."""
    fitted = {}

    class RecordingSVR:
        def __init__(self, *a, **kw):
            pass

        def fit(self, X, y):
            fitted["rows"] = len(X)
            return self

        def predict(self, X):
            return np.full(len(X), 100.0)

    monkeypatch.setattr(main, "SVR", RecordingSVR)
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=ohlcv(4000)))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    r = client.get("/predict_stock?ticker=TCS.NS&start_date=2000-01-01")

    assert r.status_code == 200
    assert fitted["rows"] <= main.MAX_TRAINING_ROWS
    # History is not truncated, only the training window.
    assert len(r.json()["Hdata"]) == 4000


# ------------------------------------------------------ SEC-06: rate limiting


def _expensive_limit(main):
    return int(main.Config.RATE_LIMIT_EXPENSIVE.split("/")[0])


def test_expensive_routes_share_one_per_ip_budget(client, main, monkeypatch):
    """Forecasts, indicators and news each spend a NewsData credit and CPU."""
    monkeypatch.setattr(main, "yf", FakeYFinance(download_frame=ohlcv(90)))
    monkeypatch.setattr(main, "fetch_news", lambda c: [])

    for _ in range(_expensive_limit(main)):
        assert client.get("/news-impact/TCS").status_code == 200

    blocked = client.get("/predict_stock?ticker=TCS.NS")
    assert blocked.status_code == 429
    assert "too many requests" in blocked.json()["detail"].lower()


def test_cheap_routes_are_not_rate_limited(client, main, monkeypatch):
    monkeypatch.setattr(main, "fetch_news", lambda c: [])
    for _ in range(_expensive_limit(main)):
        client.get("/news-impact/TCS")

    assert client.get("/health").status_code == 200


# ------------------------------------------- SEC-11: CORS wildcard + credentials


def test_cors_never_grants_credentials_to_an_arbitrary_origin(client):
    """Starlette reflects any Origin when '*' is combined with allow_credentials."""
    r = client.options(
        "/predict_stock",
        headers={
            "Origin": "https://evil.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert r.headers.get("access-control-allow-credentials") != "true"
