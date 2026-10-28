# Presenting SIX honestly

This guide prepares a project explanation, not an admissions promise. The work is an AI-assisted starting point until the student has reviewed it, made documented contributions, and can explain it independently. Do not submit this guide as a personal reflection.

## A short demonstration

1. Invite someone to choose a number from 1–63 silently. Perform the trick without explaining binary first.
2. Reveal the number, then open the secret. Connect each Yes to a weight, binary digit and card.
3. Use 42: 32 + 8 + 2 = 101010₂. Toggle one bit and predict the difference before clicking.
4. Move the information-limit slider from five to six questions. Explain why 32 distinct patterns cannot label 63 distinct choices.
5. Use the lab to show that k cards give 2^k patterns and 2^k−1 valid secret numbers.
6. Briefly show tests and the AI assistance record. Describe only your actual work.

## Questions to answer without looking at notes

- Why does `(n & weight) !== 0` identify membership?
- Why are there 32 numbers on each six-card card?
- Why does each nonzero answer pattern correspond to exactly one number?
- Could five adaptive yes/no questions suffice for 63 choices? Why not?
- Why do answers store weights instead of relying on their array indices?
- What happens after a wrong answer? What can and cannot be detected?
- How does the immediate lock prevent repeated clicks before React rerenders?
- Which parts remain accessible if the WebGL module fails?
- What is the cost of generating k cards? Why limit this lab to eight?
- Which code did you write, which was AI-assisted, and how did you verify both?

## Evidence to collect before including a portfolio link

- A public repository and working deployed URL, verified from a separate device.
- Student-authored changes described accurately in AI_ASSISTANCE.md and LEARNING_LOG.md.
- A real motivation statement and one real mistake, decision or improvement with evidence.
- Actual classmate observations and a concrete resulting improvement, if feedback is discussed.
- A fresh test/build result; manual keyboard and screen-reader checks using TESTING.md.
- The About page uses the supplied motivation: an enduring general interest in magic. It makes no claim about independent student authorship. Add actual student contributions and learning only when supported by evidence.

The three tasks in STUDENT_TASKS.md are good, bounded starting contributions. Finishing a task matters less than being able to explain your reasoning and verify the result.

## Tradeoffs worth discussing

- The application is static: no backend, accounts, analytics, or secret-number input.
- Generated cards make the math inspectable and remove manual-list errors.
- HTML carries the experience; Three.js adds a finite decorative lighting cue and is lazy-loaded.
- Demand rendering, reduced motion and a CSS fallback limit graphics overhead, but the optional Three.js bundle is still substantial. Do not claim measured performance without measurements.
- System fonts avoid external requests and font-loading shifts, at the cost of less typographic control across operating systems.
- State is local and not saved: a reload deliberately starts a new performance.

## Suggested repository description

“An interactive binary number-card trick with an accessible React/TypeScript interface, a mathematical explainer, and a generalized card lab. Includes exhaustive logic tests and browser journeys. AI assistance and student contributions are documented.”

Adjust that wording only to reflect the final verified state. No usage, impact or independent-authorship claims are implied.
