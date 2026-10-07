# World History · Study Stage

A complete, solo AP World History recall game with six Jeopardy-inspired boards for Topics 1.1–1.6. All 150 questions were written from the supplied AMSCO textbook. Every answer includes an explanation and its textbook page citation.

## Run locally

Requires Node.js 20 or newer. No package installation is required.

```sh
npm start
```

Open **http://localhost:4173**. The server binds only to this computer. Set `PORT` to use a different port. Opening `index.html` directly will not work because browsers restrict local JSON loading.

```sh
npm test       # Content, scoring, undo, summaries, persistence
npm run check  # Data validation and syntax checks
npm run build  # Creates dist/ for a static web server
node scripts/serve.mjs --dist
```

The syntax check uses Node's built-in VM module parser and may print its experimental-feature notice. There are no application dependencies, no database, and no runtime backend. Google Fonts are optional; system-font fallbacks work when offline.

Optional browser integration checks are retained in `tests/browser-smoke.cjs` and `tests/browser-visual.cjs`. They require Playwright and an installed Edge browser, with the app already running. Set `PLAYWRIGHT_MODULE` to an existing Playwright package path if it is not locally installed, and optionally `BROWSER_CHANNEL` to another installed channel. These checks use temporary browser profiles and write screenshots to `tmp/`.

## How it works

- Choose any topic. New boards have a short, skippable opening and sequential category reveals.
- Pick a question, think or speak your answer, then reveal it. Higher values emphasize explanation and historical reasoning.
- Self-grade **Correct** or **Incorrect**. Correct adds the tile value; incorrect never subtracts points.
- **Undo last result** reopens the latest question for correction, including from the recap.
- Completed tiles stay visible and cannot be graded twice.
- All 25 answers lead to a recap with category accuracy, tied strongest/weakest categories, and every missed answer and explanation.
- Review missed questions individually without changing the original score, or start a fresh run.
- Active runs, completed-run history (up to 50 per topic), and sound preference save locally. Returning to a topic resumes it or opens its latest recap.
- Keyboard users can Tab to all controls and activate buttons with Enter/Space. Escape returns from a question or review. Reduced-motion preferences skip intros and remove transitions.

## Architecture and key files

| Location | Responsibility |
| --- | --- |
| `index.html`, `src/app.js` | Entry point, screen transitions, event handling |
| `src/components/` | Topic selection, board, question/stimulus/answer, recap, shared UI |
| `src/game/engine.js` | Pure grading, undo, validation, and summary calculations |
| `src/game/storage.js` | Validated local saves and completed-run records |
| `src/game/audio.js` | Original synthesized Web Audio cues; no copyrighted samples |
| `src/data/unit1/1.1.json` through `1.6.json` | Six independently editable question banks |
| `src/styles/main.css` | Dark navy/gold visual system, transitions, responsive layouts |
| `tests/game.test.mjs` | Automated content and state checks |
| `docs/CONTENT_QA.md` | Source boundaries, editorial checks, coverage, and evidence notes |
| `docs/DATA_MODEL.md` | How to edit questions or extend stimulus types |

The scaffold had no application framework or established build system. Native browser modules preserve its data/game/rendering separation without adding framework dependencies. Phones use readable, horizontally scrollable boards rather than tiny five-column tiles. Region illustrations are decorative vector drawings, not historical source material.

## Scope

Only Topics 1.1–1.6 are available. Topic 1.7, Unit 2, multiplayer, timers, buzzers, accounts, automatic grading, and competitive systems are intentionally absent. No official Jeopardy branding, music, or audio is used.

The textbook is used for authoring and is excluded from the build and Git. Source page citations remain visible in the game. Nothing has been published.
