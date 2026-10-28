# The mathematics

Each card represents a power of two. For k cards, the weights are 2^(k−1), …, 4, 2, 1. This project displays them largest first, matching the digits of an ordinary binary number. Other orders work if the answers retain their weights.

A card of weight w contains n exactly when `(n & w) !== 0`. The bitwise AND operator checks whether the relevant binary digit is one. The card contents are generated, not typed by hand.

## Worked example: 42

| Weight       | 32  | 16  | 8   | 4   | 2   | 1   |
| ------------ | --- | --- | --- | --- | --- | --- |
| Answer       | Yes | No  | Yes | No  | Yes | No  |
| Binary digit | 1   | 0   | 1   | 0   | 1   | 0   |

42 = 32 + 8 + 2 = 101010₂.

The app reconstructs 42 by adding exactly the weights whose answers were Yes.

## General formula

Let bᵢ be 0 for No and 1 for Yes. Then

n = Σᵢ₌₀ᵏ⁻¹ bᵢ × 2ⁱ.

Every integer in [0, 2ᵏ−1] has a unique k-bit representation. There are 2ᵏ possible answer patterns. Excluding all zeros gives 2ᵏ−1 possible secret numbers. Each card has 2^(k−1) numbers: fixing one digit to 1 leaves k−1 independently variable digits.

Six answers distinguish 64 outcomes, covering 1–63 plus zero. Five answers distinguish only 32 outcomes, so they cannot uniquely identify all 63 choices. This also applies to adaptive yes/no questions: a five-question binary decision tree has at most 32 leaves.

All-No is the only detectable out-of-range pattern. Any nonzero pattern represents a valid number. The app cannot tell whether someone misread a card or changed their number. It makes no such claim.

The lab supports k = 3…8: the same generation and reconstruction code works without changing the algorithm. JavaScript bitwise operators use 32-bit integers; the maximum supported value here, 255, is safely inside that limit.

## Why the sum is unique

Take two different binary patterns and find the largest weight where they differ. One pattern contains that weight w and the other does not. All lower weights sum to w−1, so their combined difference is too small to cancel w. Therefore different patterns must produce different sums. There are 2^k patterns and 2^k possible values from 0 through 2^k−1, so this is a one-to-one correspondence.

For N positive possibilities, the minimum worst-case number of binary answers is ceil(log₂ N). The implementation's `minimumQuestions` function makes this bound explicit. The five-question limit remains true for adaptive questions, because a binary decision tree of depth five has at most 32 leaves.

## Cost and scope

Generating the cards tests k bits against 2^k−1 candidate numbers: O(k·2^k) time and O(k·2^(k−1)) stored memberships. Reconstruction takes O(k) time. The lab stops at eight cards so each card has at most 128 numbers; larger values would be valid mathematics but poor scanning tasks. The bitwise range limitation and the practical interface limitation are distinct.
