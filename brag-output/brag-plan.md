# Brag Plan: FinCastAI

## What is this app?
A full-stack analysis platform for NSE-listed Indian stocks: it forecasts prices with
a Support Vector Regression model, reads recent headlines through FinBERT for
sentiment, computes five technical indicators, and folds the two into a single
Buy / Sell / Hold / Avoid call.

## The angle
Most ML side-projects oversell. This one does the opposite, in its own source code.
The last twenty commits were an honesty pass: real HTTP status codes instead of a
blanket 200, bcrypt instead of plaintext, a README rewritten to "describe the system
that ships, not the aspirational one", and a Portfolio page that now labels its own
holdings as example data. So the video's premise is **a forecaster that shows its
work**. It opens on the product's signature visual — the moment the solid history
line hands off to a dashed forecast — moves through the real flow, and closes on the
receipts. Quiet, exact, no promises about returns.

## Hook (first 2-3 seconds)
The handoff. A thin green line draws left-to-right across a pale field, reaches a
dashed "today" rule, and continues as an orange dashed line. Two lines of type land
under it: *"Where the history ends,"* then *"the model keeps going."*
No logo yet. The chart earns the next eighteen seconds.

## Key moments (the middle)
- **`TCS` typed into the dashboard ticker field — and `.NS` snapping on by itself
  when focus leaves.** That auto-suffix is real `handleBlur` behaviour and it is the
  most "this is a working app" detail in the codebase.
- **The Search button's spinner, then the chart landing**: solid green `#10B981`
  historical line, dashed saffron `#FF9933` prediction past the present, `₹` y-axis
  ticks, rotated date labels, the two-item legend.
- **The call**: Impact counting up to a percentage, "Buy" landing in green beside it,
  then RSI / EMA / MACD / OBV arriving one by one as small cards.

## Outro / punchline
Wordmark, tagline, then the receipts line — the flex is the restraint:
`62 tests. Real status codes.`

## User flow worth showing
Entry → key action → result, straight from `components/StockPrediction.tsx` and
`Indicator.tsx`:
1. Dashboard open, cursor into the ticker field, type `TCS`, watch `.NS` append.
2. Click Search → spinner → historical + predicted chart draws.
3. Indicators view → Impact % and Trade Decision, then the five indicators.

## Tone
- Preset: **polished**
- Creative direction: *a quiet product film for a forecaster that shows its work*
- Interpretation: three-to-four scenes, long holds, soft crossfades, light-weight
  mixed-case type with generous tracking. Restraint is the point — the product is a
  real ML system and a genuine financial-data tool, so nothing shouts, nothing
  promises a return, and no motion is added that the interface doesn't already have.

## Format: landscape — 1920x1080
## Duration: 20s

