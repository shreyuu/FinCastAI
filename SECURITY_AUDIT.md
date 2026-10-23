# FinCastAI security and logic audit

Audit date: 2026-10-23. Scope: the whole repository at `6cc4ca5`: `backend/` (FastAPI), `server/` (Express + MySQL), `frontend/` (React + Vite), and the git history.

## Method

- **Manual review:** every entry point, traced end to end.
- **Automated scans:**
  - gitleaks: history and working tree
  - osv-scanner and `npm audit`: both lockfiles
  - pip-audit: the installed `backend/.venv`
  - bandit: `backend/app`
  - semgrep: `p/default`, `p/python`, `p/typescript`, `p/react`, `p/nodejs`, with metrics off. This replaces `--config auto`, which requires sending metrics.
- **Not available:** trufflehog (gitleaks covers the same ground) and Docker. There are no Dockerfiles or CI workflows to review.
- **How findings were confirmed:** every finding below comes from reading the code, and each "verified" exploit was reproduced. Scanner output was treated as leads only.

## Attack surface

| Entry point | Auth | User input |
| --- | --- | --- |
| `GET /predict_stock`, `POST /predict` (FastAPI :8000) | none | `ticker`, `start_date`, `end_date`, `forecast_out` |
| `POST /Indicotor` | none | `company`, `ticker`, `owned_stock` |
| `GET /news-impact/{company}` | none | `company` |
| `GET /stock-prices`, `GET /health` | none | none |
| `POST /users` (Express :3001) | none | `name`, `email`, `password`, `dob`, `gender` |
| `POST /users/login` | none | `email`, `password` |
| `npm run set-password` (operator CLI) | DB access | email, password (stdin) |

Outbound calls go from FastAPI to Yahoo Finance, NewsData.io (the API key travels in the query string) and the Hugging Face Hub (model weights). Secrets live in `backend/.env` (NewsData key) and `server/.env` (DB credentials). PII lives in the MySQL `users` table (email, dob, gender, bcrypt hash) and in the browser's `localStorage.user` (id, name, email).

## Findings

Status is one of: Open, Fixed, Needs decision, Manual action, or Won't fix (with reason).

