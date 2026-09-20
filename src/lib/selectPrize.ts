import type { Prize } from "../config/prizes";

export interface SelectedPrize {
  prize: Prize;
  index: number;
}

export interface SelectPrizeOptions {
  /**
   * First-time visitors get one of three outcomes (equal chance):
   * 10% OFF, 15% OFF, or Better luck next time.
   */
  firstTime?: boolean;
}

function isTenPercentOff(prize: Prize): boolean {
  return prize.type === "offer" && /10\s*%/i.test(prize.label);
}

function isFifteenPercentOff(prize: Prize): boolean {
  return prize.type === "offer" && /15\s*%/i.test(prize.label);
}

function isBetterLuck(prize: Prize): boolean {
  return prize.type === "other";
}

function pickWeightedIndex(items: { weight: number; index: number }[]): number {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  if (total <= 0) {
    return items[Math.floor(Math.random() * items.length)]!.index;
  }

  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, item.weight);
    if (roll <= 0) return item.index;
  }
  return items[items.length - 1]!.index;
}

function pickUniformIndex(indexes: number[]): number {
  return indexes[Math.floor(Math.random() * indexes.length)]!;
}

/** Weighted random selection. Must run before the spin animation. */
export function selectPrize(
  prizes: Prize[],
  options: SelectPrizeOptions = {},
): SelectedPrize {
  if (prizes.length === 0) {
    throw new Error("No prizes configured");
  }

  if (options.firstTime) {
    const ten = prizes
      .map((prize, index) => ({ prize, index }))
      .filter(({ prize }) => isTenPercentOff(prize))
      .map(({ index }) => index);
    const fifteen = prizes
      .map((prize, index) => ({ prize, index }))
      .filter(({ prize }) => isFifteenPercentOff(prize))
      .map(({ index }) => index);
    const miss = prizes
      .map((prize, index) => ({ prize, index }))
      .filter(({ prize }) => isBetterLuck(prize))
      .map(({ index }) => index);

    const outcomes: number[][] = [];
    if (ten.length) outcomes.push(ten);
    if (fifteen.length) outcomes.push(fifteen);
    if (miss.length) outcomes.push(miss);

    if (outcomes.length > 0) {
      const group = outcomes[Math.floor(Math.random() * outcomes.length)]!;
      const index = pickUniformIndex(group);
      return { prize: prizes[index]!, index };
    }
  }

  const index = pickWeightedIndex(
    prizes.map((prize, index) => ({
      weight: prize.probability,
      index,
    })),
  );

  return { prize: prizes[index]!, index };
}
