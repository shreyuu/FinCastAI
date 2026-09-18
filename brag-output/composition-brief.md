# Hyperframes Composition Brief: FinCastAI

## Objective
Create a short launch-style brag video for FinCastAI — a stock analysis platform that
forecasts NSE prices with SVR, scores news with FinBERT, and turns the two into a
single trade call.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20.1s (four scenes summing to 20.02s of content)

## Source Material
- Project root: `/Users/shreyu/VSCODE/Projects/FinCastAI`
- Primary files read: `README.md`, `frontend/src/index.css`, `frontend/src/HomePage.tsx`,
  `frontend/src/components/StockPrediction.tsx`, `frontend/src/components/Sidebar.tsx`,
  `frontend/src/Indicator.tsx`, `frontend/src/news.tsx`, `backend/app/main.py`,
  `backend/app/config.py`
- Product name: FinCastAI
- Tagline / strongest claim: the landing page's *"Make Better Investment Decisions With
  Alternative Data."* — but the video's real claim is the opposite of a claim: this
  repo documents its own gaps.
- Key UI to recreate: (a) the dashboard prediction card from `StockPrediction.tsx` —
  ticker input, blue Search button, zoom select, and the dual-line Recharts chart; (b)
  the Indicators result card from `Indicator.tsx` — Impact panel, Trade Decision panel,
  and the RSI / EMA / MACD / OBV / Bollinger cards.
- Copy that must appear verbatim:
  - `Where the history ends,` / `the model keeps going.`
  - `FinCastAI Dashboard`
  - `Enter Stock Ticker (e.g. TCS.NS)`
  - `Historical Price` / `Predicted Price`
  - `Impact` / `Trade Decision` / `Buy`
  - `RSI` / `EMA` / `MACD` / `OBV` / `Bollinger Bands`
  - `Forecasts that show their work.`
  - `62 tests. Real status codes.`

## Creative Direction
- Tone preset: **polished**
- Creative direction: *a quiet product film for a forecaster that shows its work*
- Interpretation: four scenes, long holds, soft crossfades, light-to-medium Inter type
  with generous tracking. Restraint is the point. Nothing shouts and nothing promises a
  return — the product carries an explicit educational-use-only disclaimer.
- Angle: the last twenty commits on this repo were an honesty pass — real HTTP status
  codes instead of a blanket 200, bcrypt instead of plaintext, a README rewritten to
  "describe the system that ships, not the aspirational one", and a Portfolio page that
  now labels its own holdings as example data. So the film opens on the product's
  signature visual (solid history handing off to dashed forecast), moves through the
  real flow, and closes on the receipts.
- Hook: a green line draws across a pale field, hits a dashed "today" rule, and
  continues as a dashed saffron forecast. Two lines of type land under it.
- Outro / punchline: `62 tests. Real status codes.`
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Any implication of profit, accuracy, or investment advice

## Visual Identity
- Background: `#f1f5f9` (`--color-secondary`); hook/outro use the landing page's
  `#eff6ff → #ffffff → #dbeafe` gradient
- Text: `#111827` primary, `#4b5563` secondary
- Accent: `#3b82f6` (`--color-primary`); button gradient `#2563eb → #3b82f6`
- Chart green (historical): `#10B981`; chart saffron (predicted, dashed `5 5`): `#FF9933`
- Positive `#16a34a` on `#f0fdf4`; negative `#dc2626` on `#fef2f2`
- Display font: Inter, falling back to `ui-sans-serif, system-ui` (no webfont is
  fetched at render time)
- Body font: same stack — the app sets `font-family: "Inter", sans-serif` in `index.css`
- Visual references: white `rounded-lg`/`rounded-xl` cards with `shadow-md` and 1px
  `#e5e7eb` borders; the `bg-gradient-to-b from-white via-blue-50 to-blue-100` sidebar;
  blue pill buttons; `₹` axis ticks; the two-item chart legend

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. **The handoff** — 0.00–4.75s — a green line draws, meets a dashed "today" rule, and
   continues saffron-dashed. Reads: "Where the history ends," then "the model keeps
   going."
