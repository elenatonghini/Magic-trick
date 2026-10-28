import {
  m as motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { CSSProperties } from "react";
import { generateCards } from "./math";

export default function CardFan() {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 85, damping: 23 });
  const rotateY = useSpring(y, { stiffness: 85, damping: 23 });
  return (
    <motion.div
      className="fan-tilt"
      style={{ rotateX, rotateY }}
      aria-hidden="true"
      onPointerMove={(event) => {
        if (
          reduced ||
          event.pointerType !== "mouse" ||
          !matchMedia("(pointer: fine)").matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(
          (-(event.clientY - rect.top - rect.height / 2) / rect.height) * 8,
        );
        y.set(((event.clientX - rect.left - rect.width / 2) / rect.width) * 10);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      <div className="fan">
        {generateCards(6).map((card, i) => (
          <div
            className="fan-card"
            key={card.weight}
            style={{ "--i": i } as CSSProperties}
          >
            <span className="corner">✦</span>
            <div className="card-rule" />
            <div className="number-grid">
              {card.numbers.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
            <div className="card-rule" />
            <span className="card-signature">S I X</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
