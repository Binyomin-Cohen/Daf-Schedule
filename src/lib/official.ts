import { DAPIM, TOTAL, type Daf } from "../data/shas.ts";
import { startOfDay } from "./plan.ts";

// Berachos 2 of cycle 14, confirmed against the Daf Yomi API.
const ANCHOR = startOfDay(new Date(2020, 0, 5));
const ANCHOR_CYCLE = 14;

function ordinal(number: number): string {
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${number}th`;
  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
}

export type OfficialDay = {
  entry: Daf;
  index: number;
  cycleNumber: number;
  cycleLabel: string;
};

/** Today's Daf Yomi, using the same 2,711-day cycle the Shas.org API returns. */
export function officialOn(date: Date): OfficialDay {
  const days = Math.round((startOfDay(date).getTime() - ANCHOR.getTime()) / 86_400_000);
  const cycleOffset = Math.floor(days / TOTAL);
  const index = ((days % TOTAL) + TOTAL) % TOTAL;
  const cycleNumber = ANCHOR_CYCLE + cycleOffset;
  const entry = DAPIM[index];
  if (!entry) throw new Error("Daf Yomi index is outside the cycle");
  return {
    entry,
    index,
    cycleNumber,
    cycleLabel: `${ordinal(cycleNumber)} cycle`,
  };
}
