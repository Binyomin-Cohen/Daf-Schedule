import { addDays, formatMonth, formatMonthName, formatWeekday, formatYear, hebrewNumeral, startOfDay } from "./plan.ts";

export type DateStyle = { lang: "en" | "he"; jewish: boolean };

const HEBREW_ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const HEBREW_TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HEBREW_HUNDREDS = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];

const englishMonthYear = new Intl.DateTimeFormat("en-u-ca-hebrew", { month: "long", year: "numeric" });
const englishMonth = new Intl.DateTimeFormat("en-u-ca-hebrew", { month: "long" });
const englishDay = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric" });
const englishYear = new Intl.DateTimeFormat("en-u-ca-hebrew", { year: "numeric" });
const hebrewMonth = new Intl.DateTimeFormat("he-u-ca-hebrew", { month: "long" });

const tishreiCache = new Map<number, Date>();

function localeOf(style: DateStyle): string {
  return style.lang === "he" ? "he-IL" : "en-US";
}

function part(date: Date, formatter: Intl.DateTimeFormat, type: Intl.DateTimeFormatPartTypes): string {
  return formatter.formatToParts(date).find((item) => item.type === type)?.value ?? "";
}

/** Hebrew letters for a year written without the thousands, such as 5787 → תשפז. */
function hebrewYearLabel(year: number): string {
  const within = year % 1000;
  const hundreds = Math.floor(within / 100);
  const below = within % 100;
  const prefix = HEBREW_HUNDREDS[hundreds] ?? "";
  if (below === 15) return `${prefix}טו`;
  if (below === 16) return `${prefix}טז`;
  const tens = Math.floor(below / 10);
  const ones = below % 10;
  return `${prefix}${HEBREW_TENS[tens] ?? ""}${HEBREW_ONES[ones] ?? ""}`;
}

export function hebrewDayNumber(date: Date): number {
  const value = Number(part(date, englishDay, "day"));
  return Number.isInteger(value) ? value : 1;
}

export function hebrewYearNumber(date: Date): number {
  const value = Number(part(date, englishYear, "year"));
  return Number.isInteger(value) ? value : 5787;
}

function monthKey(date: Date): string {
  return englishMonthYear.format(date);
}

export function hebrewMonthStart(date: Date): Date {
  return addDays(startOfDay(date), 1 - hebrewDayNumber(date));
}

export function hebrewMonthLength(date: Date): number {
  const start = hebrewMonthStart(date);
  const key = monthKey(start);
  let days = 1;
  while (days < 31 && monthKey(addDays(start, days)) === key) days += 1;
  return days;
}

export function addHebrewMonths(date: Date, amount: number): Date {
  let cursor = hebrewMonthStart(date);
  const toward = amount < 0 ? -1 : 1;
  let left = Math.abs(Math.trunc(amount));
  while (left > 0) {
    cursor = toward > 0 ? addDays(cursor, hebrewMonthLength(cursor)) : hebrewMonthStart(addDays(cursor, -1));
    left -= 1;
  }
  return cursor;
}

export function tishreiOf(year: number): Date {
  const cached = tishreiCache.get(year);
  if (cached) return cached;
  let cursor = new Date(year - 3761, 8, 1);
  for (let step = 0; step < 90; step += 1) {
    if (hebrewYearNumber(cursor) === year && hebrewDayNumber(cursor) === 1 && englishMonth.format(cursor) === "Tishri") {
      tishreiCache.set(year, cursor);
      return cursor;
    }
    cursor = addDays(cursor, 1);
  }
  return new Date(year - 3761, 8, 1);
}

export function addHebrewYears(date: Date, amount: number): Date {
  return tishreiOf(hebrewYearNumber(date) + amount);
}

export function hebrewMonths(year: number): Date[] {
  const months: Date[] = [];
  let cursor = tishreiOf(year);
  while (hebrewYearNumber(cursor) === year && months.length < 14) {
    months.push(cursor);
    cursor = addDays(cursor, hebrewMonthLength(cursor));
  }
  return months;
}

export function hebrewMonthCells(date: Date): Array<Date | null> {
  const start = hebrewMonthStart(date);
  const days = hebrewMonthLength(start);
  const cells: Array<Date | null> = [];
  for (let pad = 0; pad < start.getDay(); pad += 1) cells.push(null);
  for (let day = 0; day < days; day += 1) cells.push(addDays(start, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function jewishMonthName(date: Date, style: DateStyle): string {
  const formatter = style.lang === "he" ? hebrewMonth : englishMonth;
  return formatter.format(date);
}

export function formatScheduleDay(date: Date, style: DateStyle): string {
  if (!style.jewish) return String(date.getDate());
  const day = hebrewDayNumber(date);
  return style.lang === "he" ? hebrewNumeral(day) : String(day);
}

export function formatScheduleMonthName(date: Date, style: DateStyle): string {
  if (!style.jewish) return formatMonthName(date, localeOf(style));
  return jewishMonthName(hebrewMonthStart(date), style);
}

export function formatScheduleMonth(date: Date, style: DateStyle): string {
  if (!style.jewish) return date.toLocaleDateString(localeOf(style), { month: "long", year: "numeric" });
  const start = hebrewMonthStart(date);
  const name = jewishMonthName(start, style);
  const year = hebrewYearNumber(start);
  return style.lang === "he" ? `${name} ${hebrewYearLabel(year)}` : `${name} ${year}`;
}

export function formatScheduleYear(date: Date, style: DateStyle): string {
  if (!style.jewish) return formatYear(date, localeOf(style));
  const year = hebrewYearNumber(date);
  return style.lang === "he" ? hebrewYearLabel(year) : String(year);
}

export function formatScheduleWhen(date: Date, style: DateStyle): string {
  if (!style.jewish) return formatWeekday(date, localeOf(style));
  const weekday = date.toLocaleDateString(localeOf(style), { weekday: "long" });
  return `${weekday}, ${formatScheduleDay(date, style)} ${jewishMonthName(date, style)}`;
}

export function formatScheduleLong(date: Date, style: DateStyle): string {
  if (!style.jewish) return date.toLocaleDateString(localeOf(style), { weekday: "long", month: "long", day: "numeric" });
  const weekday = date.toLocaleDateString(localeOf(style), { weekday: "long" });
  const year = hebrewYearNumber(date);
  const yearLabel = style.lang === "he" ? hebrewYearLabel(year) : String(year);
  return `${weekday}, ${formatScheduleDay(date, style)} ${jewishMonthName(date, style)} ${yearLabel}`;
}

export function formatScheduleFull(date: Date, style: DateStyle): string {
  if (!style.jewish) return formatMonth(date, localeOf(style));
  const year = hebrewYearNumber(date);
  const yearLabel = style.lang === "he" ? hebrewYearLabel(year) : String(year);
  return `${formatScheduleDay(date, style)} ${jewishMonthName(date, style)} ${yearLabel}`;
}
