# Game logic

Keep gameplay code here, separate from historical question data.

Suggested responsibilities:

- current topic / board state
- completed question tracking
- score calculation
- Correct / Incorrect self-grading
- undo last grade
- local persistence
- sound state and volume
- reduced-motion behavior hooks

V1 scoring:

- Correct: add the tile value
- Incorrect: add nothing
- Never subtract points
