import { createContext, useContext } from "react";

const I18nContext = createContext(null);

export function I18nProvider({ i18n, children }) {
  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
