# Graph Report - FinCastAI  (2026-11-10)

## Corpus Check
- 84 files · ~65,304 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 589 nodes · 847 edges · 39 communities (36 shown, 3 thin omitted)
- Extraction: 88% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 96 edges (avg confidence: 0.9)
- Token cost: 460,544 input · 0 output

## Community Hubs (Navigation)
- Backend API Core
- Helper And Indicator Tests
- React Dashboard Pages
- Frontend Runtime Deps
- Fake yfinance Test Fixtures
- Frontend Lint Tooling
- Auth Server And DB
- Security Regression Tests
- Frontend TS Config
- Auth Server Deps
- SVM Research Script
- Auth Architecture And Bugs
- Auth Server Dev Deps
- Launch Video Frames
- Server TS Config
- Video Composition Scenes
- Test Bootstrap And Stubs
- News API And Rate Limits
- Forecast Model Design
- Launch Video Plan
- Node TS Config
- Fake Ticker History
- Prediction API And yfinance
- Predict Endpoint Tests
- Hyperframes Project Config
- Composition Package Scripts
- Test Suite And Counts
- yfinance Shape Regressions
- Auth Hardening Decisions
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
5. `labelled_pipeline()` - 15 edges
6. `predict_stock_get()` - 13 edges
7. `Prediction API (FastAPI :8000)` - 13 edges
8. `_predict()` - 10 edges
9. `multi_ohlcv()` - 10 edges
10. `compilerOptions` - 10 edges

## Surprising Connections (you probably didn't know these)
- `GET /predict_stock route` --references--> `predict_stock()`  [EXTRACTED]
  README.md → backend/app/main.py
- `Type-aware ESLint configuration (recommendedTypeChecked)` --conceptually_related_to--> `React frontend (Vite :5173)`  [AMBIGUOUS]
  frontend/README.md → README.md
- `BUG-06 Holiday calendar covers 2025 only` --semantically_similar_to--> `NSE holiday calendar (2025 only)`  [INFERRED] [semantically similar]
  SECURITY_AUDIT.md → README.md
- `SEC-17 No server-side session` --semantically_similar_to--> `No real sessions (localStorage identity)`  [INFERRED] [semantically similar]
  SECURITY_AUDIT.md → README.md
- `FinCastAI security and logic audit (2026-10-23)` --references--> `FinCastAI`  [INFERRED]
  SECURITY_AUDIT.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Forecast pipeline (predict_stock steps)** — readme_yahoo_finance, readme_newsdata_io, readme_finbert_sentiment, readme_svr_forecaster, readme_sentiment_forecast_adjustment, readme_nse_holiday_calendar [EXTRACTED 1.00]
- **API abuse hardening (threadpool, input bounds, rate limits)** — security_audit_sec_04, security_audit_sec_05, security_audit_sec_06, readme_rate_limits, backend_requirements_slowapi [INFERRED 0.85]
- **Brag video four-scene composition** — brag_output_composition_index_scene_1_handoff, brag_output_composition_index_scene_2_dashboard, brag_output_composition_index_scene_3_the_call, brag_output_composition_index_scene_4_receipts [EXTRACTED 1.00]
- **Brag Launch Video Sequence (empty, loading, draw, forecast, end card)** — brag_output_composition_snapshots_frame_00_at_5_3s_empty_chart_state, brag_output_composition_snapshots_frame_01_at_6_6s_loading_chart_state, brag_output_composition_snapshots_frame_02_at_7_5s_historical_line_draw, brag_output_composition_snapshots_frame_03_at_9_5s_predicted_price_reveal, brag_output_composition_snapshots_frame_04_at_19_497s_end_card [EXTRACTED 1.00]
- **FinCastAI Dashboard Layout Components** — brag_output_brag_sidebar_navigation, brag_output_brag_welcome_summary_card, brag_output_brag_ticker_search, brag_output_brag_timeframe_selector, brag_output_brag_price_forecast_chart [EXTRACTED 1.00]

## Communities (39 total, 3 thin omitted)

