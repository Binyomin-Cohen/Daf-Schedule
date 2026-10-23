import { AMUDIM, MASECHTOS } from "../data/shas.ts";

export const STANDARD_ORDER = MASECHTOS.map((masechta) => masechta.key);

const sequenceCache = new Map<string, number[]>();

export function sanitizeOrder(order: unknown): string[] {
  const known = new Set(STANDARD_ORDER);
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const key of Array.isArray(order) ? order : []) {
    if (typeof key === "string" && known.has(key) && !seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  for (const key of STANDARD_ORDER) {
    if (!seen.has(key)) keys.push(key);
  }
  return keys;
}

export function isStandardOrder(order: unknown): boolean {
  const keys = sanitizeOrder(order);
  return keys.length === STANDARD_ORDER.length && keys.every((key, index) => key === STANDARD_ORDER[index]);
}

/** Amud indexes in the order the schedule should learn them. */
export function studySequence(order: unknown): number[] {
  const keys = sanitizeOrder(order);
  const id = keys.join("|");
  const cached = sequenceCache.get(id);
  if (cached) return cached;

  const byKey = new Map<string, number[]>();
  for (const unit of AMUDIM) {
    const list = byKey.get(unit.key);
    if (list) list.push(unit.amudIndex);
    else byKey.set(unit.key, [unit.amudIndex]);
  }

  const sequence: number[] = [];
  for (const key of keys) {
    const list = byKey.get(key);
    if (list) sequence.push(...list);
  }
  sequenceCache.set(id, sequence);
  return sequence;
}

export function studyIndex(order: unknown): {
  sequence: number[];
  rank: Map<number, number>;
  lastRankByDaf: Map<number, number>;
} {
  const sequence = studySequence(order);
  const rank = new Map<number, number>();
  const lastRankByDaf = new Map<number, number>();
  sequence.forEach((amudIndex, index) => {
    rank.set(amudIndex, index);
    const unit = AMUDIM[amudIndex];
    if (!unit) return;
    const previous = lastRankByDaf.get(unit.index);
    if (previous === undefined || index > previous) lastRankByDaf.set(unit.index, index);
  });
  return { sequence, rank, lastRankByDaf };
}
