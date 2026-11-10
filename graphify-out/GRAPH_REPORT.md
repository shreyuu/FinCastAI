# Graph Report - FinCastAI  (2026-11-10)

## Corpus Check
- 1 files · ~65,304 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 589 nodes · 861 edges · 37 communities (34 shown, 3 thin omitted)
- Extraction: 88% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 99 edges (avg confidence: 0.9)
- Token cost: 142,332 input · 0 output

## Community Hubs (Navigation)
- Backend API Core
- Frontend Lint Tooling
- Helper And Indicator Tests
- React Dashboard Pages
- Frontend Runtime Deps
- Fake yfinance Test Fixtures
- Auth Server And DB
- Security Regression Tests
- Frontend TS Config
- Auth Architecture And Bugs
- Auth Server Deps
- SVM Research Script
- Launch Video Frames
- Video Composition Scenes
- Server TS Config
- News API And Rate Limits
- Forecast Model Design
- Test Bootstrap And Stubs
- Node TS Config
- Fake Ticker History
- Predict Endpoint Tests
- Hyperframes Project Config
- Composition Package Scripts
- Auth Accounts And Password Reset
- Test Suite And Counts
- yfinance Shape Regressions
- Launch Video Plan
- Frontend Shell And Search
- Growth Illustration Asset
- FinBERT Batching Test
- CORS Credentials Test
- Vite Logo