| ID | Severity | Category | File:line | Exploit scenario | Proposed fix | Confidence | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SEC-01 | Critical | Secret in public git history | git history: `c6fec1e6` (backend/app/main.py:23, tp.py:25, indicators.py:9, FinBert.py:8), `0b264756` and `67d80cd6` (config.py:12/17), `da5b3713` (FinBert.py:11) | The GitHub repo is public. Running `git clone` and then `git log -p \| grep API_KEY` reveals a NewsData.io key. Comparing hashes (the key was never printed) shows it is the key currently in `backend/.env`. Anyone can use up the quota or run charges on the account. | Rotate the key at NewsData.io. Optionally purge it with `git filter-repo` and force-push. Rotation is what actually closes this, because forks and clones keep the history. The code already reads the key from the environment. | High | Manual action |
| SEC-02 | Medium | Secret in logs; query-parameter injection | backend/app/main.py:138, 153 | The key is part of the request URL. The messages of `requests.HTTPError` and `ConnectionError` include the full URL (verified), and `print(f"Error fetching news: {e}")` writes that to stdout. An attacker can make NewsData return a 4xx at will (for example `GET /news-impact/<600 chars>`), which puts the key in the server logs. `company` is concatenated without encoding, so `M&M` is cut short and `x&country=us` adds parameters. | Pass `params=` to `requests.get` and log only the exception type and HTTP status. | High | Fixed: `params=` encoding; the log line shows only the error type and status (tests/test_helpers.py) |
| SEC-03 | Medium | SQL semantic injection (mysql2 object expansion) | server/src/server.ts:24, 81-85 | Sending `POST /users/login {"email":{"email":1},"password":"guess"}` makes mysql2 build ``SELECT * FROM users WHERE email = `email` = 1`` (verified), which matches every row. Login then checks the password against the first account, so an attacker can brute-force that account without knowing its email and gets its name and email back on success. | Reject any field that is not a string with 400. As defence in depth, set `stringifyObjects: true` in the DB config. | High | Fixed: non-string fields get 400 before any query; `stringifyObjects: true` (auth.test.ts) |
| SEC-04 | Medium | DoS: blocking work on the event loop | backend/app/main.py:227, 441, 454 | These handlers are `async def`, but the yfinance download, SVR fit, FinBERT and `requests.get` calls inside them block. One slow `/predict_stock` call, or a NewsData request waiting out its 10 s timeout, stalls every other request, including `/health`. A handful of concurrent calls takes the API offline. | Change them to plain `def` so FastAPI runs them in its threadpool. Serialise `yf.download` with a lock, because yfinance resets the global `shared._DFS` on every call and would mix up tickers across threads. | High | Fixed: handlers are sync (threadpool); all yfinance calls go through `_yf_lock` (tests/test_security.py) |
| SEC-05 | Medium | Unbounded input; request amplification | backend/app/main.py:43-53, 544-560 | `ticker="A B C ..."` makes yfinance download every listed symbol in one request. `forecast_out=0` returns a 502. `forecast_out=-1` returns about 1,400 fabricated future "prediction" points. A malformed date returns a 502. `start_date=1990-01-01` keeps the CPU busy on a large SVR fit. `company` has no length limit. | Ticker must match `^[A-Za-z0-9.^=&-]{1,20}$`. `forecast_out` must be 1–30. Dates are typed `date` with start < end, otherwise 422. `company` is at most 100 characters. Train on at most the latest 2,520 rows. | High | Fixed: ticker pattern, forecast_out 1–30, typed dates with start < end, company ≤ 100, training capped at 2,520 rows (tests/test_security.py) |
| SEC-06 | Medium | No rate limiting | server/src/server.ts:23, 80; backend/app/main.py routes | Login is an unthrottled oracle for credential stuffing. Each forecast, indicator or news call spends one NewsData credit (the free tier allows about 200 a day). An attacker can use them up, after which sentiment silently drops to 0 for every user and the displayed trade calls change to Hold or No Action. | express-rate-limit: 10 logins per 15 minutes per IP, 5 signups per hour per IP. slowapi: 10 calls per minute per IP on the expensive routes. Both return 429. | High | Fixed: express-rate-limit (login 10 failed per 15 min, signup 5/h per IP) and a shared slowapi budget of 10/min per IP; tunable via RATE_LIMIT_EXPENSIVE (auth.test.ts, tests/test_security.py) |
| SEC-07 | Medium | Vulnerable npm dependencies | server/package-lock.json, frontend/package-lock.json | mysql2 3.15.0: a MITM or malicious MySQL server can force the clear-text auth plugin and capture the DB password, and no TLS is configured. axios 1.12.2: prototype-pollution gadgets. vite 6.3.6: dev-server arbitrary file read when exposed with `--host`. Also flagged but not reachable with the current code: proxy-addr (no `trust proxy`), path-to-regexp and body-parser (static routes, JSON only), and the react-router 7.9.1 SSR advisories (the app uses declarative routing). | `npm audit fix`, no `--force`, semver-compatible upgrades only. | High | Fixed: `npm audit fix` plus `npm update picomatch` (mysql2 3.24.6, axios 1.20.0, react-router 7.18.4, vite 6.4.5); `npm audit --omit=dev` is clean for both. Remaining: `braces` (dev-only, via ts-node-dev → chokidar 3, no fix available; replacing ts-node-dev with `tsx watch` would remove it) |
| SEC-08 | Low | Validation only on the client | server/src/server.ts:26-29 | `curl -X POST /users -d '{"password":"a",...}'` creates an account with a one-character password. Server-side, `gender:"x"`, `dob:"zzz"` and a 10 KB name are either accepted or cause a 500. | Repeat the client's rules on the server: email (with the length capped before the regex runs), password of at least 6 characters, gender one of Male, Female or Other, dob a valid past YYYY-MM-DD date, name at most 255 characters. | High | Fixed: server checks name, email (length-capped before the regex), password ≥ 6, past ISO dob and gender enum (auth.test.ts) |
| SEC-09 | Low | Account enumeration | server/src/server.ts:92-95, 117-119 | An unknown email gets 404 "User not found." and a wrong password gets 401. Unknown emails also skip the bcrypt work, so they answer faster. | Return the same 401 "Invalid email or password." in both cases, with a dummy bcrypt compare. | High | Fixed: unknown email and wrong password both get 401 'Invalid email or password.', with a dummy bcrypt compare (auth.test.ts). Residual: legacy accounts still get the 403 PASSWORD_RESET_REQUIRED, which is the designed operator-reset flow |
| SEC-10 | Low | Internal errors returned to clients | backend/app/main.py:359, 447, 486 | The `detail` field of 502 responses repeats the raw exception text from pandas, yfinance or the model. | Use a fixed message per endpoint and log the traceback on the server. | High | Fixed: fixed 502 messages per endpoint, traceback to the server log (3 tests in test_api.py updated) |
| SEC-11 | Low | CORS: wildcard plus credentials | backend/app/main.py:31-37; config.py:30 | With `allow_origins=["*"]` and `allow_credentials=True`, Starlette reflects any `Origin` and sends `Access-Control-Allow-Credentials: true` (verified). There is no impact today because there are no cookies, but this becomes a cross-origin data leak as soon as cookie auth is added. | Set `allow_credentials=False`. The frontend never sends credentials. | High | Fixed: `allow_credentials=False` (tests/test_security.py) |
| SEC-12 | Low | CORS wildcard on the auth server | server/src/server.ts:11 | `cors()` allows every origin, so any website can make visitors' browsers send login and signup requests. That spreads a brute-force attack across many IPs and gets around per-IP limits. | `cors({ origin: ALLOWED_ORIGINS })`, defaulting to `http://localhost:5173`. | High | Fixed: `cors({ origin: ALLOWED_ORIGINS })`, default http://localhost:5173 (auth.test.ts) |
| SEC-13 | Low | PII and password hashes in logs | server/src/server.ts:36, 48, 58 | `console.error(..., err)` prints mysql2's `err.sql`, which contains the full INSERT statement with name, email, bcrypt hash, dob and gender. | Log only `err.code` and `err.message`. | High | Fixed: logs only `code` and `message` (auth.test.ts) |
| SEC-14 | Low | Race condition (check, then insert) | server/src/server.ts:31-56 | When two signups with the same email arrive together, the second gets a 500 (`ER_DUP_ENTRY`). If the live table has no UNIQUE constraint, a duplicate account is created instead. | Map `ER_DUP_ENTRY` to 409. Adding a UNIQUE index on `users.email` in the live database is a manual step. | Medium | Fixed: `ER_DUP_ENTRY` maps to 409 (auth.test.ts). Manual: confirm the live `users.email` has a UNIQUE index |
| SEC-15 | Low | Fingerprinting header | server/src/server.ts:7 | Every response includes `X-Powered-By: Express`. | `app.disable("x-powered-by")`. There is no SPA hosting config in the repo, so the frontend's CSP and other headers can't be set here. | High | Fixed: `app.disable("x-powered-by")` (auth.test.ts) |
| SEC-16 | Low | Supply chain: nothing pinned | backend/requirements.txt; backend/app/main.py:27 | Python dependencies are unpinned and FinBERT is fetched without a `revision`, so a compromised upstream release or model repo would be picked up silently on the next install or start. | Pin versions (after moving to Python 3.10+, see SEC-19) and add an optional `FINBERT_REVISION`. | High | Needs decision |
| SEC-17 | Info | No server-side session | frontend/src/SignIn.tsx:32; server/src/server.ts:125 | The user's identity is whatever is in `localStorage`, and the client trusts it. Nothing on the server is per-user today, so this enables no IDOR or authorization bypass yet. | Won't fix for now. Real sessions or tokens are needed before any per-user feature, such as a real Portfolio. | High | Won't fix (no protected resources yet) |
| SEC-18 | Info | Model input manipulation | backend/app/main.py:242, 495 | Anyone who can publish headlines can steer FinBERT, which moves the forecast by up to ±10% and changes the Buy/Sell call. The model's output is only used as a number; it is never rendered or executed. | Won't fix. This is inherent to the design and covered by the disclaimer. | High | Won't fix (design) |
| SEC-19 | Medium | Vulnerable Python packages in the venv | backend/.venv (Python 3.9.6) | pip-audit flags starlette 0.48.0 (6 advisories), urllib3 2.5.0 (6), torch 2.8.0 (8), transformers 4.57.1 (7), requests 2.32.5 (1), plus anyio, certifi, idna, protobuf, python-dotenv, filelock, fsspec, curl-cffi and soupsieve. Most fixed releases need Python 3.10 or newer, and Python 3.9 reached end of life in October 2025. | Recreate the venv on Python 3.11+ and reinstall, then pin (SEC-16). This is a major runtime upgrade. | High | Manual action |
| SEC-20 | Low | Binds to all interfaces by default | backend/app/config.py:26 (bandit B104); server/src/server.ts:140 | `python -m app.main` and the Express server listen on 0.0.0.0, so a dev laptop on shared Wi-Fi exposes both APIs to the network. | Default to `127.0.0.1` and let deployments set `HOST`. This changes how local runs behave. | High | Needs decision |

