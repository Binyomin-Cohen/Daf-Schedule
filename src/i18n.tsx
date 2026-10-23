import { createContext, useContext, type ReactNode } from "react";
import type { I18n } from "./lib/i18n.ts";

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ i18n, children }: { i18n: I18n; children: ReactNode }) {
  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
