# Verification and manual usability guide

## Final hosting check — 26 October 2026

- Clean dependency install (`npm ci`) succeeds; `npm audit` reports zero known vulnerabilities.
- All 11 mathematical tests pass.
- All 15 browser tests pass against the production build at `/`, and all 15 pass again under `/Magic_Trick/`. The suite includes automated accessibility scans and graphics-failure recovery.
- A new test confirms that the loaded HTML experience reconstructs 42, updates the binary switches, and generates the eight-card lab while offline, with no third-party HTTP requests. This does not imply the site can be loaded or reloaded offline without cached assets.
- The first run caught a keyboard timing race in the eight-card journey. The listener and transition unlock now update in layout effects, synchronously with the committed card. That journey subsequently passed 12 consecutive targeted repetitions and both complete production suites. No retries were added to hide the failure.
- Both hosting configuration files and the package/lockfile engine declarations were checked for consistency. Netlify and Vercel use `dist`, `npm run build`, and the root `/` base path. The final `dist` directory was rebuilt at `/` after testing the optional Pages prefix.
- There is no database dependency, backend endpoint, runtime API, credential file or external font request in the application source. No database service needed removal.
- GitHub CI was separated from manual-only Pages deployment. No Git repository was initialized, no remote was created, and no hosted deployment or GitHub workflow execution was performed during this check.

The optional Three.js chunk still generates a size warning (~239 kB gzip). Manual screen-reader, physical-device and cross-browser checks remain unverified. See [DEPLOYMENT.md](DEPLOYMENT.md) for publication instructions. The curriculum section was not added.

## Automated verification

Verified locally during the AI-assisted refinement pass on 22 October 2026:

- Vitest: **11 tests pass**. Exhaustive checks cover every supported value for 3–8 cards, card size/uniqueness/membership, binary formatting, reordered weights, uniqueness of all answer patterns, invalid inputs and the minimum-question bound. A boundary assertion also protects the bound against floating-point logarithm rounding.
- Playwright / Chromium: **14 tests pass against the production build under `/Magic_Trick/`**. These cover all-Yes → 63, correction → 62, restart, all-No recovery, keyboard reconstruction of 42, result-initialized switches, repeated clicks, 360px layouts, a complete eight-card game → 173, explanation zero handling, information capacity, the reasoning exercise, interrupted transitions and graphics failure.
- One of those 14 tests runs axe-core on the introduction, answering, reveal, explanation, lab and about screens using WCAG 2 A/AA and WCAG 2.1 A/AA rule tags: **no violations detected in those tested states**. Two discovered issues were corrected: low-contrast outcome-map labels and card buttons whose accessible names did not include all visible text.
- Graphics tests cover WebGL being unavailable before loading and a real `WEBGL_lose_context` call after renderer initialization. In both cases the HTML experience remains available. This is a fallback test, not a claim that the renderer restores a lost context.
- TypeScript and Vite build pass with `BASE_PATH=/Magic_Trick/`. All browser journeys run on the actual prefixed built assets, not just the Vite development server.
- npm audit reports **zero known vulnerabilities** at this verification point.
- Desktop opening, reveal and explanation screenshots and 360px answering/explanation layouts were visually inspected. The eight-bit capacity map was made more compact; long number grids and the narrow eight-switch row scroll rather than shrinking text.

Reproduce the production verification:

```sh
npm test
BASE_PATH=/Magic_Trick/ npm run build
BASE_PATH=/Magic_Trick/ E2E_PRODUCTION=1 npm run test:e2e
npm audit
```

The Three.js enhancement remains a large lazy chunk (~885 kB uncompressed / 239 kB gzip); Vite emits a chunk-size warning. The main application is ~341 kB / 111 kB gzip and CSS ~23 kB / 6 kB gzip. LazyMotion avoids importing unused animation features. Reduced-motion mode does not import WebGL. No measured Core Web Vitals or hardware performance claim is made.

Not verified: actual GitHub Pages deployment or execution of the GitHub Actions workflow, Safari, Firefox, physical phones, VoiceOver/NVDA, real participant usability, or a formal accessibility audit. Automated axe results do not establish complete WCAG conformance. No student or participant feedback has been invented.

## Manual guide (10–15 minutes)

Ask a participant to choose a number silently. Do not coach them through the UI.

1. Can they identify the 1–63 range and start without entering the secret?
2. Have them play once on a phone. Observe scanning order, mistakes and hesitation. After the reveal, ask whether the result matched. A mismatch does not mean the app detected a lie; recheck the membership answers together.
3. Try 42 (Yes, No, Yes, No, Yes, No in displayed order). Go Back and correct a response. Try all No, then review. Restart and confirm earlier choices disappear.
4. Operate with Tab, Shift+Tab, Enter and Space. Use Y/N only during answering. Check visible focus and absence of a keyboard trap. With VoiceOver/NVDA, check stage headings, progress, result announcement and switch checked states.
5. Enable reduced motion in the OS. Repeat the full trick. Repeat with `?no3d` and WebGL disabled. All actions should still work.
6. Inspect at 360px width and 200% zoom. Check all numbers and both answer controls; larger lab cards should scroll without shrinking their text. Test 3 and 8 cards.
7. Toggle weights 32, 8, 2 in the secret panel. Confirm 42 = 101010₂. Ask the participant to explain what a switch changes.
8. Open the lab and ask them to predict the range for 7 cards before changing it. Expected answer: 1–127, 128 patterns.
9. With consent, record actual observations and verbatim feedback. Choose one bounded improvement, retest it, and document evidence in LEARNING_LOG.md.

For a prefixed preview use the same `BASE_PATH` for build **and** preview, as shown in README.md. The production server must serve `dist` at the matching repository prefix.
