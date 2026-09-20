export type PrizeType = "offer" | "product" | "currency" | "other";

export interface Prize {
  id: string;
  type: PrizeType;
  /** Short display label on the wheel, e.g. "10% OFF", "FREE", "₹50 OFF" */
  label: string;
  /** Human-readable name for result screen (products) */
  name?: string;
  /** Optional product image path; null for text-only segments */
  image: string | null;
  /**
   * Relative weight for selection (higher = more likely).
   * Tuned so expected café cost ≈ ₹8/spin × 50 spins ≈ ₹400/day.
   */
  probability: number;
  /** Café cost when this prize is won (budget math only; not shown in UI) */
  cost?: number;
  segmentColor: string;
  textColor: string;
}

/**
 * Budget target: 50 spins/day → ~₹400 expected café cost (₹8/spin).
 *
 * Cost model used for weighting:
 * - Free products = menu price (229 / 199 / 249 / 279)
 * - ₹50 OFF = ₹50
 * - 10% / 15% / 20% OFF = ₹8 / ₹12 / ₹16 (promo unit cost)
 * - Better luck = ₹0
 *
 * First-time visitors: equal chance of 10% OFF, 15% OFF, or Better luck
 * (keeps first spins feeling random while staying near the daily budget).
 */
export const prizes: Prize[] = [
  {
    id: "discount10-a",
    type: "offer",
    label: "10% OFF",
    image: null,
    probability: 45,
    cost: 8,
    segmentColor: "#ff6eb4",
    textColor: "#ffffff",
  },
  {
    id: "free-choco-tsunami",
    type: "product",
    label: "FREE",
    name: "Choco Tsunami",
    image: "/images/products/choco-tsunami.png",
    probability: 5,
    cost: 229,
    segmentColor: "#fff0f7",
    textColor: "#c2185b",
  },
  {
    id: "discount15",
    type: "offer",
    label: "15% OFF",
    image: null,
    probability: 35,
    cost: 12,
    segmentColor: "#ff4d9e",
    textColor: "#ffffff",
  },
  {
    id: "free-matilda-cup",
    type: "product",
    label: "FREE",
    name: "Matilda Cup",
    image: "/images/products/matilda-cup.png",
    probability: 5,
    cost: 199,
    segmentColor: "#ffe0ec",
    textColor: "#c2185b",
  },
  {
    id: "discount20",
    type: "offer",
    label: "20% OFF",
    image: null,
    probability: 22,
    cost: 16,
    segmentColor: "#e91e8c",
    textColor: "#ffffff",
  },
  {
    id: "currency50",
    type: "currency",
    label: "₹50 OFF",
    image: null,
    probability: 24,
    cost: 50,
    segmentColor: "#ff80ab",
    textColor: "#5a1040",
  },
  {
    id: "free-cerelac-cup",
    type: "product",
    label: "FREE",
    name: "Cerelac Cup",
    image: "/images/products/cerelac-cup.png",
    probability: 6,
    cost: 249,
    segmentColor: "#fff5f9",
    textColor: "#c2185b",
  },
  {
    id: "discount10-b",
    type: "offer",
    label: "10% OFF",
    image: null,
    probability: 45,
    cost: 8,
    segmentColor: "#f06292",
    textColor: "#ffffff",
  },
  {
    id: "free-cheese-bomb",
    type: "product",
    label: "FREE",
    name: "Cheese Bomb",
    image: "/images/products/cheese-bomb.png",
    probability: 6,
    cost: 279,
    segmentColor: "#ffe8f2",
    textColor: "#c2185b",
  },
  {
    id: "better-luck",
    type: "other",
    label: "BETTER LUCK NEXT TIME",
    image: null,
    probability: 807,
    cost: 0,
    segmentColor: "#f8bbd0",
    textColor: "#5a1040",
  },
];
