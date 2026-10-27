import { AMUDIM, isLastAmud, type Amud } from "../data/shas.ts";

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addDays(date: Date, amount: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return startOfDay(new Date());
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function formatLong(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatMonth(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" });
}

export function formatMonthName(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, { month: "long" });
}

export function formatYear(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, { year: "numeric" });
}

export function formatWeekday(date: Date, locale = "en-US"): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function dafWord(count: number): string {
  const amount = Math.round(count * 2) / 2;
  return amount === 0.5 || amount === 1 ? "daf" : "dapim";
}

export function formatPace(pace: number): string {
  const rounded = Math.round(pace * 2) / 2;
  const whole = Math.floor(rounded);
  const half = Math.abs(rounded - whole - 0.5) < 0.001;
  if (rounded === 0.5) return "½";
  if (half) return `${whole}½`;
  return String(whole);
}

export function formatDafAmount(dapim: number): string {
  const rounded = Math.round(Number(dapim) * 2) / 2;
  if (!Number.isFinite(rounded)) return "0";
  if (Number.isInteger(rounded)) return rounded.toLocaleString();
  const whole = Math.floor(rounded);
  return whole <= 0 ? "½" : `${whole.toLocaleString()}½`;
}

export type AmudGroup = {
  key: string;
  name: string;
  shortName: string;
  hebrew: string;
  color: string;
  start: Amud;
  end: Amud;
  startAmudIndex: number;
  endAmudIndex: number;
};

