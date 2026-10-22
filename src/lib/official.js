import { DAPIM, TOTAL } from "../data/shas.js";
import { startOfDay } from "./plan.js";

// Berachos 2 of cycle 14, confirmed against the Daf Yomi API.
const ANCHOR = startOfDay(new Date(2020, 0, 5));
const ANCHOR_CYCLE = 14;

function ordinal(number) {
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

/** Today's Daf Yomi, using the same 2,711-day cycle the Shas.org API returns. */
export function officialOn(date) {
  const days = Math.round((startOfDay(date).getTime() - ANCHOR.getTime()) / 86_400_000);
  const cycleOffset = Math.floor(days / TOTAL);
  const index = ((days % TOTAL) + TOTAL) % TOTAL;
  const cycleNumber = ANCHOR_CYCLE + cycleOffset;
  return {
    entry: DAPIM[index],
    index,
    cycleNumber,
    cycleLabel: `${ordinal(cycleNumber)} cycle`,
  };
}