2. **Search a ticker** — 4.75–10.01s — the FinCastAI Dashboard. `TCS` types into the
   ticker field, `.NS` appends itself on blur (real `handleBlur` behaviour), Search is
   clicked, the button spins, the dual-line chart draws in.
3. **The call** — 10.01–15.81s — the Indicators result card. Impact counts up to
   +6.4%, "Buy" settles beside it, then RSI / EMA / MACD / OBV reveal one by one over
   the Bollinger row. Caption: "FinBERT reads the news. RSI checks it isn't already
   overbought."
4. **Receipts** — 15.81–20.02s — wordmark, "Forecasts that show their work.", then
   "62 tests. Real status codes."

## Audio
- Audio role: sparse professional accents over a low bed
- Audio arc: music fades up under a near-silent hook, carries precise interface sounds
  through the typing and the chart landing, lifts once for the trade decision, then
  fades out under a still wordmark
- Music: `assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3`
  (114.84 BPM, 87.6s source, used from 0)
- Music treatment: baseline gain ~0.34, a small lift for scene 3, linear fade to 0
  across the final 1.6s
- Music cue guidance: bundled preset at
  `assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.json`.
  Beat grid `1.60 + n x 0.5226`. Strong cues to target: **5.80s** (Search click / chart
  land), **12.65s** (trade decision), **17.91s** (receipts line). Scene cuts sit on grid
  beats 4.75 / 10.01 / 15.81. Sequential window for the four indicator cards:
  **13.18–15.28s**, every *other* beat (~1.05s), because these are numbers to read.
- Audio-reactive treatment: subtle. Per-frame data pre-extracted to
  `assets/audio-data.js` (30fps, bass/mid/treble). Drives only the hook's background
  warmth, the outro wordmark's glow, and the dashboard card's shadow presence — no
  waveform, equalizer, or visualizer graphics, and nothing that moves text.
- Audio-coupled moments:
  - Scene 1, solid→dashed handoff — one warm low-risk bell
  - Scene 2, `TCS` typed — three randomised-but-fixed keypress ticks
  - Scene 2, `.NS` auto-append — one quiet selection click
  - Scene 2, Search pressed — one button click at the press, not the result
  - Scene 2, chart settles — one soft impact at the resolution
  - Scene 3, "Buy" settles — one dry soft impact on the strong cue
  - Scene 3, four indicator cards — one very quiet soft impact each, on the visual landing
  - Scene 4, wordmark sets — one soft impact, then nothing over the two text lines
- SFX selection guidance: clicks at the press, reveals at the resolution. Everything
  repeated must be low high-frequency risk.
- SFX analysis guidance: `~/.claude/plugins/cache/brag/brag/0.2.2/skills/brag/assets/sfx/sfx-analysis.md`
  — all selections are from its "Safest General Picks" / low-risk-by-use-case lists.
- Exact SFX choice: made after the animation existed; files copied into
  `brag-output/composition/assets/sfx/`.
- Audio files: music, cue preset, SFX and extracted audio data all live under
  `brag-output/composition/assets/`.

## Hyperframes Instructions
Built with the Hyperframes domain skills (`hyperframes-core` contract, `hyperframes-cli`
gate, `hyperframes-creative` audio-reactive guidance). Single paused GSAP timeline
registered on `window.__timelines["main"]`, no render-time clocks, no unseeded random,
no infinite repeats, all assets local and relative.

Requirements met:
- Real UI from the project appears in scenes 2 and 3 (dashboard card, chart, indicator
  result card), rebuilt from the actual components.
- All text holds past the reading-time floor.
- 20.1s, inside 15–25s.
- Music + 13 SFX cues, none celebratory.
- `npx hyperframes check` is the gate before render.
