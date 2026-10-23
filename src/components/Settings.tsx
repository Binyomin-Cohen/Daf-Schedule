import { useState } from "react";
import { MASECHTOS } from "../data/shas.ts";
import { STANDARD_ORDER } from "../lib/order.ts";
import { useI18n } from "../i18n.tsx";
import type { Language } from "../state.ts";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Settings({
  language,
  customOrder,
  order,
  currentKey,
  compact,
  onLanguage,
  onCustomOrder,
  onOrder,
  onCompact,
}: {
  language: Language;
  customOrder: boolean;
  order: string[];
  currentKey: string | null;
  compact: boolean;
  onLanguage: (language: Language) => void;
  onCustomOrder: (enabled: boolean) => void;
  onOrder: (order: string[]) => void;
  onCompact: (compact: boolean) => void;
}) {
  const i18n = useI18n();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const byKey = new Map(MASECHTOS.map((masechta) => [masechta.key, masechta]));

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length || from === to) return;
    const next = order.slice();
    const item = next[from];
    if (item === undefined) return;
    next.splice(from, 1);
    next.splice(to, 0, item);
    onOrder(next);
  }

  return (
    <section className={compact
      ? "rounded-2xl bg-paper px-4 py-3 shadow-[0_14px_36px_-28px_rgba(28,22,18,0.55)] ring-1 ring-ink/10"
      : "rounded-3xl bg-paper px-5 py-6 shadow-[0_18px_50px_-32px_rgba(28,22,18,0.55)] ring-1 ring-ink/10 sm:px-6"}>
      <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("settings")}</p>

      <div className={compact ? "mt-2 grid gap-3 sm:grid-cols-3" : "mt-4 grid gap-6 lg:grid-cols-2"}>
        <div>
          <p className="text-sm font-medium">{i18n.t("language")}</p>
          <div className={compact ? "mt-1 inline-flex rounded-full bg-parchment p-0.5" : "mt-2 inline-flex rounded-full bg-parchment p-1"} role="group" aria-label={i18n.t("language")}>
            <button
              type="button"
              aria-pressed={language === "en"}
              className={cx(compact ? "rounded-full px-3 py-1 text-sm" : "rounded-full px-4 py-1.5 text-sm", language === "en" ? "bg-ink text-paper" : "text-ink")}
              onClick={() => onLanguage("en")}
            >
              {i18n.t("languageEnglish")}
            </button>
            <button
              type="button"
              aria-pressed={language === "he"}
              className={cx(compact ? "rounded-full px-3 py-1 font-hebrew text-sm" : "rounded-full px-4 py-1.5 font-hebrew text-sm", language === "he" ? "bg-ink text-paper" : "text-ink")}
              onClick={() => onLanguage("he")}
            >
              {i18n.t("languageHebrew")}
            </button>
          </div>
          {compact ? null : <p className="mt-2 max-w-sm text-sm text-ink-soft">{i18n.t("languageHint")}</p>}
        </div>

        <div>
          <p className="text-sm font-medium">{i18n.t("order")}</p>
          <div className={compact ? "mt-1 inline-flex rounded-full bg-parchment p-0.5" : "mt-2 inline-flex rounded-full bg-parchment p-1"} role="group" aria-label={i18n.t("order")}>
            <button
              type="button"
              aria-pressed={!customOrder}
              className={cx(compact ? "rounded-full px-3 py-1 text-sm" : "rounded-full px-4 py-1.5 text-sm", !customOrder ? "bg-ink text-paper" : "text-ink")}
              onClick={() => onCustomOrder(false)}
            >
              {i18n.t("orderStandard")}
            </button>
            <button
              type="button"
              aria-pressed={customOrder}
              className={cx(compact ? "rounded-full px-3 py-1 text-sm" : "rounded-full px-4 py-1.5 text-sm", customOrder ? "bg-ink text-paper" : "text-ink")}
              onClick={() => onCustomOrder(true)}
            >
              {i18n.t("orderCustom")}
            </button>
          </div>
          {customOrder && !compact ? <p className="mt-2 max-w-md text-sm text-ink-soft">{i18n.t("orderHint")}</p> : null}
        </div>

        <div>
          <p className="text-sm font-medium">{i18n.t("layout")}</p>
          <div className={compact ? "mt-1 inline-flex rounded-full bg-parchment p-0.5" : "mt-2 inline-flex rounded-full bg-parchment p-1"} role="group" aria-label={i18n.t("layout")}>
            <button
              type="button"
              aria-pressed={!compact}
              className={cx(compact ? "rounded-full px-3 py-1 text-sm" : "rounded-full px-4 py-1.5 text-sm", !compact ? "bg-ink text-paper" : "text-ink")}
              onClick={() => onCompact(false)}
            >
              {i18n.t("layoutFull")}
            </button>
            <button
              type="button"
              aria-pressed={compact}
              className={cx(compact ? "rounded-full px-3 py-1 text-sm" : "rounded-full px-4 py-1.5 text-sm", compact ? "bg-ink text-paper" : "text-ink")}
              onClick={() => onCompact(true)}
            >
              {i18n.t("layoutSimple")}
            </button>
          </div>
          {compact ? null : <p className="mt-2 max-w-sm text-sm text-ink-soft">{i18n.t("layoutHint")}</p>}
        </div>
      </div>

      {customOrder ? (
        <div className={compact ? "mt-3" : "mt-5"}>
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              className="shrink-0 text-sm font-medium text-wine underline decoration-wine/30 underline-offset-2"
              onClick={() => onOrder(STANDARD_ORDER)}
            >
              {i18n.t("resetOrder")}
            </button>
          </div>
          <ol className={compact ? "max-h-56 divide-y divide-line overflow-y-auto rounded-xl bg-parchment/60" : "max-h-80 divide-y divide-line overflow-y-auto rounded-2xl bg-parchment/60"}>
            {order.map((key, index) => {
              const masechta = byKey.get(key);
              if (!masechta) return null;
              const here = key === currentKey;
              const label = i18n.name(masechta);
              return (
                <li
                  key={key}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(index));
                    event.dataTransfer.effectAllowed = "move";
                    setDragIndex(index);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    const from = Number(event.dataTransfer.getData("text/plain"));
                    if (Number.isInteger(from)) move(from, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={cx(
                    compact ? "flex items-center gap-2 px-2 py-1" : "flex items-center gap-2 px-3 py-2",
                    here && "bg-[#f8e7e4]",
                    dragIndex === index && "opacity-50",
                  )}
                >
                  <span className="cursor-grab text-ink-soft select-none" aria-hidden="true">
                    ⋮⋮
                  </span>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: masechta.color }} />
                  <span className={cx("min-w-0 flex-1 truncate text-sm", i18n.lang === "he" && "font-hebrew")}>{label}</span>
                  {here ? <span className="text-[11px] font-medium tracking-wide text-wine uppercase">{i18n.t("now")}</span> : null}
                  <span className="hidden text-xs text-ink-soft sm:inline">{i18n.t("dapimCount", { count: masechta.count })}</span>
                  <span className="inline-flex" dir="ltr">
                    <button
                      type="button"
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:bg-paper disabled:opacity-30"
                      aria-label={i18n.t("moveEarlier", { name: label })}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:bg-paper disabled:opacity-30"
                      aria-label={i18n.t("moveLater", { name: label })}
                      disabled={index === order.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      ↓
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
