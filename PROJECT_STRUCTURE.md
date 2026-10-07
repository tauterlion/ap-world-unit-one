# Project Structure

```text
AP-World-Jeopardy-Scaffold/
├── public/
│   ├── audio/                     # Original / royalty-free game-show audio
│   └── stimuli/
│       └── unit1/
│           ├── 1.1/              # Images, maps, charts for Topic 1.1
│           ├── 1.2/
│           ├── 1.3/
│           ├── 1.4/
│           ├── 1.5/
│           └── 1.6/
│
├── reference/
│   └── AMSCO AP World History.pdf # User supplies this file
│
├── src/
│   ├── components/
│   │   ├── board/                 # GameBoard, CategoryHeader, QuestionTile
│   │   ├── question/              # QuestionView, StimulusViewer, AnswerReveal
│   │   ├── results/               # ResultsScreen, MissedQuestionReview
│   │   ├── navigation/            # TopicSelect, top-level navigation
│   │   └── common/                # ScoreDisplay, SoundControls, reusable UI
│   │
│   ├── data/
│   │   ├── question-schema.example.json
│   │   └── unit1/
│   │       ├── topics.json        # Metadata for Topics 1.1–1.6
│   │       ├── 1.1.json           # 25 questions for Topic 1.1
│   │       ├── 1.2.json
│   │       ├── 1.3.json
│   │       ├── 1.4.json
│   │       ├── 1.5.json
│   │       └── 1.6.json
│   │
│   ├── game/                      # Game state, scoring, persistence, audio logic
│   ├── hooks/                     # Framework hooks if needed
│   ├── pages/                     # Main screens/routes
│   ├── styles/                    # Global visual system and animations
│   └── utils/                     # Small shared helpers
│
└── docs/
    ├── CONTENT_RULES.md
    ├── GAME_FLOW.md
    └── DO_NOT_BUILD.md
```

## Main rule

Historical content belongs in `src/data/`. Game mechanics belong in `src/game/`. Rendering belongs in `src/components/` and `src/pages/`.

Adding or changing a trivia question should never require editing the gameplay engine.
