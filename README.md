# The Batman Knowledge Engine

A serious, adaptive Batman knowledge diagnostic, study archive, challenge system, and mastery tracker built with semantic HTML, CSS, and vanilla JavaScript.

The application is designed for static hosting on GitHub Pages. It requires no backend, database, paid API, account system, React installation, or runtime build process.

## Included in the first release

- Quick, Standard, Deep, and Comprehensive adaptive diagnostics
- Difficulty-weighted ability estimates across nine major knowledge domains
- Confidence calibration, guessing adjustment, partial credit, and guarded rank assignment
- Multiple choice, multi-select, typed answer, chronology, matching, evidence, false-statement, and best-explanation formats
- League, Endless, Category Mastery, Continuity Crisis, Creator Run, Adaptation Arena, Villain Files, Bat-Family Files, Detective, Sudden Death, Confidence Wager, Timeline, Minefield, Daily, Custom, and local two-player modes
- Local profiles and progress persistence with `localStorage`
- Pause and resume
- Knowledge Map and category drill-downs
- Lightweight spaced repetition and question review
- Study Archive
- Profile export/import
- Seeded shareable challenges
- Printable scorecards and exportable results images
- Spoiler and accessibility controls
- Offline operation after initialization
- Development-only question validator
- 150 starter questions across Comics, Characters, Creators, Film, Animation, Games, Gotham, Themes, and Detective Reasoning
- 40% of the starter bank uses formats other than ordinary multiple choice

## Repository delivery format

The complete human-readable project tree is stored in the eight `bundle.part00`–`bundle.part07` files as a base64-encoded gzip tar archive. The small `bootstrap-sw.js` materializer reconstructs the files into browser Cache Storage on the first visit and then serves the normal application source. This avoids a backend and remains compatible with GitHub Pages.

To unpack the complete source locally:

```bash
cat bundle.part* | base64 --decode > project.tar.gz
mkdir extracted
tar -xzf project.tar.gz --strip-components=1 -C extracted
cd extracted
```

The extracted structure includes:

```text
index.html
css/
js/
data/
assets/
tools/question-validator.html
manifest.webmanifest
sw.js
README.md
.github/workflows/pages.yml
```

## Run locally

From the repository root, start any static server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The first visit reconstructs and caches the full application. Opening the extracted project directly through a local server also works.

## Deploy to GitHub Pages

A standard Pages workflow is included at `.github/workflows/pages.yml`.

1. Open **Settings → Pages** in the repository.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run the workflow from the **Actions** tab.
4. GitHub will display the published URL when deployment succeeds.

The repository can also be published using **Deploy from a branch**, with the site rooted at `/`.

## Adaptive model

The engine maintains an ability estimate from 1–10 and an evidence-confidence value for each major category. Question selection considers:

- Distance between item difficulty and the current estimate
- Item discrimination
- Guessing probability
- Category uncertainty and coverage
- Underused question formats
- Recently repeated topics
- Easier confirmation questions
- Harder ceiling tests

The model is inspired by item-response logic but deliberately simplified for a transparent, browser-only application. One lucky expert-level answer cannot establish an expert rank. Rank is constrained by evidence volume, category breadth, lower-performing domains, confidence calibration, and repeated performance.

## Adding question packs

After unpacking the project:

1. Create a JSON array in `data/`, following an existing question file.
2. Give every question a globally unique ID.
3. Add the filename to `QUESTION_FILES` in `js/constants.js`.
4. Add new major categories to `data/categories.json` and `CATEGORIES` in `js/constants.js`.
5. Open `tools/question-validator.html` through a local server.
6. Resolve all errors and review warnings.
7. Test the pack in fixed and adaptive modes.
8. Add the file to the `CORE` list in `sw.js` for offline use.

Supported structures include:

- `multiple-choice`, `evidence`, `false-statement`, `best-explanation`: `options` and `correctIndex`
- `multi-select`: `options` and `correctIndexes`
- `typed-answer`: `correctAnswer` and `acceptedAnswers`
- `chronology`: `items` and `correctOrder`
- `matching`: `pairs` containing `left` and `right`

## Difficulty guidance

- **1–2:** recognition and foundational identities
- **3–4:** specific facts and basic distinctions
- **5–6:** close comparisons, creative teams, chronology, and continuity
- **7–8:** cross-era knowledge, connected facts, editorial context, and close interpretation
- **9–10:** expert synthesis, complicated continuity, historically significant obscurity, and multi-step reasoning

Difficulty should reflect the knowledge operation, not meaningless obscurity. Issue-number recall should only be emphasized when publication history or chronology makes it relevant.

## Verification standards

For factual questions:

1. Prefer original comics, official publication information, and official film, television, or game credits.
2. Use creator interviews and reputable reference works for production history.
3. Do not use a fan wiki as the only source for obscure or disputed claims.
4. Scope wording to the relevant continuity or adaptation.
5. Record a source, verification status, and review date.
6. Mark genuine disputes and explain competing readings.

The validator treats unverified difficulty 8–10 factual questions as errors.

## Validation

The included validator checks missing and duplicate IDs, duplicate wording, missing sources, missing explanations, invalid difficulty values, broken answer indexes, bad multi-select structures, category references, spoiler metadata, chronology and matching structures, unverified expert questions, suspicious option-length clues, repeated distractors, and raw answer-position imbalance.

The bundled 150-question release passed the validator with zero structural errors and zero warnings before upload.

## Privacy and copyright

Profiles, settings, scores, reports, and review schedules remain in the browser. The application does not request email addresses or transmit profile information.

No comic scans, film stills, protected logos, music, or copied promotional artwork are included. Interface graphics are original geometric SVG and CSS elements; study material and questions use original summaries, factual descriptions, analysis, or original detective cases.
