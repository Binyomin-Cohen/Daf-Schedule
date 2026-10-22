import { AMUDIM, isLastAmud } from "../data/shas.js";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function monthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date, amount) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLong(date, locale = "en-US") {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatMonth(date, locale = "en-US") {
  return date.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

export function formatMonthName(date, locale = "en-US") {
  return date.toLocaleDateString(locale, { month: "long" });
}

export function formatYear(date, locale = "en-US") {
  return date.toLocaleDateString(locale, { year: "numeric" });
}

export function formatWeekday(date, locale = "en-US") {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function dafWord(count) {
  const amount = Math.round(count * 2) / 2;
  return amount === 0.5 || amount === 1 ? "daf" : "dapim";
}

export function formatPace(pace) {
  const rounded = Math.round(pace * 2) / 2;
  const whole = Math.floor(rounded);
  const half = Math.abs(rounded - whole - 0.5) < 0.001;
  if (rounded === 0.5) return "½";
  if (half) return `${whole}½`;
  return String(whole);
}

export function formatDafAmount(dapim) {
  const rounded = Math.round(Number(dapim) * 2) / 2;
  if (!Number.isFinite(rounded)) return "0";
  if (Number.isInteger(rounded)) return rounded.toLocaleString();
  const whole = Math.floor(rounded);
  return whole <= 0 ? "½" : `${whole.toLocaleString()}½`;
}

export function groupAmudim(indices) {
  const groups = [];
  for (const amudIndex of indices) {
    const unit = AMUDIM[amudIndex];
    if (!unit) continue;
    const previous = groups[groups.length - 1];
    if (previous && previous.key === unit.key && previous.endAmudIndex + 1 === amudIndex) {
      previous.end = unit;
      previous.endAmudIndex = amudIndex;
    } else {
      groups.push({
        key: unit.key,
        name: unit.name,
        shortName: unit.shortName,
        hebrew: unit.hebrew,
        color: unit.color,
        start: unit,
        end: unit,
        startAmudIndex: amudIndex,
        endAmudIndex: amudIndex,
      });
    }
  }
  return groups;
}

function amudMark(unit, hebrew) {
  if (!hebrew) return unit.amud;
  return unit.amud === "a" ? "א" : "ב";
}

export function formatGroup(group, { short = false, hebrew = false } = {}) {
  const name = hebrew ? group.hebrew : short ? group.shortName : group.name;
  const single = group.startAmudIndex === group.endAmudIndex;
  if (single) {
    if (group.start.amud === "a" && group.start.endAmud === "a") return `${name} ${group.start.daf}`;
    return `${name} ${group.start.daf}${amudMark(group.start, hebrew)}`;
  }
  if (group.start.daf === group.end.daf) return `${name} ${group.start.daf}`;
  const startComplete = group.start.amud === "a";
  const endComplete = group.end.amud === "b" || group.end.endAmud === "a";
  if (startComplete && endComplete) return `${name} ${group.start.daf}–${group.end.daf}`;
  const startText = startComplete ? String(group.start.daf) : `${group.start.daf}${amudMark(group.start, hebrew)}`;
  const endText = endComplete ? String(group.end.daf) : `${group.end.daf}${amudMark(group.end, hebrew)}`;
  return `${name} ${startText}–${endText}`;
}

export function formatIndices(indices, options) {
  return groupAmudim(indices)
    .map((group) => formatGroup(group, options))
    .join(" · ");
}

export function amudSteps(pace) {
  return Math.max(1, Math.round(pace * 2));
}

/**
 * Assign `pace` dapim (in half-daf steps) to each study day, beginning
 * on `start`. `position` is an index into `sequence` (amud indexes in
 * study order). The plan waits until the caller advances `position`.
 */
export function buildPlan({ position, pace, studyDays, start, sequence }) {
  const order = sequence ?? AMUDIM.map((unit) => unit.amudIndex);
  const allowed = new Set(studyDays);
  const byDate = new Map();
  const sessions = [];
  const stepSize = amudSteps(pace);
  const lastInOrder = order[order.length - 1];
  let cursor = position;
  let date = startOfDay(start);
  let guard = 0;

  while (cursor < order.length && guard < 80000) {
    if (allowed.has(date.getDay())) {
      const indices = [];
      let spent = 0;
      while (spent < stepSize && cursor < order.length) {
        const amudIndex = order[cursor];
        const unit = AMUDIM[amudIndex];
        indices.push(amudIndex);
        cursor += 1;
        spent += 1;
        // A daf that ends on amud aleph is still a whole daf, so the missing
        // bet counts toward the pace when the day has another half left.
        if (unit.amud === "a" && unit.endAmud === "a" && spent < stepSize) spent += 1;
      }
      const iso = toISODate(date);
      const session = {
        date: new Date(date),
        iso,
        indices,
        siyum: indices.some((index) => isLastAmud(index)),
        siyumHashas: indices.includes(lastInOrder),
        spent,
      };
      byDate.set(iso, session);
      sessions.push(session);
    }
    date = addDays(date, 1);
    guard += 1;
  }

  return {
    byDate,
    sessions,
    finishDate: sessions.length ? sessions[sessions.length - 1].date : null,
    studyDayCount: sessions.length,
  };
}

export function monthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let pad = 0; pad < firstWeekday; pad += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function remainingDapim(sequence, fromSeqIndex) {
  let amount = 0;
  for (let index = fromSeqIndex; index < sequence.length; index += 1) {
    const unit = AMUDIM[sequence[index]];
    amount += unit.amud === "a" && unit.endAmud === "a" ? 1 : 0.5;
  }
  return amount;
}

export function nextMasechtaOn(plan, sequence, fromSeqIndex) {
  const current = AMUDIM[sequence[fromSeqIndex]];
  if (!current) return null;
  let lastSeq = fromSeqIndex;
  while (lastSeq + 1 < sequence.length && AMUDIM[sequence[lastSeq + 1]].key === current.key) lastSeq += 1;
  const lastAmud = sequence[lastSeq];
  const nextAmud = sequence[lastSeq + 1];
  const upcoming = nextAmud === undefined ? null : AMUDIM[nextAmud];
  let finishes = null;
  let starts = null;
  for (const session of plan.sessions) {
    if (!finishes && session.indices.includes(lastAmud)) finishes = session;
    if (upcoming && !starts && session.indices.includes(nextAmud)) starts = session;
    if (finishes && (starts || !upcoming)) break;
  }
  return { current, upcoming, finishes, starts };
}
