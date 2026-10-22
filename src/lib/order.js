import { AMUDIM, MASECHTOS } from "../data/shas.js";

export const STANDARD_ORDER = MASECHTOS.map((masechta) => masechta.key);

const sequenceCache = new Map();

export function sanitizeOrder(order) {
  const known = new Set(STANDARD_ORDER);
  const seen = new Set();
  const keys = [];
  for (const key of Array.isArray(order) ? order : []) {
    if (known.has(key) && !seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
  }
  for (const key of STANDARD_ORDER) {
    if (!seen.has(key)) keys.push(key);
  }
  return keys;
}

export function isStandardOrder(order) {
  const keys = sanitizeOrder(order);
  return keys.length === STANDARD_ORDER.length && keys.every((key, index) => key === STANDARD_ORDER[index]);
}

/** Amud indexes in the order the schedule should learn them. */
export function studySequence(order) {
  const keys = sanitizeOrder(order);
  const id = keys.join("|");
  const cached = sequenceCache.get(id);
  if (cached) return cached;

  const byKey = new Map();
  for (const unit of AMUDIM) {
    const list = byKey.get(unit.key);
    if (list) list.push(unit.amudIndex);
    else byKey.set(unit.key, [unit.amudIndex]);
  }

  const sequence = [];
  for (const key of keys) {
    const list = byKey.get(key);
    if (list) sequence.push(...list);
  }
  sequenceCache.set(id, sequence);
  return sequence;
}

export function studyIndex(order) {
  const sequence = studySequence(order);
  const rank = new Map();
  const lastRankByDaf = new Map();
  sequence.forEach((amudIndex, index) => {
    rank.set(amudIndex, index);
    const unit = AMUDIM[amudIndex];
    const previous = lastRankByDaf.get(unit.index);
    if (previous === undefined || index > previous) lastRankByDaf.set(unit.index, index);
  });
  return { sequence, rank, lastRankByDaf };
}
