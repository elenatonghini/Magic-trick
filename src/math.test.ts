import { describe, expect, it } from "vitest";
import { generateCards, inferNumber, toBinary } from "./math";
describe("binary trick", () => {
  for (let k = 3; k <= 8; k++)
    it(`exhaustively reconstructs ${k} bits`, () => {
      const cards = generateCards(k);
      cards.forEach((c) => {
        expect(c.numbers.length).toBe(2 ** (k - 1));
        expect(new Set(c.numbers).size).toBe(c.numbers.length);
        for (let n = 1; n < 2 ** k; n++)
          expect(c.numbers.includes(n)).toBe((n & c.weight) !== 0);
      });
      for (let n = 0; n < 2 ** k; n++) {
        expect(
          inferNumber(
            cards.map((c) => ({
              weight: c.weight,
              yes: c.numbers.includes(n),
            })),
          ),
        ).toBe(n);
        expect(toBinary(n, k)).toHaveLength(k);
      }
      expect(
        inferNumber(cards.map((c) => ({ weight: c.weight, yes: true }))),
      ).toBe(2 ** k - 1);
    });
  it("keeps weight ordering explicit", () => {
    expect(
      inferNumber([
        { weight: 2, yes: true },
        { weight: 32, yes: true },
        { weight: 8, yes: true },
      ]),
    ).toBe(42);
  });
  it("rejects unsupported values", () => {
    expect(() => generateCards(2)).toThrow();
    expect(() => toBinary(64, 6)).toThrow();
  });
});

import { minimumQuestions } from "./math";
describe("information bound and unique representations", () => {
  it("needs six binary questions for 63 choices", () => {
    expect(minimumQuestions(63)).toBe(6);
    expect(minimumQuestions(32)).toBe(5);
    expect(minimumQuestions(1)).toBe(0);
    expect(minimumQuestions(2 ** 52 + 1)).toBe(53);
    expect(() => minimumQuestions(0)).toThrow();
  });
  it("has no collisions between any supported answer patterns", () => {
    for (let k = 3; k <= 8; k++) {
      const cards = generateCards(k);
      const results = Array.from({ length: 2 ** k }, (_, pattern) =>
        inferNumber(
          cards.map((card) => ({
            weight: card.weight,
            yes: (pattern & card.weight) !== 0,
          })),
        ),
      );
      expect(new Set(results).size).toBe(2 ** k);
      expect(results.filter((n) => n === 0)).toHaveLength(1);
      expect(minimumQuestions(2 ** k - 1)).toBe(k);
    }
  });
  it("rejects invalid binary widths and fractional inputs", () => {
    for (const width of [0, 9, 1.5, NaN])
      expect(() => toBinary(0, width)).toThrow();
    expect(() => toBinary(1.5, 6)).toThrow();
    expect(() => generateCards(3.5)).toThrow();
  });
});
