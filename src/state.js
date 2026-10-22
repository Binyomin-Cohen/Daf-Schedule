import { atomWithStorage } from "jotai/utils";

export const SETTINGS_KEY = "daf-schedule-v1";

export const settingsAtom = atomWithStorage(
  SETTINGS_KEY,
  {
    pace: 3,
    place: null,
    studyDays: [0, 1, 2, 3, 4, 5, 6],
    doneToday: null,
    language: "en",
    customOrder: false,
    masechtaOrder: null,
    calendarView: "month",
  },
  undefined,
  { getOnInit: true },
);

export function clampPace(pace) {
  const value = Number(pace);
  if (!Number.isFinite(value)) return 3;
  const halfSteps = Math.round(value * 2) / 2;
  return Math.min(10, Math.max(0.5, halfSteps));
}

export function sanitizeLanguage(value) {
  return value === "he" ? "he" : "en";
}

export function sanitizeCalendarView(value) {
  return value === "year" || value === "list" ? value : "month";
}

export function sanitizeDays(days) {
  const unique = [...new Set((Array.isArray(days) ? days : []).map(Number))].filter(
    (day) => day >= 0 && day <= 6,
  );
  return unique.length ? unique.sort((a, b) => a - b) : [0, 1, 2, 3, 4, 5, 6];
}