## Non-security bugs

| ID | File:line | Problem | Status |
| --- | --- | --- | --- |
| BUG-01 | backend/app/main.py:206, 220 | `/Indicotor` fetches `period="1mo"` (about 21 rows), but MACD needs 26. It comes back all NaN, and `fillna(0)` then shows MACD as 0.0 every time (verified). | Fixed: `period="3mo"` (tests/test_helpers.py) |
| BUG-02 | backend/app/main.py:260, 290 | `forecast_out` of 0 or less either crashes with a 502 or returns garbage. | Fixed (by SEC-05) |
| BUG-03 | server/src/db/connection.ts:17 | The auth server uses one `mysql.createConnection` that never reconnects. After a network blip or MySQL's `wait_timeout`, every query fails until the process restarts. | Fixed: `mysql.createPool` (server/src/__tests__/connection.test.ts) |
| BUG-04 | frontend/src/news.tsx:38 | `includes("Positive")` marks an item tagged `[Negative]` as Positive whenever the headline contains the word "Positive". | Fixed: `sentimentOf()` reads the [Label] prefix; Vitest 5 added to the frontend (frontend/src/sentiment.test.ts) |
| BUG-05 | local `server/.env`, `frontend/.env` (untracked) | `server/.env` sets `DB_PASS`, but the code requires `DB_PASSWORD`, so the server refuses to start. `frontend/.env` uses `REACT_APP_*` names, which Vite ignores. | Manual action |
| BUG-06 | backend/app/config.py:33 | The holiday calendar covers 2025 only. It is now 2026, so forecasts can land on NSE holidays. The official 2026 list is needed; dates were not guessed. | Needs decision |
| BUG-07 | frontend/src/HomePage.tsx:22 | When `/stock-prices` returns an error, the landing page shows nothing and gives no message. | Open (minor, not fixed) |
| BUG-08 | backend/app/main.py:334 | Every live forecast returns 502. yfinance ≥ 0.2.51 returns MultiIndex columns even for one ticker (`('Close', 'TCS.NS')`), so `dropna(subset=['Open', …])` raises KeyError. This happens at `HEAD` too (reproduced against the original code), and `tests/market_fixtures.py` notes the shape gap. The dashboard chart cannot load. | Fixed: single-ticker MultiIndex columns are flattened before use (test_api.py, `single_ticker_download` fixture) |
| BUG-09 | backend/app/main.py:315 | Found while verifying BUG-08, which had hidden it. Yahoo returns the current, unfinished session with a NaN Close (seen live for TCS.NS on 2026-10-22). The NaN goes into the history points, JSON encoding fails and the client gets a 500. | Fixed: rows without a Close are dropped before use (test_api.py) |

