import { useState, type RefObject } from "react";
import { generateCards, toBinary, minimumQuestions } from "./math";

type Props = {
  bits: number;
  value: number;
  onChange: (value: number) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onLab: () => void;
};

/** The same ordered card data drives the switches, equation and membership views. */
export default function Explanation({
  bits,
  value,
  onChange,
  headingRef,
  onLab,
}: Props) {
  const cards = generateCards(bits);
  const [questions, setQuestions] = useState(Math.max(1, bits - 1));
  const [showPrediction, setShowPrediction] = useState(false);
  const [inspected, setInspected] = useState(0);
  const inspectedCard = cards[Math.min(inspected, bits - 1)];
  const selected = cards.filter((card) => (value & card.weight) !== 0);
  const binary = toBinary(value, bits);
  return (
    <section className="explanation">
      <p className="eyebrow">BEHIND THE CURTAIN</p>
      <h1 ref={headingRef} tabIndex={-1}>
        Not a lucky guess.
        <br />
        <em>A language of yes and no.</em>
      </h1>
      <p className="section-lead">
        The trick never reads your mind. It reads a pattern.
        <br />
        Each answer is one bit: a tiny piece of information.
      </p>
      <div className="lesson-heading">
        <span>01</span>
        <div>
          <h2>Build a number from decisions.</h2>
          <p>
            Switch a weight on or off. The digits and the cards tell the same
            story, in the same order.
          </p>
        </div>
      </div>
      <div className="binary-workbench">
        <div className="workbench-top">
          <span>{bits} BITS · LARGEST WEIGHT FIRST</span>
          <span>YES = 1 / NO = 0</span>
        </div>
        <div className={`switches ${bits > 6 ? "many-bits" : ""}`}>
          {cards.map((card, index) => {
            const on = !!(value & card.weight);
            return (
              <button
                role="switch"
                aria-checked={on}
                aria-label={`Weight ${card.weight}`}
                key={card.weight}
                onClick={() => onChange(value ^ card.weight)}
              >
                <span>{card.weight}</span>
                <span className={`switch-track ${on ? "on" : ""}`}>
                  <span />
                </span>
                <strong className={on ? "bit-on" : ""}>{binary[index]}</strong>
                <small>{on ? "Yes" : "No"}</small>
              </button>
            );
          })}
        </div>
        <div
          className="equation"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <strong key={value}>{value}</strong>
          <span>
            = {selected.map((c) => c.weight).join(" + ") || "0"}
            <br />
            <span className="binary-value">
              {binary}
              <sub>2</sub>
            </span>
          </span>
        </div>
        <p className="workbench-caption">
          {value === 0
            ? "All switches off: a valid binary pattern, excluded from the secret-number range."
            : `${value} in decimal. ${binary} in binary. Two ways to write the same number.`}
        </p>
      </div>
      {bits > 6 && (
        <p className="lesson-note switch-scroll-hint">
          On narrow screens, swipe the switch row or use Tab to reach every
          weight.
        </p>
      )}
      <div
        className="card-correspondence"
        aria-label="Cards associated with the switches"
      >
        {cards.map((card, i) => (
          <button
            type="button"
            title={`Inspect card ${i + 1}, weight ${card.weight}`}
            aria-pressed={inspected === i}
            onClick={() => setInspected(i)}
            key={card.weight}
            className={`bit-card ${value & card.weight ? "bit-card-on" : ""}`}
          >
            <span>Card {i + 1}</span>
            <strong>{card.weight}</strong>
            <span>
              {value & card.weight ? "Yes · included" : "No · excluded"}
            </span>
          </button>
        ))}
      </div>
      <details className="card-inspector" open>
        <summary>
          Inspect a generated card · weight {inspectedCard.weight}
        </summary>
        <div className="inspector-layout">
          <div>
            <h3>One weight. {inspectedCard.numbers.length} numbers.</h3>
            <p>
              {value === 0
                ? "Zero is excluded from every playing card."
                : `${value} ${value & inspectedCard.weight ? "appears" : "does not appear"} on this card because its weight-${inspectedCard.weight} bit is ${value & inspectedCard.weight ? "1" : "0"}.`}
            </p>
            <p>
              Choose a card above to inspect its numbers. The current example is
              outlined when it belongs.
            </p>
          </div>
          <div className="mini-card">
            <div
              className="number-grid"
              role="region"
              tabIndex={0}
              aria-label={`Numbers on the weight ${inspectedCard.weight} card`}
            >
              {inspectedCard.numbers.map((n) => (
                <span
                  key={n}
                  className={n === value ? "example-number" : undefined}
                  aria-label={n === value ? `${n}, current example` : undefined}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>
      </details>
      <div className="lesson-heading">
        <span>02</span>
        <div>
          <h2>Why are those numbers on the cards?</h2>
          <p>
            A card includes exactly the numbers with a 1 in its binary position.
          </p>
        </div>
      </div>
      <div
        className="membership-table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Number membership by card; scroll horizontally if needed"
      >
        <table className="membership-table">
          <caption>
            Follow {value} across all {bits} cards
          </caption>
          <thead>
            <tr>
              <th scope="col">Card weight</th>
              {cards.map((c) => (
                <th scope="col" key={c.weight}>
                  {c.weight}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Binary digit</th>
              {cards.map((c) => (
                <td key={c.weight}>{value & c.weight ? "1" : "0"}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Is {value} on it?</th>
              {cards.map((c) => (
                <td key={c.weight}>
                  {value === 0 ? "No*" : value & c.weight ? "Yes" : "No"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="lesson-note">
        {value === 0
          ? "* Zero is deliberately absent from every playing card. Its binary digits are all zero."
          : `For example: ${value} & ${cards[0].weight} = ${value & cards[0].weight}. The & operator keeps only bits that are 1 in both numbers.`}
      </p>
      <div className="lesson-heading">
        <span>03</span>
        <div>
          <h2>
            Why {bits} questions? Why not {bits - 1}?
          </h2>
          <p>
            Every yes/no question can double the number of distinct answer
            patterns.
          </p>
        </div>
      </div>
      <div className="capacity-lab">
        <label htmlFor="question-count">
          Explore the information limit{" "}
          <strong>
            {questions} {questions === 1 ? "question" : "questions"}
          </strong>
        </label>
        <input
          id="question-count"
          type="range"
          min="1"
          max={bits}
          value={questions}
          onChange={(e) => setQuestions(+e.target.value)}
        />
        <div className="capacity-summary">
          <strong>
            2<sup>{questions}</sup> = {2 ** questions}
          </strong>
          <p>
            {2 ** questions < 2 ** bits - 1
              ? `Only ${2 ** questions} patterns for ${2 ** bits - 1} secret numbers. Some numbers would have to share a pattern.`
              : `${2 ** questions} patterns: one for every number from 0 to ${2 ** bits - 1}. Set zero aside and every secret has a place.`}
          </p>
        </div>
        <div
          className={`outcome-map ${bits > 6 ? "compact" : ""}`}
          aria-hidden="true"
        >
          {Array.from({ length: 2 ** bits }, (_, i) => (
            <span key={i} className={i < 2 ** questions ? "available" : ""}>
              {bits <= 6 ? i : ""}
            </span>
          ))}
        </div>
        <p className="lesson-note">
          Filled spaces are available answer patterns. {2 ** bits - 1} distinct
          numbers need at least {minimumQuestions(2 ** bits - 1)} binary
          answers.
        </p>
      </div>
      <div className="explain-columns proof-columns">
        <div>
          <h2>Why is the answer unique?</h2>
          <p>
            Imagine two different bit patterns. At their largest differing
            weight, one includes that power of two and the other does not. Even
            all the smaller weights together add to one less than that weight.
            They cannot cancel the difference.
          </p>
          <p>
            So no two patterns give the same sum. This is why the trick is
            guaranteed when the number is in range and every answer is accurate.
          </p>
        </div>
        <div>
          <h2>What if an answer is wrong?</h2>
          <p>
            Every nonzero answer pattern names a valid number. The app cannot
            detect a misread card or a changed choice. All-No gives zero, the
            only pattern outside the playing range.
          </p>
          <p>
            The mechanism is deterministic: identical answers always produce the
            same result. There is no AI inference or personal data involved.
          </p>
        </div>
      </div>
      <details className="code-panel">
        <summary>Show the code · three small functions</summary>
        <div className="code-step">
          <h3>1. Generate membership</h3>
          <pre>{`const numbers = Array.from({ length: 2 ** bitCount - 1 },\n  (_, index) => index + 1);\nconst card = numbers.filter(n => (n & weight) !== 0);`}</pre>
          <p>
            Generate the valid range, then keep numbers whose selected bit is
            on. Every card has half of the 2ᵏ possible values.
          </p>
        </div>
        <div className="code-step">
          <h3>2. Reconstruct the number</h3>
          <pre>{`function inferNumber(answers) {\n  return answers.reduce((sum, answer) =>\n    sum + (answer.yes ? answer.weight : 0), 0);\n}`}</pre>
          <p>
            Answers retain their weights. Reordering the cards cannot silently
            change what a Yes means.
          </p>
        </div>
        <div className="code-step">
          <h3>3. Write the binary digits</h3>
          <pre>{`value.toString(2).padStart(bitCount, '0');`}</pre>
          <p>
            Base 2 uses only 0 and 1. Leading zeros keep all positions aligned.
          </p>
        </div>
      </details>
      <div className="prediction">
        <div>
          <p className="eyebrow">TRY THE REASONING YOURSELF</p>
          <h2>Which cards would contain {2 ** (bits - 1) + 3}?</h2>
          <p>
            Work it out before checking. Break the number into powers of two.
          </p>
        </div>
        <button
          className="secondary"
          aria-expanded={showPrediction}
          onClick={() => setShowPrediction((v) => !v)}
        >
          {showPrediction ? "Hide the answer" : "Check my reasoning"}
        </button>
        {showPrediction && (
          <p className="prediction-answer" role="status">
            {2 ** (bits - 1) + 3} = {2 ** (bits - 1)} + 2 + 1 ={" "}
            {toBinary(2 ** (bits - 1) + 3, bits)}₂. Select the cards with those
            three weights.
          </p>
        )}
      </div>
      <button className="primary" onClick={onLab}>
        Build your own trick ↗
      </button>
    </section>
  );
}
