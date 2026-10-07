# Editing content

Each board lives in `src/data/unit1/<topic>.json`. `topics.json` determines menu order and availability. UI and scoring never embed historical question text.

Each board has `topic`, `title`, `subtitle`, `source`, and five `categories`. Each category has a stable `id`, display `name`, and five `questions` ordered by value: 100, 200, 300, 400, 500.

| Question field | Meaning |
| --- | --- |
| `id` | Globally unique, stable ID; saved progress refers to it |
| `category` | Matches the enclosing category name |
| `value` | Difficulty and score; 100–500 in increments of 100 |
| `skill` | A concise reasoning cue shown with the question |
| `prompt` | Open recall or reasoning prompt, never multiple choice |
| `answer` | Expected answer or a model response for reasoning questions |
| `explanation` | Short account of why the historical idea matters |
| `source.printedPages` | Printed AMSCO page numbers supporting the content |
| `source.pdfPages` | Corresponding one-based PDF pages (printed page + 64 in this edition) |
| `stimulus` | Null, or a structured evidence object |

Supported stimulus types:

```json
{"type":"text","label":"Evidence to consider","content":"A short paraphrase.","attribution":"Paraphrased from AMSCO, p. 28."}
```

```json
{"type":"table","label":"A comparison","headers":["State","Evidence"],"rows":[["State A","Evidence A"]],"attribution":"Paraphrased from AMSCO, p. 28."}
```

```json
{"type":"image","label":"Visual evidence","src":"./public/stimuli/unit1/1.1/example.png","alt":"A meaningful description of the evidence.","attribution":"Source and credit."}
```

`map` uses the same fields as `image`. Images and maps are supported by the renderer; V1's question banks use paraphrased text and a comparison table. New kinds of stimuli need rendering added to `stimulusView` in `src/components/question.js` and validation in `engine.js`.

Run `npm test` and `npm run check` after edits. Keep IDs stable for wording corrections; change the ID for a replacement question so saved grades do not attach to unrelated content. Scores and accuracy are recomputed from the current bank. Storage sanitization ignores unknown or malformed grades.

The engine derives all results from one grade list per run. There is no separately mutable score that can drift away from the answers. Undo removes the latest grade; recording a corrected full run replaces its previous completion record rather than creating a duplicate.
