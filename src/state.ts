import { atomWithStorage } from "jotai/utils";
import type { AmudSide, Place } from "./data/shas.ts";

export const SETTINGS_KEY = "daf-schedule-v1";

export type Language = "en" | "he";
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
};

const defaultSettings: Settings = {
  pace: 3,
  place: null,
  anchoredOn: null,
  studyDays: [0, 1, 2, 3, 4, 5, 6],
  doneToday: null,
  language: "en",
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
  return value === "he" ? "he" : "en";
}

export function sanitizeCalendarView(value: unknown): CalendarView {
  return value === "year" || value === "list" ? value : "month";
}

export function sanitizeAnchoredOn(value: unknown): string | null {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export function sanitizeDays(days: unknown): number[] {
  const unique = [...new Set((Array.isArray(days) ? days : []).map(Number))].filter(
    (day) => day >= 0 && day <= 6,
  );
  return unique.length ? unique.sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6];
}