## Verification (after fixes)

**Scanners**

| Scanner | Before | After |
| --- | --- | --- |
| gitleaks, git history | 7 hits, one live key (SEC-01) | 7 hits. Unchanged: this needs key rotation, not code |
| gitleaks, working tree | `backend/.env` (gitignored, local) | same |
| osv-scanner | about 100 advisories across both lockfiles | 1 (`braces`, dev-only, no fix available) |
| `npm audit --omit=dev` | server: 4 packages (1 critical); frontend: 13 packages (1 critical) | 0 and 0 |
| pip-audit (venv) | 17 packages | 17 packages, unchanged. Needs Python 3.10+ (SEC-19). New `slowapi` and `limits` are clean |
| bandit | B104 (0.0.0.0 bind) | B104, SEC-20 (needs decision) |
| semgrep (483 rules) | 0 | 0 |

**Tests**

| Suite | Before | After |
| --- | --- | --- |
| pytest | 51 | 84 |
| vitest, server | 22 | 51 |
| vitest, frontend | none | 5 |

`tsc` (server and frontend), eslint and `npm run build` all pass. Ruff reports 47 issues, down from 48 at baseline, with no new categories.

**Live re-attempts.** The API was run with FinBERT stubbed and NewsData unset; the auth server with an unreachable DB; the frontend via `vite preview`.

- **Input bounds:** a spaced ticker, `forecast_out=0` and a garbage date each return 422.
- **CORS:** a preflight from an evil origin gets no `Access-Control-Allow-Credentials` and no ACAO header. The configured origin is echoed.
- **Event loop:** `/health` answers in about 1 ms while a forecast runs.
- **API rate limit:** the shared budget returns 429 with a `detail`. `/health` is not limited.
- **News errors:** the log line reads `Error fetching news: HTTPError (status 401)`. No URL or key appears anywhere in the log.
- **Login:** `{"email":{"email":1}}` gets 400. After 10 failed attempts, the auth server returns 429. With the DB down, login returns 500 and the process keeps running.
- **Signup:** a weak password gets 400 with a readable message.
- **Response headers:** no `X-Powered-By`.
- **Frontend:**
  - The landing page loads live quotes through the CORS allowlist.
  - Indicators for INFY.NS render with a real MACD (21.78).
  - Live forecasts for TCS.NS, M&M.NS and RELIANCE.NS return 200 with 7 forecast days, and the server logs no exceptions. Before BUG-08 and BUG-09 were fixed, every live forecast returned 502 or 500. That was already the case at `HEAD`.
