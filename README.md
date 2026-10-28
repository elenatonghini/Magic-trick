# SIX — The Mathematics of Mind Reading

An interactive binary number-card performance and learning lab. Think of a number from 1–63, answer six membership questions, then explore the mathematics. No secret-number input, backend, accounts, analytics, AI API, or external font requests.

## Run locally

Requires Node.js 22.12+ and npm. Node 22 is pinned in `.nvmrc` and used in CI.

```sh
npm ci
npm run dev
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

## Architecture

- `src/math.ts`: pure card generation, weighted reconstruction, binary formatting and the minimum-question bound.
- `src/App.tsx`: explicit introduction, answering, reveal, explanation, lab and about stages. Answers store `{ weight, yes }`; display order is descending to match written binary digits. A ref locks immediately when an answer is submitted, while a short timer handles the visual transition.
- `src/Explanation.tsx`: aligned binary switches, inspectable cards, membership table, information-limit experiment, uniqueness argument and reasoning exercise.
- `src/CardFan.tsx`: spring-based pointer tilt for fine pointers, disabled for reduced motion.
- `src/Stage3D.tsx`: optional, lazy React Three Fiber scenery. A finite 1.2-second lighting cue stops requesting frames when complete. Demand rendering avoids a continuous render loop. Hidden tabs pause rendering. Context detection and an error boundary preserve the HTML experience if graphics fail.
- `src/styles.css`: typography, color, spacing and responsive layouts. Numbers and controls are HTML. The opening fan is always available in CSS; WebGL adds depth behind it. Reduced motion disables animation and skips the WebGL import.
- `src/math.test.ts`: exhaustive logic checks for every value at every supported size.
- `tests/journey.spec.ts`: core browser journeys, keyboard shortcuts, recovery, correction, rapid clicks and mobile layout.
- `tests/static-runtime.spec.ts`: verifies the loaded experience works offline and makes no third-party HTTP requests.

The CSS uses system Georgia and Arial for reliable offline typography. The optional WebGL chunk is larger than the rest of the application; it is decorative and dynamically imported. No continuous animation, hover-only controls, or camera permission is used. Use `?no3d` to explicitly disable the enhancement.

The state and visual components are intentionally kept in a small number of files. The explanation and decorative fan are separate components. A useful next refactor would be extracting the lab once the student understands its data flow.

## Netlify, Vercel and GitHub

The app is entirely static: no external database, backend, credentials or runtime API is needed. `netlify.toml` and `vercel.json` configure `npm run build` and `dist`. Use the root base path `/` for these hosts; do not carry over a GitHub Pages repository prefix.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Italian deployment guide. `.github/workflows/ci.yml` verifies the production build on pushes to `main` and pull requests. Publishing to either host is separate from running CI. The curriculum section remains outside this release.

## GitHub Pages

For a repository named `Magic_Trick`, build with the exact repository path (case-sensitive):

```sh
BASE_PATH=/Magic_Trick/ npm run build
```

For a user site or custom domain, use `BASE_PATH=/`. The supplied GitHub Actions workflow derives the repository path automatically, runs logic tests, builds, runs production browser tests, and deploys `dist`. In GitHub Settings → Pages select **GitHub Actions** as the source, then start **Deploy SIX** manually from Actions. Pages deployment is opt-in and does not run on push. This project uses local React state rather than URL routing, so no SPA rewrite is required.

To inspect a prefixed production build locally:

```sh
BASE_PATH=/Magic_Trick/ npm run build
BASE_PATH=/Magic_Trick/ npm run preview
# Open http://localhost:4173/Magic_Trick/
```

To run all browser journeys against the actual prefixed production build:

```sh
BASE_PATH=/Magic_Trick/ npm run build
BASE_PATH=/Magic_Trick/ E2E_PRODUCTION=1 npm run test:e2e
```

Playwright uses dedicated ports and refuses to reuse another application’s server. `E2E_PRODUCTION=1` tests the built assets rather than the development server.

No deployment has been made as part of this implementation. See `TESTING.md` for recorded verification and manual checks. See `MATH.md`, `LEARNING_LOG.md`, `AI_ASSISTANCE.md` and `STUDENT_TASKS.md` for the learning materials. `GUIDA_STUDENTE.md` explains the mathematics and code in Italian. `PORTFOLIO_GUIDE.md` provides a truthful demonstration plan, technical questions, and remaining evidence to collect before submission.