## God Nodes (most connected - your core abstractions)
1. `FakeYFinance` - 31 edges
2. `FinCastAI security and logic audit (2026-10-23)` - 31 edges
3. `ohlcv()` - 19 edges
4. `compilerOptions` - 19 edges
5. `_predict()` - 16 edges
6. `labelled_pipeline()` - 15 edges
7. `Prediction API (FastAPI)` - 14 edges
8. `predict_stock_get()` - 13 edges
9. `FinBERT Sentiment` - 11 edges
10. `multi_ohlcv()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `_predict()` --references--> `FinBERT Sentiment`  [EXTRACTED]
  backend/app/main.py → README.md
- `_predict()` --references--> `NSE Holiday Calendar (2025)`  [EXTRACTED]
  backend/app/main.py → README.md
- `_predict()` --implements--> `Sentiment Forecast Adjustment (1 + 0.1 x s)`  [EXTRACTED]
  backend/app/main.py → README.md
- `_predict()` --implements--> `SVR Forecaster`  [EXTRACTED]
  backend/app/main.py → README.md
- `_predict()` --references--> `Yahoo Finance (yfinance)`  [EXTRACTED]
  backend/app/main.py → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brag Launch Video Sequence (empty, loading, draw, forecast, end card)** — brag_output_composition_snapshots_frame_00_at_5_3s_empty_chart_state, brag_output_composition_snapshots_frame_01_at_6_6s_loading_chart_state, brag_output_composition_snapshots_frame_02_at_7_5s_historical_line_draw, brag_output_composition_snapshots_frame_03_at_9_5s_predicted_price_reveal, brag_output_composition_snapshots_frame_04_at_19_497s_end_card [EXTRACTED 1.00]
- **Brag video four-scene composition** — brag_output_composition_index_scene_1_handoff, brag_output_composition_index_scene_2_dashboard, brag_output_composition_index_scene_3_the_call, brag_output_composition_index_scene_4_receipts [EXTRACTED 1.00]
- **FinCastAI Dashboard Layout Components** — brag_output_brag_sidebar_navigation, brag_output_brag_welcome_summary_card, brag_output_brag_ticker_search, brag_output_brag_timeframe_selector, brag_output_brag_price_forecast_chart [EXTRACTED 1.00]
- **Forecast pipeline (predict_stock steps)** — readme_yahoo_finance, readme_newsdata_io, readme_finbert_sentiment, readme_svr_forecaster, readme_sentiment_forecast_adjustment, readme_nse_holiday_calendar [EXTRACTED 1.00]
- **Forecast pipeline in _predict** — backend_app_main_predict, readme_yahoo_finance, readme_finbert_sentiment, readme_svr_forecaster, readme_sentiment_forecast_adjustment, readme_nse_holiday_calendar [EXTRACTED 1.00]
- **Operator-only password reset path** — readme_bcrypt_forced_reset, readme_migration_001, readme_set_password_cli, readme_mysql_users_table [EXTRACTED 1.00]
- **Trade call flow (/Indicotor)** — readme_indicotor_endpoint, readme_technical_indicators, readme_finbert_sentiment, readme_trade_call_rule [EXTRACTED 1.00]
- **API abuse hardening (threadpool, input bounds, rate limits)** — security_audit_sec_04, security_audit_sec_05, security_audit_sec_06, readme_rate_limits, backend_requirements_slowapi [INFERRED 0.85]

## Communities (37 total, 3 thin omitted)

### Community 0 - "Backend API Core"
Cohesion: 0.05
Nodes (60): Config, Centralized configuration for the backend application, Prints key configuration values for debugging, analyze_sentiment(), BollingerBands, _closes_for(), fetch_news(), _fetch_quotes() (+52 more)

### Community 1 - "Frontend Lint Tooling"
Cohesion: 0.04
Nodes (48): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+40 more)

### Community 2 - "Helper And Indicator Tests"
Cohesion: 0.06
Nodes (38): get_next_business_days(), labelled_pipeline(), Build a stub pipeline returning fixed (label, score) pairs in order., _indicator_row(), _post_indicator(), parametrize, A single positive article at score 0.9 yields 0.9 * IMPACT_SCALE = 18.0., ERR-01 fixed: an unknown ticker is a 404, not a 200 with an error key. (+30 more)

### Community 3 - "React Dashboard Pages"
Cohesion: 0.11
Nodes (23): App(), navItems, Sidebar(), capitalizeFirst(), StockDashboard(), StockDataPoint, ZOOM_LEVELS, HomePage() (+15 more)

### Community 4 - "Frontend Runtime Deps"
Cohesion: 0.06
Nodes (31): axios, author, dependencies, axios, lucide-react, react, react-dom, react-router-dom (+23 more)

### Community 5 - "Fake yfinance Test Fixtures"
Cohesion: 0.12
Nodes (22): FakeYFinance, multi_ohlcv(), A batched, MultiIndex-column download like yf.download(multiple tickers).…, Stands in for the `yf` module as `main.py` uses it., Characterisation tests for the four served endpoints plus /health. As of phase…, ERR-01 fixed: upstream failure is a real status code, not a 200., Fewer rows than forecast_out leaves no row with a known future target., The broad handler must re-raise HTTPException, not swallow it. (+14 more)

### Community 6 - "Auth Server And DB"
Cohesion: 0.09
Nodes (21): main(), promptHidden(), missing, pool, required, ALLOWED_ORIGINS, app, GENDERS (+13 more)

### Community 7 - "Security Regression Tests"
Cohesion: 0.13
Nodes (21): ohlcv(), A rising OHLCV frame on business days., _expensive_limit(), LockCheckingYFinance, parametrize, Regression tests for the findings in SECURITY_AUDIT.md. Each test names the…, A wide date range must not turn one request into a minutes-long SVR fit., Forecasts, indicators and news each spend a NewsData credit and CPU. (+13 more)

### Community 8 - "Frontend TS Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+17 more)

### Community 9 - "Auth Architecture And Bugs"
Cohesion: 0.11
Nodes (25): fastapi, yfinance, No Real Sessions, GET /predict_stock, Prediction API (FastAPI), Real Status Codes, Yahoo Finance (yfinance), BUG-02 forecast_out <= 0 crashes or returns garbage (+17 more)

### Community 10 - "Auth Server Deps"
Cohesion: 0.08
Nodes (24): bcryptjs, cors, express, express-rate-limit, mysql2, author, dependencies, bcryptjs (+16 more)

### Community 11 - "SVM Research Script"
Cohesion: 0.14
Nodes (13): Any, main(), DataFrame, Prepare data for SVM models. Returns: Tuple containing: - X (np.ndarray):…, Train SVR and SVC models. Args: perform_gridsearch (bool): Whether to perform…, Make predictions using trained models. Returns: Dict[str, Any]: Dictionary…, Plot the predictions. Args: predictions (Dict[str, Any]): Dictionary containing…, Initialize the StockPredictor class. Args: ticker (str): Stock ticker symbol… (+5 more)

### Community 12 - "Launch Video Frames"
Cohesion: 0.17
Nodes (20): Brag Poster (FinCastAI Dashboard, TCS.NS forecast), FinCastAI Dashboard UI, Historical vs Predicted Price Chart, Sidebar Navigation (Dashboard, Indicators, News, Portfolio), Stock Ticker Search (TCS.NS), Timeframe Selector (Month), Welcome Summary Card (Last close, Today's move), Launch Video Contact Sheet (5 frames) (+12 more)

### Community 13 - "Video Composition Scenes"
Cohesion: 0.17
Nodes (19): ta, Music beat grid (114.84 BPM, 1.60 + n x 0.5226), Brag Plan: FinCastAI, Dual-line chart handoff (solid #10B981 history -> dashed #FF9933 forecast), Angle: a forecaster that shows its work, Four-scene storyboard (handoff, search, call, receipts), Subtle audio-reactive treatment (bass/mid/treble, no visualizer), Hyperframes Composition Brief: FinCastAI (+11 more)

### Community 14 - "Server TS Config"
Cohesion: 0.14
Nodes (13): dist, node_modules, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+5 more)

### Community 15 - "News API And Rate Limits"
Cohesion: 0.21
Nodes (13): requests, backend/requirements.txt (unpinned runtime deps), slowapi, torch, transformers, GET /news-impact/{company}, NewsData.io, Rate Limits (+5 more)

### Community 16 - "Forecast Model Design"
Cohesion: 0.15
Nodes (13): scikit-learn, Batch the Slow Parts, FinBERT Sentiment, Hugging Face Hub, Market Snapshot, Sentiment Forecast Adjustment (1 + 0.1 x s), GET /stock-prices, svm.py SVC Research Script (+5 more)

### Community 17 - "Test Bootstrap And Stubs"
Cohesion: 0.21
Nodes (8): client(), _install_transformers_stub(), main(), Shared fixtures. `main.py` builds the FinBERT pipeline at module scope (line…, Stands in for a transformers text-classification pipeline. Returns one neutral…, The imported `main` module, with its pipeline and rate limits reset between…, StubPipeline, fixture

### Community 18 - "Node TS Config"
Cohesion: 0.18
Nodes (10): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, tsBuildInfoFile (+2 more)

### Community 19 - "Fake Ticker History"
Cohesion: 0.20
Nodes (5): FakeTicker, history_2d(), Synthetic yfinance-shaped data. `ohlcv` builds flat OHLCV columns on a…, What `yf.Ticker(...).history(period="2d")` returns., Stands in for `yf.Ticker`.

### Community 20 - "Predict Endpoint Tests"
Cohesion: 0.22
Nodes (9): _fake_yf(), Predictions are scaled by (1 + sentiment * 0.1); positive news lifts them., PERF-02 fixed: current price comes from the frame already downloaded., The GET wrapper must delegate to the POST handler, not diverge from it., test_predict_fetches_the_ticker_exactly_once(), test_predict_forecast_dates_skip_weekends_and_market_holidays(), test_predict_post_and_get_agree(), test_predict_returns_history_and_forecast() (+1 more)

### Community 21 - "Hyperframes Project Config"
Cohesion: 0.22
Nodes (8): media, autoProxy, paths, assets, blocks, components, registry, $schema

### Community 22 - "Composition Package Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, check, dev, publish, render, type

### Community 23 - "Auth Accounts And Password Reset"
Cohesion: 0.36
Nodes (8): Auth Server (Express), bcrypt with Forced-Reset Path, Migration 001 (force password reset), MySQL users table, set-password CLI, BUG-03 Single MySQL connection never reconnects, SEC-03 mysql2 object-expansion SQL semantic injection, SEC-09 Account enumeration

### Community 24 - "Test Suite And Counts"
Cohesion: 0.29
Nodes (7): httpx (for fastapi.testclient), pytest, backend/requirements-dev.txt (test deps), Scene 4: receipts outro (#s4), Claim: 62 tests, Offline Tests, Test counts after fixes (pytest 84, server vitest 51, frontend vitest 5)

### Community 25 - "yfinance Shape Regressions"
Cohesion: 0.33
Nodes (6): `frame` in the shape yf.download(ticker) returns today: ('Close', 'TCS.NS')…, single_ticker_download(), BUG-08: yfinance >= 0.2.51 returns ('Close', 'TCS.NS') columns for one ticker.…, BUG-09: Yahoo can return the current, unfinished session with a NaN Close. The…, test_predict_handles_yfinance_multiindex_columns(), test_predict_skips_a_session_with_no_close_yet()

### Community 26 - "Launch Video Plan"
Cohesion: 0.40
Nodes (6): Audio restraint rule (nothing implies a payoff), Video compliance note, SFX audio cues (13 interface/keyboard/impact clips), Launch share copy, Disclaimer, FinCastAI

### Community 27 - "Frontend Shell And Search"
Cohesion: 0.47
Nodes (6): TCS -> TCS.NS auto-suffix on blur (handleBlur), Scene 2: search a ticker, dashboard recreation (#s2), Vite entry HTML (#root mount, /src/main.tsx), Type-aware ESLint configuration (recommendedTypeChecked), React + TypeScript + Vite template README, React Frontend

### Community 28 - "Growth Illustration Asset"
Cohesion: 0.67
Nodes (3): Collaborative Teamwork Metaphor, Team Climbing Growth Chart Illustration, Upward Growth Trend (rising bars + arrow)

## Ambiguous Edges - Review These
- `Welcome Summary Card (Last close, Today's move)` → `Video Frame 03 at 9.5s`  [AMBIGUOUS]
  brag-output/brag.jpg · relation: conceptually_related_to
- `Claim: 62 tests` → `Test counts after fixes (pytest 84, server vitest 51, frontend vitest 5)`  [AMBIGUOUS]
  brag-output/share-copy.txt · relation: conceptually_related_to
- `Type-aware ESLint configuration (recommendedTypeChecked)` → `React Frontend`  [AMBIGUOUS]
  frontend/README.md · relation: conceptually_related_to

## Knowledge Gaps
- **153 isolated node(s):** `StockDataPoint`, `StockCardData`, `StockResponse`, `NewsReason`, `PortfolioStock` (+148 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Welcome Summary Card (Last close, Today's move)` and `Video Frame 03 at 9.5s`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Claim: 62 tests` and `Test counts after fixes (pytest 84, server vitest 51, frontend vitest 5)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Type-aware ESLint configuration (recommendedTypeChecked)` and `React Frontend`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `dependencies` connect `Auth Server Deps` to `Backend API Core`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **Why does `dotenv` connect `Backend API Core` to `Auth Server Deps`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FakeYFinance` (e.g. with `test_predict_returns_502_when_the_upstream_fails()` and `test_stock_prices_returns_502_when_the_upstream_fails()`) actually correct?**
  _`FakeYFinance` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `StockDataPoint`, `StockCardData`, `StockResponse` to the rest of the system?**
  _153 weakly-connected nodes found - possible documentation gaps or missing edges._