### Community 0 - "Backend API Core"
Cohesion: 0.05
Nodes (58): Config, Centralized configuration for the backend application, Prints key configuration values for debugging, analyze_sentiment(), BollingerBands, _closes_for(), fetch_news(), _fetch_quotes() (+50 more)

### Community 1 - "Helper And Indicator Tests"
Cohesion: 0.06
Nodes (38): get_next_business_days(), labelled_pipeline(), Build a stub pipeline returning fixed (label, score) pairs in order., _indicator_row(), _post_indicator(), parametrize, A single positive article at score 0.9 yields 0.9 * IMPACT_SCALE = 18.0., ERR-01 fixed: an unknown ticker is a 404, not a 200 with an error key. (+30 more)

### Community 2 - "React Dashboard Pages"
Cohesion: 0.11
Nodes (23): App(), navItems, Sidebar(), capitalizeFirst(), StockDashboard(), StockDataPoint, ZOOM_LEVELS, HomePage() (+15 more)

### Community 3 - "Frontend Runtime Deps"
Cohesion: 0.06
Nodes (31): axios, author, dependencies, axios, lucide-react, react, react-dom, react-router-dom (+23 more)

### Community 4 - "Fake yfinance Test Fixtures"
Cohesion: 0.12
Nodes (22): FakeYFinance, multi_ohlcv(), A batched, MultiIndex-column download like yf.download(multiple tickers).…, Stands in for the `yf` module as `main.py` uses it., Characterisation tests for the four served endpoints plus /health. As of phase…, ERR-01 fixed: upstream failure is a real status code, not a 200., Fewer rows than forecast_out leaves no row with a known future target., The broad handler must re-raise HTTPException, not swallow it. (+14 more)

### Community 5 - "Frontend Lint Tooling"
Cohesion: 0.07
Nodes (29): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+21 more)

### Community 6 - "Auth Server And DB"
Cohesion: 0.09
Nodes (21): main(), promptHidden(), missing, pool, required, ALLOWED_ORIGINS, app, GENDERS (+13 more)

### Community 7 - "Security Regression Tests"
Cohesion: 0.13
Nodes (21): ohlcv(), A rising OHLCV frame on business days., _expensive_limit(), LockCheckingYFinance, parametrize, Regression tests for the findings in SECURITY_AUDIT.md. Each test names the…, A wide date range must not turn one request into a minutes-long SVR fit., Forecasts, indicators and news each spend a NewsData credit and CPU. (+13 more)

### Community 8 - "Frontend TS Config"
Cohesion: 0.08
Nodes (25): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+17 more)

### Community 9 - "Auth Server Deps"
Cohesion: 0.08
Nodes (24): bcryptjs, cors, express, express-rate-limit, mysql2, author, dependencies, bcryptjs (+16 more)

### Community 10 - "SVM Research Script"
Cohesion: 0.14
Nodes (13): Any, main(), DataFrame, Prepare data for SVM models. Returns: Tuple containing: - X (np.ndarray):…, Train SVR and SVC models. Args: perform_gridsearch (bool): Whether to perform…, Make predictions using trained models. Returns: Dict[str, Any]: Dictionary…, Plot the predictions. Args: predictions (Dict[str, Any]): Dictionary containing…, Initialize the StockPredictor class. Args: ticker (str): Stock ticker symbol… (+5 more)

### Community 11 - "Auth Architecture And Bugs"
Cohesion: 0.13
Nodes (21): Auth server (Express :3001), MySQL users table, No real sessions (localStorage identity), NSE holiday calendar (2025 only), GET /predict_stock route, BUG-02 forecast_out <= 0 crashes or returns garbage, BUG-03 Single MySQL connection never reconnects, BUG-05 Mismatched .env variable names (+13 more)

### Community 12 - "Auth Server Dev Deps"
Cohesion: 0.10
Nodes (21): devDependencies, supertest, ts-node, ts-node-dev, @types/bcryptjs, @types/cors, @types/express, @types/node (+13 more)