export function groupAmudim(indices: number[]): AmudGroup[] {
  const groups: AmudGroup[] = [];
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

const HEBREW_ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const HEBREW_TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HEBREW_HUNDREDS = ["", "ק", "ר", "ש", "ת"];

/** Daf numbers as Hebrew letters: 22 is כב, and 15 and 16 are טו and טז. */
export function hebrewNumeral(value: number): string {
  const number = Math.trunc(value);
  if (number <= 0 || number >= 1000) return String(value);
  const hundreds = Math.floor(number / 100);
  const belowHundred = number % 100;
  const prefix = HEBREW_HUNDREDS[hundreds] ?? "";
  if (belowHundred === 15) return `${prefix}טו`;
  if (belowHundred === 16) return `${prefix}טז`;
  const tens = Math.floor(belowHundred / 10);
  const ones = belowHundred % 10;
  return `${prefix}${HEBREW_TENS[tens] ?? ""}${HEBREW_ONES[ones] ?? ""}`;
}

function amudMark(unit: Amud, hebrew: boolean): string {
  if (!hebrew) return unit.amud;
  return unit.amud === "a" ? "א" : "ב";
}

function dafText(daf: number, hebrew: boolean): string {
  return hebrew ? hebrewNumeral(daf) : String(daf);
}

function withAmud(daf: number, unit: Amud, hebrew: boolean): string {
  const number = dafText(daf, hebrew);
  const mark = amudMark(unit, hebrew);
  return hebrew ? `${number} ${mark}` : `${number}${mark}`;
}

export type FormatGroupOptions = {
  short?: boolean;
  hebrew?: boolean;
};

export function formatGroup(group: AmudGroup, { short = false, hebrew = false }: FormatGroupOptions = {}): string {
  const name = hebrew ? group.hebrew : short ? group.shortName : group.name;
  const single = group.startAmudIndex === group.endAmudIndex;
  if (single) {
    if (group.start.amud === "a" && group.start.endAmud === "a") return `${name} ${dafText(group.start.daf, hebrew)}`;
    return `${name} ${withAmud(group.start.daf, group.start, hebrew)}`;
  }
  if (group.start.daf === group.end.daf) return `${name} ${dafText(group.start.daf, hebrew)}`;
  const startComplete = group.start.amud === "a";
  const endComplete = group.end.amud === "b" || group.end.endAmud === "a";
  if (startComplete && endComplete) return `${name} ${dafText(group.start.daf, hebrew)}–${dafText(group.end.daf, hebrew)}`;
  const startText = startComplete ? dafText(group.start.daf, hebrew) : withAmud(group.start.daf, group.start, hebrew);
  const endText = endComplete ? dafText(group.end.daf, hebrew) : withAmud(group.end.daf, group.end, hebrew);
  return `${name} ${startText}–${endText}`;
}

export function formatIndices(indices: number[], options?: FormatGroupOptions): string {
  return groupAmudim(indices)
    .map((group) => formatGroup(group, options))
    .join(" · ");
}

export function amudSteps(pace: number): number {
  return Math.max(1, Math.round(pace * 2));
}

export type Session = {
  date: Date;
  iso: string;
  indices: number[];
  siyum: boolean;
  siyumHashas: boolean;
  spent: number;
};

export type Plan = {
  byDate: Map<string, Session>;
  sessions: Session[];
  finishDate: Date | null;
  studyDayCount: number;
};

/**
 * Sequence index of the next amud at the start of `date`, after applying
 * the pace on each study day from `anchoredOn` up to, but not including, `date`.
 */
export function positionOnDate({
  position,
  pace,
  studyDays,
  anchoredOn,
  date,
  sequence,
}: {
  position: number;
  pace: number;
  studyDays: number[];
  anchoredOn: Date;
  date: Date;
  sequence?: number[];
}): number {
  const from = startOfDay(anchoredOn);
  const until = startOfDay(date);
  if (until.getTime() <= from.getTime()) return position;
  const plan = buildPlan({ position, pace, studyDays, start: from, sequence });
  const untilIso = toISODate(until);
  let cursor = position;
  for (const session of plan.sessions) {
    if (session.iso >= untilIso) break;
    cursor += session.indices.length;
  }
  return cursor;
}

/**
 * Assign `pace` dapim (in half-daf steps) to each study day, beginning
 * on `start`. `position` is an index into `sequence` (amud indexes in
 * study order).
 */
export function buildPlan({
  position,
  pace,
  studyDays,
  start,
  sequence,
}: {
  position: number;
  pace: number;
  studyDays: number[];
  start: Date;
  sequence?: number[];
}): Plan {
  const order = sequence ?? AMUDIM.map((unit) => unit.amudIndex);
  const allowed = new Set(studyDays);
  const byDate = new Map<string, Session>();
  const sessions: Session[] = [];
  const stepSize = amudSteps(pace);
  const lastInOrder = order[order.length - 1];
  let cursor = position;
  let date = startOfDay(start);
  let guard = 0;

  while (cursor < order.length && guard < 80000) {
    if (allowed.has(date.getDay())) {
      const indices: number[] = [];
      let spent = 0;
      while (spent < stepSize && cursor < order.length) {
        const amudIndex = order[cursor];
        const unit = amudIndex === undefined ? undefined : AMUDIM[amudIndex];
        if (amudIndex === undefined || !unit) break;
        indices.push(amudIndex);
        cursor += 1;
        spent += 1;
        // A daf that ends on amud aleph is still a whole daf, so the missing
        // bet counts toward the pace when the day has another half left.
        if (unit.amud === "a" && unit.endAmud === "a" && spent < stepSize) spent += 1;
      }
      const iso = toISODate(date);
      const session: Session = {
        date: new Date(date),
        iso,
        indices,
        siyum: indices.some((index) => isLastAmud(index)),
        siyumHashas: lastInOrder !== undefined && indices.includes(lastInOrder),
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
    finishDate: sessions.length ? sessions[sessions.length - 1]!.date : null,
    studyDayCount: sessions.length,
  };
}

export function monthCells(year: number, month: number): Array<Date | null> {
  const firstWeekday = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let pad = 0; pad < firstWeekday; pad += 1) cells.push(null);
  for (let day = 1; day <= count; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function remainingDapim(sequence: number[], fromSeqIndex: number): number {
  let amount = 0;
  for (let index = fromSeqIndex; index < sequence.length; index += 1) {
    const amudIndex = sequence[index];
    const unit = amudIndex === undefined ? undefined : AMUDIM[amudIndex];
    if (!unit) continue;
    amount += unit.amud === "a" && unit.endAmud === "a" ? 1 : 0.5;
  }
  return amount;
}

export type MasechtaBoundary = {
  current: Amud;
  upcoming: Amud | null;
  finishes: Session | null;
  starts: Session | null;
};

export function nextMasechtaOn(plan: Plan, sequence: number[], fromSeqIndex: number): MasechtaBoundary | null {
  const currentIndex = sequence[fromSeqIndex];
  const current = currentIndex === undefined ? undefined : AMUDIM[currentIndex];
  if (!current) return null;
  let lastSeq = fromSeqIndex;
  while (lastSeq + 1 < sequence.length) {
    const nextIndex = sequence[lastSeq + 1];
    const nextUnit = nextIndex === undefined ? undefined : AMUDIM[nextIndex];
    if (!nextUnit || nextUnit.key !== current.key) break;
    lastSeq += 1;
  }
  const lastAmud = sequence[lastSeq];
  const nextAmud = sequence[lastSeq + 1];
  const upcoming = nextAmud === undefined ? null : (AMUDIM[nextAmud] ?? null);
  let finishes: Session | null = null;
  let starts: Session | null = null;
  for (const session of plan.sessions) {
    if (!finishes && lastAmud !== undefined && session.indices.includes(lastAmud)) finishes = session;
    if (upcoming && nextAmud !== undefined && !starts && session.indices.includes(nextAmud)) starts = session;
    if (finishes && (starts || !upcoming)) break;
  }
  return { current, upcoming, finishes, starts };
}
