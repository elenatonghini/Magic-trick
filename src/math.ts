export type NumberCard = { weight: number; numbers: number[] };
export type Answer = { weight: number; yes: boolean };
export function generateCards(bitCount: number): NumberCard[] {
  if (!Number.isInteger(bitCount) || bitCount < 3 || bitCount > 8)
    throw new RangeError("Choose 3–8 cards.");
  const numbers = Array.from({ length: 2 ** bitCount - 1 }, (_, i) => i + 1);
  // Descending order matches the written binary representation, left to right.
  return Array.from({ length: bitCount }, (_, i) => {
    const weight = 2 ** (bitCount - i - 1);
    return { weight, numbers: numbers.filter((n) => (n & weight) !== 0) };
  });
}
export function inferNumber(answers: Answer[]): number {
  return answers.reduce(
    (sum, answer) => sum + (answer.yes ? answer.weight : 0),
    0,
  );
}
export function toBinary(value: number, bitCount: number): string {
  if (!Number.isInteger(bitCount) || bitCount < 1 || bitCount > 8)
    throw new RangeError("Binary width must be 1–8 bits.");
  if (!Number.isInteger(value) || value < 0 || value >= 2 ** bitCount)
    throw new RangeError("Value must fit the bit count.");
  return value.toString(2).padStart(bitCount, "0");
}

/** Minimum fixed-length binary answers required to distinguish a positive count. */
export function minimumQuestions(possibilities: number): number {
  if (!Number.isSafeInteger(possibilities) || possibilities < 1)
    throw new RangeError("Possibilities must be a positive safe integer.");
  // Count doublings exactly; floating-point log2 can round down near large powers of two.
  let questions = 0;
  let patterns = 1;
  while (patterns < possibilities) {
    patterns *= 2;
    questions += 1;
  }
  return questions;
}
