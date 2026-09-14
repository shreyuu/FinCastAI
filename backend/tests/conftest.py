"""Shared fixtures.

`main.py` builds the FinBERT pipeline at module scope (line 26), so importing
it normally pulls a ~440 MB model off disk or the network. Tests stub
`transformers.pipeline` *before* the first `import main` so the suite stays
offline and fast. Individual tests then set `main.sentiment_pipeline` to
whatever they need.
"""

import sys
from pathlib import Path

import pytest

# `main` uses a relative import (`from .config import Config`), so it must be
# imported as `app.main` with backend/ on the path -- the same way
# `uvicorn app.main:app` loads it.
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))


class StubPipeline:
    """Stands in for a transformers text-classification pipeline.

    Returns one neutral result per input, which is what a test gets unless it
    overrides `main.sentiment_pipeline` with something more specific.
    """

    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs

    def __call__(self, inputs, *args, **kwargs):
        if isinstance(inputs, str):
            inputs = [inputs]
        return [{"label": "neutral", "score": 1.0} for _ in inputs]


def _install_transformers_stub():
    import transformers

    transformers.pipeline = lambda *a, **kw: StubPipeline(*a, **kw)


_install_transformers_stub()

from app import main as main_module  # noqa: E402  (must follow the stub above)


@pytest.fixture
def main():
    """The imported `main` module, with its pipeline reset between tests."""
    main_module.sentiment_pipeline = StubPipeline()
    return main_module


@pytest.fixture
def client(main):
    from fastapi.testclient import TestClient

    with TestClient(main.app) as c:
        yield c


@pytest.fixture
def labelled_pipeline():
    """Build a stub pipeline returning fixed (label, score) pairs in order."""

    def _make(results):
        class _Fixed(StubPipeline):
            def __call__(self, inputs, *a, **kw):
                if isinstance(inputs, str):
                    inputs = [inputs]
                return [
                    {"label": lbl, "score": sc}
                    for (lbl, sc), _ in zip(results, inputs)
                ]

        return _Fixed()

    return _make