## Visual identity (from the project)
- Background: `#f1f5f9` (`--color-secondary`, the app's page background), with the
  landing page's `blue-50 → white → blue-100` gradient available for the hook/outro
- Accent: `#3b82f6` (`--color-primary`) — wordmark, headings, primary buttons
- Text: `#111827` primary, `#4b5563` secondary (the app's gray-900 / gray-600)
- Chart green (historical): `#10B981`
- Chart saffron (predicted, dashed 5 5): `#FF9933`
- Positive/negative: `#16a34a` / `#dc2626` on `#f0fdf4` / `#fef2f2` tints
- Display font: Inter (semibold/extrabold for headings)
- Body font: Inter (the app sets `font-family: "Inter", sans-serif` in `index.css`)
- Card treatment: white, `rounded-lg`/`rounded-xl`, `shadow-md`, 1px `#e5e7eb` border
- Strongest visual element: the dual-line prediction chart — solid green history
  handing off to dashed saffron forecast

## Share copy (draft)
FinCastAI: SVR price forecasts + FinBERT news sentiment for NSE stocks — and a
codebase honest enough to label its own example data as example data.

## Audio direction
- Role: sparse professional accents over a low bed
- Music: `happy-beats-business-moves-vol-11-by-ende-dot-app.mp3` (114.84 BPM) — its
  strong cues are spread evenly across the first 25s, including early ones, which
  suits a film that has to land four beats in twenty seconds
- Music treatment: start at track 0 (the ~1.6s intro covers the quiet hook), sit low
  under the whole piece, lift slightly for the chart landing and the trade decision,
  fade out over the final 1.5s of the outro
- Music cue guidance: preset read from
  `assets/music/cues/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.md`.
  Beat grid is `1.60 + n x 0.5226`. Target strong cues: **5.80s** (Search click /
  chart land), **12.65s** (trade decision), **17.91s** (receipts line). Scene
  boundaries are placed on grid beats — 4.75 / 10.01 / 15.81 — so cuts sit with the
  music rather than against it. Sequential reveal window for the four indicator
  cards: **13.18–15.28s**, every *other* beat (~1.05s apart), not every beat.
- Audio-reactive treatment: subtle; music RMS may breathe the hook's background
  warmth and the outro wordmark's glow. No waveform, equalizer, or visualizer
  graphics.
- SFX posture: sparse, motion-matched, professional restraint — roughly six cues in
  twenty seconds, none of them comic
- Audio-coupled moments: per-character key ticks while `TCS` is typed; a single soft
  click on the Search press; a soft drop as the chart lands; a light count tick on
  the Impact number; one dry medium impact as "Buy" settles; light plate accents on
  the four indicator cards
- Restraint rule: no risers, no whooshes, no stingers on text. Nothing may imply a
  win or a payoff — this is a research tool with an explicit "not investment advice"
  disclaimer, and the audio must not editorialise the trade decision.

## Storyboard

### Scene 1 — The handoff — 4.75s
Pale `#f8fafc` field with a faint blue-50 wash. A thin `#10B981` line draws
left-to-right across the lower third over ~1.2s, meets a vertical dashed `#cbd5e1`
"today" rule, and continues as a dashed `#FF9933` line for the remaining third. Type
below, Inter light, generous tracking, `#111827`: **"Where the history ends,"**
(settled from ~1.6s, holds >=1.2s), then **"the model keeps going."** (from ~2.9s,
holds to the cut). No wordmark in this scene.
Sequential/interaction: yes — line draws, then the dash handoff, then the two type
lines land one after the other.
Audio intent: music fades up from silence; stillness, then one small moment of
attention at the handoff.
Audio-coupled idea: one light glass ping exactly on the solid→dashed switch.
Music: low, intro section, rising presence.
Transition mood: soft crossfade (0.6s) → Scene 2

### Scene 2 — Search a ticker — 5.26s
Recreate the FinCastAI Dashboard from `components/StockPrediction.tsx`: white header
bar with **FinCastAI Dashboard** in `#3b82f6`, page body in `#f1f5f9`, and the white
prediction card. Inside the card: the ticker input (`Enter Stock Ticker (e.g.
TCS.NS)`), the blue Search button with its magnifier icon, and the zoom `<select>`
reading **Month**. A cursor moves to the input; **TCS** types character by character;
on blur **`.NS`** appends itself; the cursor clicks Search; the button swaps to its
spinning SVG for ~0.4s; then the chart draws into the card — solid `#10B981`
"Historical Price", dashed `#FF9933` "Predicted Price" continuing past the present,
`₹` y-axis ticks, angled date ticks, two-item legend.
Sequential/interaction: yes — simulated typing, the real auto-`.NS` suffix, a cursor
click, a spinner, then the chart line drawing in.
Audio intent: the app responding — small, precise, mechanical.
Audio-coupled idea: randomised per-character key ticks on `TCS`; one `interface/click`
on the Search press; one `interface/drop` as the chart settles.
Music: steady bed, slight lift on the chart landing (strong cue ~5.80s).
Transition mood: clean slide (0.4s) → Scene 3

### Scene 3 — The call — 5.80s
The Indicators result card from `Indicator.tsx`. Heading: **Results for Tata
Consultancy Services (TCS.NS)**. Two panels side by side — blue-50 **Impact** with a
figure counting up to **+6.4%** in `#2563eb`, and green-50 **Trade Decision** landing
on **Buy** in `#16a34a`. Beneath, the four indicator cards arrive one by one and then
all hold together: **RSI 58.24**, **EMA 3842.10**, **MACD 12.47**, **OBV 4.1M**, with
the Bollinger Low/Mid/Up row spanning underneath. One quiet caption line under the
card, `#4b5563`: **"FinBERT reads the news. RSI checks it isn't already overbought."**
(that is literally the `sentiment > 0.05 and RSI < 70` rule in `main.py`).
Sequential/interaction: yes — Impact counts up, then "Buy" settles, then the four
cards reveal every other beat (~1.05s apart, 13.18–15.28s) and the complete set holds
~1.2s before the cut. Each card is a short numeric label, so persistence carries the
read.
Audio intent: arrival and resolution, stated as fact, never as a celebration.
Audio-coupled idea: light count ticks under the Impact number; one dry
`impact/impactSoft_medium` as **Buy** settles (strong cue ~12.65s); a light
`impactPlate_light` per indicator card.
Music: full bed, most present moment of the piece.
Transition mood: soft crossfade (0.6s) → Scene 4

### Scene 4 — Receipts — 4.21s
Back to the pale field. The `BarChart2` mark in `#3b82f6` with **FinCastAI** beside
it, scaling in over ~0.5s. Tagline under it in `#4b5563`: **"Forecasts that show
their work."** (settled ~1.0–3.0s). Then, small and monospaced, on the strong cue at
~17.91s: **"62 tests. Real status codes."** — holds to the end. Final 1.5s: music
fades, everything holds still.
Sequential/interaction: yes — wordmark, then tagline, then the receipts line, three
distinct arrivals.
Audio intent: settle and close. The last sound should be the music leaving, not a
stinger.
Audio-coupled idea: one very light `impactGlass_light` as the wordmark sets; nothing
on the two text lines.
Music: sustained, then a clean fade across the final 1.5s.
Transition mood: hold to black-free end (no transition out)

**Music mood for this video:** cinematic-restrained (low business bed, not upbeat)
**Audio summary:** Music fades up under a silent hook, carries a handful of precise
interface sounds through the typing, the chart landing and the trade decision, lifts
once for the result, and fades out under a still wordmark — six cues in twenty
seconds, none of them celebratory.

---

## Step 1 rubric (recorded)

1. **What is the app?** SVR price forecasts + FinBERT news sentiment + five technical
   indicators for NSE-listed Indian stocks, behind a React dashboard, a FastAPI
   backend and a separate Express auth server.
2. **Funniest / most impressive claim?** The landing page says *"Make Better
   Investment Decisions With Alternative Data"* / *"Get the inside scoop on companies
   like never before."* But the genuinely impressive claim is the opposite of a
   claim: the repo documents its own gaps — `svm.py` is "a standalone research
   script — nothing in the API imports it", the Portfolio page "currently renders
   clearly-labelled example data", and "There are no frontend tests yet."
3. **Visual hook?** The dual-line prediction chart: solid `#10B981` history handing
   off to dashed `#FF9933` forecast.
4. **What to show from the UI?** The dashboard prediction card (search + chart) and
   the Indicators result card (Impact % + Trade Decision + five indicators).
5. **Shortest satisfying video?** 20s.
6. **Tone?** Not specified by the user. Inferred: `polished`; direction *a forecaster
   that shows its work*.
7. **Audio?** Low business bed + sparse motion-matched interface SFX. See Audio
   direction.
8. **Share caption?** See Share copy.
9. **User flow?** Type `TCS` → `.NS` auto-appends → Search → dual-line chart →
   Indicators → Impact % and a Buy/Hold/Avoid call.

## Duration check
4.75 + 5.26 + 5.80 + 4.21 = **20.02s** — inside the 15–25s law, at the 18–22s sweet
spot. Scene boundaries land on the vol-11 beat grid (4.75 / 10.01 / 15.81).

## Compliance note
FinCastAI ships an explicit disclaimer: educational and research use only, not a
basis for investment decisions. The video shows the app's own rendered output
(including the word "Buy" as the UI draws it) but makes no claim about accuracy,
returns, or suitability, and no scene implies a payoff.
