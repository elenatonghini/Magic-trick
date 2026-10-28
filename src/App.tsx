import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  m as motion,
  MotionConfig,
  useReducedMotion,
  LazyMotion,
  domAnimation,
} from "motion/react";
import Explanation from "./Explanation";
import CardFan from "./CardFan";
import {
  generateCards,
  inferNumber,
  toBinary,
  type Answer,
  type NumberCard,
} from "./math";
const Stage3D = lazy(() => import("./Stage3D"));
type Stage = "intro" | "answering" | "reveal" | "explanation" | "lab" | "about";
class DecorationBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
function Grid({ card }: { card: NumberCard }) {
  return (
    <div
      className="number-grid"
      tabIndex={card.numbers.length > 32 ? 0 : undefined}
      role={card.numbers.length > 32 ? "region" : undefined}
      aria-label={
        card.numbers.length > 32
          ? "Numbers on this card; scroll to see all numbers"
          : undefined
      }
    >
      {card.numbers.map((n) => (
        <span key={n}>{n}</span>
      ))}
    </div>
  );
}
export default function App() {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("intro");
  const [bits, setBits] = useState(6);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [busy, setBusy] = useState(false);
  const [lastChoice, setLastChoice] = useState<boolean | null>(null);
  const lock = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [example, setExample] = useState(42);
  const [inspect, setInspect] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const cards = generateCards(bits);
  const result = inferNumber(answers);
  const index = answers.length;
  useEffect(() => {
    if (stage !== "answering") {
      clearTimeout(timer.current);
      lock.current = false;
      setBusy(false);
    }
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [stage]);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setEnhanced(
        !query.matches && !new URLSearchParams(location.search).has("no3d"),
      );
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  function begin(k = 6) {
    clearTimeout(timer.current);
    lock.current = false;
    setBusy(false);
    setBits(k);
    setAnswers([]);
    setLastChoice(null);
    setStage("answering");
  }
  function answer(yes: boolean) {
    if (lock.current || stage !== "answering" || index >= bits) return;
    lock.current = true;
    setBusy(true);
    setLastChoice(yes);
    const next = [...answers, { weight: cards[index].weight, yes }];
    timer.current = setTimeout(
      () => {
        setAnswers(next);
        if (next.length === bits) setStage("reveal");
        setBusy(false);
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 380,
    );
  }
  function back() {
    if (lock.current) return;
    setLastChoice(null);
    setAnswers((a) => a.slice(0, -1));
    setStage("answering");
  }
  // Unlock and refresh keyboard handling in the same commit as the new card.
  // Passive effects can leave a brief window where Y/N still refers to the old card.
  useLayoutEffect(() => {
    if (!busy) lock.current = false;
  }, [busy]);
  useLayoutEffect(() => {
    function key(event: KeyboardEvent) {
      if (
        stage !== "answering" ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat
      )
        return;
      const target = event.target as HTMLElement;
      if (
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
        )
      )
        return;
      if (["y", "n"].includes(event.key.toLowerCase())) {
        event.preventDefault();
        answer(event.key.toLowerCase() === "y");
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  function explain() {
    setExample(result);
    setStage("explanation");
  }
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="app">
          <header>
            <a
              className="wordmark"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setStage("intro");
              }}
            >
              SIX<span className="logo-star">✦</span>
            </a>
            <span className="brand-caption">
              THE MATHEMATICS OF MIND READING
            </span>
            <nav aria-label="Main">
              <button
                onClick={() => setStage("intro")}
                aria-current={stage === "intro" ? "page" : undefined}
              >
                The trick
              </button>
              <button
                onClick={() => {
                  setBits(6);
                  setExample(42);
                  setStage("explanation");
                }}
              >
                The secret
              </button>
              <button onClick={() => setStage("lab")}>
                The lab <span aria-hidden="true">↗</span>
              </button>
            </nav>
          </header>
          <main>
            {stage === "intro" && (
              <section className="opening">
                <div className="intro-copy">
                  <p className="eyebrow">A LITTLE MAGIC. ALL IN YOUR MIND.</p>
                  <h1 ref={heading} tabIndex={-1}>
                    Think of a number.
                    <br />
                    <em>Keep it to yourself.</em>
                  </h1>
                  <p className="lead">Six cards. Six answers. One reveal.</p>
                  <p className="instruction">
                    Choose any whole number from <strong>1 to 63.</strong>
                    <br />
                    Don’t type it. Don’t say it. Just remember it.
                  </p>
                  <div className="intro-actions">
                    <button className="primary" onClick={() => begin()}>
                      Begin the trick <span aria-hidden="true">↗</span>
                    </button>
                    <button
                      className="text-button"
                      onClick={() => {
                        setBits(6);
                        setExample(42);
                        setStage("explanation");
                      }}
                    >
                      Explore the mathematics <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
                <div className="stage-art">
                  <div className="stage-halo" />
                  {enhanced && (
                    <DecorationBoundary>
                      <Suspense fallback={null}>
                        <Stage3D reveal={false} />
                      </Suspense>
                    </DecorationBoundary>
                  )}
                  <CardFan />
                  <span className="art-caption">NOTHING UP OUR SLEEVES.</span>
                </div>
                <div className="opening-bottom">
                  <span>01 — A moment of wonder</span>
                  <span>No guesses. No data. Just six decisions.</span>
                  <span>
                    Made of mathematics <span aria-hidden="true">✦</span>
                  </span>
                </div>
              </section>
            )}
            {stage === "answering" && (
              <section className="performance">
                <div className="performance-heading">
                  <p className="eyebrow">
                    KEEP YOUR NUMBER IN MIND · 1–{2 ** bits - 1}
                  </p>
                  <h1 ref={heading} tabIndex={-1}>
                    Is your number <br />
                    <em>on this card?</em>
                  </h1>
                  <p>Take your time. Look through every row.</p>
                  <div
                    className="progress"
                    aria-label={`Card ${index + 1} of ${bits}`}
                  >
                    {cards.map((c, i) => (
                      <span
                        key={c.weight}
                        className={
                          i < index ? "done" : i === index ? "current" : ""
                        }
                      >
                        {i < index ? "✓" : String(i + 1).padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                  <div className="session-note">
                    <span aria-hidden="true">✦</span>
                    <p>
                      {index === 0
                        ? "Your number stays with you."
                        : `${index} ${index === 1 ? "answer" : "answers"} placed. ${bits - index} to go.`}
                      <small>Scan left to right, one row at a time.</small>
                    </p>
                  </div>
                  <p className="keyboard-hint">
                    Keyboard: <kbd>Y</kbd> for yes · <kbd>N</kbd> for no
                  </p>
                </div>
                <div className="card-area">
                  <div className="completed-stack" aria-hidden="true">
                    {answers.map((a, i) => (
                      <span
                        key={a.weight}
                        style={{ "--stack-index": i } as React.CSSProperties}
                      >
                        <b>{String(i + 1).padStart(2, "0")}</b>
                        <span>✦</span>
                        <small>{a.yes ? "YES" : "NO"}</small>
                      </span>
                    ))}
                  </div>
                  <motion.div
                    className={`playing-card ${busy ? "departing" : ""}`}
                    key={index}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 18, rotate: -1.5 }
                    }
                    animate={
                      busy
                        ? {
                            opacity: 0,
                            y: 30,
                            x: lastChoice ? 35 : -35,
                            rotate: lastChoice ? 5 : -5,
                            scale: 0.94,
                          }
                        : { opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }
                    }
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 190, damping: 25 }
                    }
                  >
                    <div className="card-top">
                      <span>SIX</span>
                      <span>✦</span>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <Grid card={cards[index]} />
                    <div className="card-bottom">
                      LOOK CLOSELY. TRUST YOUR ANSWER.
                    </div>
                  </motion.div>
                  <p className="card-counter" aria-live="polite">
                    Card {index + 1} of {bits}
                  </p>
                  <div className="answer-actions">
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => answer(true)}
                    >
                      Yes, my number is here
                    </button>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => answer(false)}
                    >
                      No, it isn’t
                    </button>
                  </div>
                  <div className="under-actions">
                    <button disabled={index === 0 || busy} onClick={back}>
                      ← Back
                    </button>
                    <button disabled={busy} onClick={() => begin(bits)}>
                      Restart trick
                    </button>
                  </div>
                </div>
              </section>
            )}
            {stage === "reveal" && (
              <section className="reveal">
                {enhanced && (
                  <DecorationBoundary>
                    <Suspense fallback={null}>
                      <Stage3D reveal />
                    </Suspense>
                  </DecorationBoundary>
                )}
                <p className="eyebrow">
                  {bits === 6 ? "SIX" : bits} ANSWERS. ONE POSSIBILITY.
                </p>
                <h1 ref={heading} tabIndex={-1}>
                  {result ? "You were thinking of" : "A small mystery remains."}
                </h1>
                <div role="status" aria-live="polite">
                  {result ? (
                    <div
                      className="revealed-number"
                      aria-label={`Your number is ${result}`}
                    >
                      <span className="reveal-value">{result}</span>
                      <span aria-hidden="true">✦</span>
                    </div>
                  ) : (
                    <p className="recovery">
                      Something doesn’t quite add up. Every number from 1 to{" "}
                      {2 ** bits - 1} appears on at least one card. All your
                      answers were No, giving 0.
                    </p>
                  )}
                </div>
                <p>
                  {result
                    ? "Your secret was in the cards all along."
                    : "You can review your answers, or choose a number and start again."}
                </p>
                <div className="reveal-actions">
                  {result ? (
                    <button className="primary" onClick={explain}>
                      How did that work? →
                    </button>
                  ) : (
                    <button className="primary" onClick={back}>
                      Review answers
                    </button>
                  )}
                  <button className="secondary" onClick={() => begin(bits)}>
                    Try again
                  </button>
                  {result > 0 && (
                    <button className="text-button" onClick={back}>
                      Review answers
                    </button>
                  )}
                </div>
              </section>
            )}
            {stage === "explanation" && (
              <Explanation
                bits={bits}
                value={example}
                onChange={setExample}
                headingRef={heading}
                onLab={() => setStage("lab")}
              />
            )}
            {stage === "lab" && (
              <section className="lab">
                <p className="eyebrow">THE LAB</p>
                <h1 ref={heading} tabIndex={-1}>
                  Same secret.
                  <br />
                  <em>More possibilities.</em>
                </h1>
                <p className="section-lead">
                  Change the number of cards. The mathematics scales with you.
                </p>
                <label className="range-label">
                  Number of cards <strong>{bits}</strong>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={bits}
                    onChange={(e) => {
                      setBits(+e.target.value);
                      setInspect(0);
                      setExample(0);
                    }}
                  />
                </label>
                <p className="lab-formula">
                  {bits} cards <span>→</span> 2<sup>{bits}</sup> answer patterns{" "}
                  <span>→</span> {2 ** bits - 1} secret numbers
                </p>
                <div className="lab-stats">
                  <div>
                    <strong>1–{2 ** bits - 1}</strong>
                    <span>Secret number range</span>
                  </div>
                  <div>
                    <strong>{2 ** bits}</strong>
                    <span>Possible answer patterns</span>
                  </div>
                  <div>
                    <strong>{toBinary(2 ** bits - 1, bits)}</strong>
                    <span>Largest number in binary</span>
                  </div>
                </div>
                <div className="inspect-tabs">
                  {cards.map((c, i) => (
                    <button
                      key={c.weight}
                      aria-pressed={inspect === i}
                      onClick={() => setInspect(i)}
                    >
                      Card {i + 1} · {c.weight}
                    </button>
                  ))}
                </div>
                <p className="lesson-note">
                  Each card holds {2 ** (bits - 1)} numbers. The selected card
                  uses weight {cards[Math.min(inspect, bits - 1)].weight};
                  numbers are always generated in ascending order.
                </p>
                <div className="lab-card mini-card">
                  <p>
                    Weight {cards[Math.min(inspect, bits - 1)].weight} ·{" "}
                    {cards[0].numbers.length} numbers
                  </p>
                  <Grid card={cards[Math.min(inspect, bits - 1)]} />
                </div>
                <button className="primary" onClick={() => begin(bits)}>
                  Play with {bits} cards ↗
                </button>
                <button
                  className="text-button"
                  onClick={() => {
                    setExample(2 ** bits - 1);
                    setStage("explanation");
                  }}
                >
                  Explore these bits →
                </button>
              </section>
            )}
            {stage === "about" && (
              <section className="about">
                <p className="eyebrow">ABOUT THE PROJECT</p>
                <h1 ref={heading} tabIndex={-1}>
                  Where wonder
                  <br />
                  <em>meets understanding.</em>
                </h1>
                <p>
                  This student portfolio project connects the binary number-card
                  trick with programming and interaction design.
                </p>
                <div className="project-principles">
                  <div>
                    <strong>Mathematics</strong>
                    <p>Unique binary representations make the result exact.</p>
                  </div>
                  <div>
                    <strong>Engineering</strong>
                    <p>Pure functions, exhaustive tests and accessible HTML.</p>
                  </div>
                  <div>
                    <strong>Exploration</strong>
                    <p>
                      Change the cards, test a pattern and discover the rule.
                    </p>
                  </div>
                </div>
                <h2>The student’s story</h2>
                <p>
                  I’ve always enjoyed magic. SIX connects that interest with
                  binary numbers and interactive programming.
                </p>
                <h2>Beyond the trick</h2>
                <p>
                  Explore the binary switches, inspect how the cards are
                  generated, and use the lab to build the same trick with three
                  to eight cards.
                </p>
              </section>
            )}
          </main>
          <footer>
            <span>
              SIX <span className="footer-sub"> / A study in wonder</span>
            </span>
            <button onClick={() => setStage("about")}>
              About the project ↗
            </button>
            <span className="footer-sub">Magic, explained beautifully.</span>
          </footer>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
