"""Synthetic yfinance-shaped data.

Column layout matches what `main.py` expects: flat OHLCV columns on a
DatetimeIndex. Note that recent yfinance versions return a *MultiIndex* for
single-ticker downloads; `main.py` does not handle that, so these fixtures
deliberately model the shape the code assumes rather than the one the library
may actually return.
"""

import numpy as np
import pandas as pd


def ohlcv(days=90, start="2025-01-01", base=100.0, step=1.0, volume=1_000_000):
    """A rising OHLCV frame on business days."""
    idx = pd.bdate_range(start=start, periods=days)
    close = base + np.arange(days, dtype=float) * step
    return pd.DataFrame(
        {
            "Open": close - 0.5,
            "High": close + 1.0,
            "Low": close - 1.0,
            "Close": close,
            "Volume": np.full(days, volume, dtype=float),
        },
        index=idx,
    )


def history_2d(prev_close=100.0, last_close=110.0):
    """What `yf.Ticker(...).history(period="2d")` returns."""
    return pd.DataFrame(
        {"Close": [prev_close, last_close]},
        index=pd.bdate_range(start="2025-06-02", periods=2),
    )


class FakeTicker:
    """Stands in for `yf.Ticker`."""

    def __init__(self, frame):
        self._frame = frame

    def __call__(self, *_args, **_kwargs):
        return self

    def history(self, *_args, **_kwargs):
        return self._frame


class FakeYFinance:
    """Stands in for the `yf` module as `main.py` uses it."""

    def __init__(self, download_frame=None, history_frame=None):
        self._download_frame = (
            download_frame if download_frame is not None else pd.DataFrame()
        )
        self._history_frame = (
            history_frame if history_frame is not None else pd.DataFrame()
        )
        self.download_calls = []
        self.ticker_calls = []

    def download(self, ticker, *_args, **kwargs):
        self.download_calls.append((ticker, kwargs))
        return self._download_frame.copy()

    def Ticker(self, ticker):
        self.ticker_calls.append(ticker)
        return FakeTicker(self._history_frame.copy())
