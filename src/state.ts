import { atomWithStorage } from "jotai/utils";
import type { AmudSide, Place } from "./data/shas.ts";

export const SETTINGS_KEY = "daf-schedule-v1";

/** Dapim added by hand, not tied to a study day. */
export const ADDED_MISSED_DATE = "9999-12-31";

export type Language = "en" | "he" | "yeshiva";
export type CalendarView = "month" | "year" | "list";

export type DoneUnit = {
  key: string;
  daf: number;
  amud: AmudSide;
};

export type DoneToday = {
  date: string;
  from: { key: string; daf: number; amud?: AmudSide };
  count: number;
  units?: DoneUnit[];
};

export type MissedDay = {
  date: string;
  units: DoneUnit[];
};

export type Settings = {
  pace: number;
  place: Place | null;
  /** Day `place` is the next amud, at the start of that day (`YYYY-MM-DD`). */
  anchoredOn: string | null;
  studyDays: number[];
  doneToday: DoneToday | null;
  language: Language;
  customOrder: boolean;
  masechtaOrder: string[] | null;
  calendarView: CalendarView;
  compact: boolean;
  /** Hebrew calendar labels. Independent of `language`. Missing means Jewish dates. */
  jewishDates?: boolean;
  /** Study days marked not done. Missing means the day was counted as done. */
  missed?: MissedDay[];
};

const defaultSettings: Settings = {
  pace: 3,
  place: null,
  anchoredOn: null,
  studyDays: [0, 1, 2, 3, 4, 5, 6],
  doneToday: null,
  language: "en",
  jewishDates: true,
  customOrder: false,
  masechtaOrder: null,
  calendarView: "month",
  compact: false,
};

export const settingsAtom = atomWithStorage<Settings>(SETTINGS_KEY, defaultSettings, undefined, { getOnInit: true });

export function clampPace(pace: unknown): number {
  const value = Number(pace);
  if (!Number.isFinite(value)) return 3;
  const halfSteps = Math.round(value * 2) / 2;
  return Math.min(10, Math.max(0.5, halfSteps));
}

export function sanitizeLanguage(value: unknown): Language {
  if (value === "he" || value === "yeshiva") return value;
  return "en";
}

/** English keeps English names and dates. Hebrew and בני ישיבה use Hebrew for those facts. */
export function factsLanguage(language: Language): "en" | "he" {
  return language === "en" ? "en" : "he";
}

export function sanitizeCalendarView(value: unknown): CalendarView {
  return value === "year" || value === "list" ? value : "month";
}

export function sanitizeAnchoredOn(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function sanitizeMissed(value: unknown): MissedDay[] {
  if (!Array.isArray(value)) return [];
  const byDate = new Map<string, MissedDay>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const date = sanitizeAnchoredOn((item as { date?: unknown }).date);
    const rawUnits = (item as { units?: unknown }).units;
    if (!date || !Array.isArray(rawUnits)) continue;
    const units: DoneUnit[] = [];
    for (const unit of rawUnits) {
      if (!unit || typeof unit !== "object") continue;
      const key = (unit as { key?: unknown }).key;
      const daf = (unit as { daf?: unknown }).daf;
      const amud = (unit as { amud?: unknown }).amud;
      if (typeof key !== "string" || key.length === 0) continue;
      if (typeof daf !== "number" || !Number.isInteger(daf)) continue;
      if (amud !== "a" && amud !== "b") continue;
      units.push({ key, daf, amud });
    }
    if (units.length) byDate.set(date, { date, units });
  }
  return [...byDate.values()].sort((left, right) => left.date.localeCompare(right.date));
}

export function sanitizeDays(days: unknown): number[] {
  const unique = [...new Set((Array.isArray(days) ? days : []).map(Number))].filter(
    (day) => day >= 0 && day <= 6,
  );
  return unique.length ? unique.sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6];
}