### Community 13 - "Launch Video Frames"
Cohesion: 0.17
Nodes (20): Brag Poster (FinCastAI Dashboard, TCS.NS forecast), FinCastAI Dashboard UI, Historical vs Predicted Price Chart, Sidebar Navigation (Dashboard, Indicators, News, Portfolio), Stock Ticker Search (TCS.NS), Timeframe Selector (Month), Welcome Summary Card (Last close, Today's move), Launch Video Contact Sheet (5 frames) (+12 more)

### Community 14 - "Server TS Config"
Cohesion: 0.14
Nodes (13): dist, node_modules, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir (+5 more)

### Community 15 - "Video Composition Scenes"
Cohesion: 0.21
Nodes (13): ta, Subtle audio-reactive treatment (bass/mid/treble, no visualizer), Hyperframes Composition Brief: FinCastAI, Visual identity tokens (#3b82f6 accent, #10B981/#FF9933 chart, Inter), apply() audio-reactive CSS var setter (--rms/--bass/--treb), Background music bed (#bgm, volume automation), Impact count-up tween (snap 0.1, onUpdate), GSAP main timeline (window.__timelines.main) (+5 more)

### Community 16 - "Test Bootstrap And Stubs"
Cohesion: 0.21
Nodes (8): client(), _install_transformers_stub(), main(), Shared fixtures. `main.py` builds the FinBERT pipeline at module scope (line…, Stands in for a transformers text-classification pipeline. Returns one neutral…, The imported `main` module, with its pipeline and rate limits reset between…, StubPipeline, fixture

### Community 17 - "News API And Rate Limits"
Cohesion: 0.21
Nodes (12): requests, backend/requirements.txt (unpinned runtime deps), slowapi, torch, transformers, NewsData.io, Per-IP in-memory rate limits, SEC-01 NewsData key in public git history (+4 more)

### Community 18 - "Forecast Model Design"
Cohesion: 0.17
Nodes (12): scikit-learn, Batch the slow parts, FinBERT news sentiment, Hugging Face Hub (FinBERT weights), Market snapshot (/stock-prices, 60s cache), Sentiment forecast adjustment (1 + 0.1 x s), svm.py SVC direction classifier (research, unused by API), SVR forecaster (RBF kernel, C=1e3, gamma=0.1) (+4 more)

### Community 19 - "Launch Video Plan"
Cohesion: 0.25
Nodes (11): Audio restraint rule (nothing implies a payoff), Music beat grid (114.84 BPM, 1.60 + n x 0.5226), Brag Plan: FinCastAI, Video compliance note, Dual-line chart handoff (solid #10B981 history -> dashed #FF9933 forecast), Four-scene storyboard (handoff, search, call, receipts), Scene 1: the handoff (#s1), SFX audio cues (13 interface/keyboard/impact clips) (+3 more)

### Community 20 - "Node TS Config"
Cohesion: 0.18
Nodes (10): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck, tsBuildInfoFile (+2 more)

### Community 21 - "Fake Ticker History"
Cohesion: 0.20
Nodes (5): FakeTicker, history_2d(), Synthetic yfinance-shaped data. `ohlcv` builds flat OHLCV columns on a…, What `yf.Ticker(...).history(period="2d")` returns., Stands in for `yf.Ticker`.

### Community 22 - "Prediction API And yfinance"
Cohesion: 0.28
Nodes (9): fastapi, yfinance, Prediction API (FastAPI :8000), Yahoo Finance (yfinance), BUG-08 yfinance MultiIndex columns break every forecast, BUG-09 NaN Close on unfinished session breaks JSON, SEC-04 Blocking work on the async event loop, SEC-20 Binds to all interfaces by default (+1 more)

### Community 23 - "Predict Endpoint Tests"
Cohesion: 0.22
Nodes (9): _fake_yf(), Predictions are scaled by (1 + sentiment * 0.1); positive news lifts them., PERF-02 fixed: current price comes from the frame already downloaded., The GET wrapper must delegate to the POST handler, not diverge from it., test_predict_fetches_the_ticker_exactly_once(), test_predict_forecast_dates_skip_weekends_and_market_holidays(), test_predict_post_and_get_agree(), test_predict_returns_history_and_forecast() (+1 more)

### Community 24 - "Hyperframes Project Config"
Cohesion: 0.22
Nodes (8): media, autoProxy, paths, assets, blocks, components, registry, $schema

### Community 25 - "Composition Package Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, check, dev, publish, render, type

### Community 26 - "Test Suite And Counts"
Cohesion: 0.29
Nodes (7): httpx (for fastapi.testclient), pytest, backend/requirements-dev.txt (test deps), Scene 4: receipts outro (#s4), Claim: 62 tests, Offline test suites (stubbed FinBERT, Yahoo, NewsData, MySQL), Test counts after fixes (pytest 84, server vitest 51, frontend vitest 5)

### Community 27 - "yfinance Shape Regressions"
Cohesion: 0.33
Nodes (6): `frame` in the shape yf.download(ticker) returns today: ('Close', 'TCS.NS')…, single_ticker_download(), BUG-08: yfinance >= 0.2.51 returns ('Close', 'TCS.NS') columns for one ticker.…, BUG-09: Yahoo can return the current, unfinished session with a NaN Close. The…, test_predict_handles_yfinance_multiindex_columns(), test_predict_skips_a_session_with_no_close_yet()

### Community 28 - "Auth Hardening Decisions"
Cohesion: 0.33
Nodes (6): Angle: a forecaster that shows its work, bcrypt with operator forced-reset path, Migration 001: force password reset, Real status codes (404/422/429/502), set-password operator CLI, SEC-10 Internal errors returned to clients

### Community 29 - "Frontend Shell And Search"
Cohesion: 0.47
Nodes (6): TCS -> TCS.NS auto-suffix on blur (handleBlur), Scene 2: search a ticker, dashboard recreation (#s2), Vite entry HTML (#root mount, /src/main.tsx), Type-aware ESLint configuration (recommendedTypeChecked), React + TypeScript + Vite template README, React frontend (Vite :5173)

### Community 30 - "Growth Illustration Asset"
Cohesion: 0.67
Nodes (3): Collaborative Teamwork Metaphor, Team Climbing Growth Chart Illustration, Upward Growth Trend (rising bars + arrow)

## Ambiguous Edges - Review These
- `React frontend (Vite :5173)` → `Type-aware ESLint configuration (recommendedTypeChecked)`  [AMBIGUOUS]
  frontend/README.md · relation: conceptually_related_to
- `Test counts after fixes (pytest 84, server vitest 51, frontend vitest 5)` → `Claim: 62 tests`  [AMBIGUOUS]
  brag-output/share-copy.txt · relation: conceptually_related_to
- `Welcome Summary Card (Last close, Today's move)` → `Video Frame 03 at 9.5s`  [AMBIGUOUS]
  brag-output/brag.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **159 isolated node(s):** `$schema`, `registry`, `blocks`, `components`, `assets` (+154 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `React frontend (Vite :5173)` and `Type-aware ESLint configuration (recommendedTypeChecked)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Test counts after fixes (pytest 84, server vitest 51, frontend vitest 5)` and `Claim: 62 tests`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Welcome Summary Card (Last close, Today's move)` and `Video Frame 03 at 9.5s`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `predict_stock()` connect `Backend API Core` to `Auth Architecture And Bugs`, `Security Regression Tests`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `GET /predict_stock route` connect `Auth Architecture And Bugs` to `Backend API Core`, `Forecast Model Design`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `FakeYFinance` (e.g. with `test_predict_returns_502_when_the_upstream_fails()` and `test_stock_prices_returns_502_when_the_upstream_fails()`) actually correct?**
  _`FakeYFinance` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `labelled_pipeline()` (e.g. with `test_indicator_overbought_blocks_a_buy()` and `test_indicator_returns_rounded_indicator_payload()`) actually correct?**
  _`labelled_pipeline()` has 12 INFERRED edges - model-reasoned connections that need verification._