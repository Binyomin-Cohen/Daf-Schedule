import { useEffect, useRef, useState } from "react";
import { MASECHTOS } from "../data/shas.ts";
import { STANDARD_ORDER } from "../lib/order.ts";
import { useI18n } from "../i18n.tsx";
import type { Language } from "../state.ts";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const byKey = new Map(MASECHTOS.map((masechta) => [masechta.key, masechta]));

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

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
    <div ref={rootRef} className="flex items-center justify-end gap-2">
      <div className="inline-flex rounded-full bg-paper p-0.5 ring-1 ring-ink/10" role="group" aria-label={i18n.t("language")}>
        <button
          type="button"
          aria-pressed={language === "en"}
          className={cx("rounded-full px-3 py-1 text-sm", language === "en" ? "bg-ink text-paper" : "text-ink")}
          onClick={() => onLanguage("en")}
        >
          {i18n.t("languageEnglish")}
        </button>
        <button
          type="button"
          aria-pressed={language === "he"}
          className={cx("rounded-full px-3 py-1 font-hebrew text-sm", language === "he" ? "bg-ink text-paper" : "text-ink")}
          onClick={() => onLanguage("he")}
        >
          {i18n.t("languageHebrew")}
        </button>
      </div>

      <div className="relative">
        <button
          type="button"
          className={cx(
            "grid h-10 w-10 place-items-center rounded-full ring-1 ring-ink/10",
            open ? "bg-ink text-paper" : "bg-paper text-ink",
          )}
          aria-label={i18n.t("settings")}
          aria-expanded={open}
          aria-haspopup="dialog"
          onClick={() => setOpen((current) => !current)}
        >
          <GearIcon />
        </button>

        {open ? (
          <div
            role="dialog"
            aria-label={i18n.t("settings")}
            className="absolute end-0 z-30 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-3xl bg-paper p-4 shadow-[0_18px_50px_-28px_rgba(28,22,18,0.55)] ring-1 ring-ink/10"
          >
            <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("settings")}</p>

            <div className="mt-4">
              <p className="text-sm font-medium">{i18n.t("order")}</p>
              <div className="mt-2 inline-flex rounded-full bg-parchment p-1" role="group" aria-label={i18n.t("order")}>
                <button
                  type="button"
                  aria-pressed={!customOrder}
                  className={cx("rounded-full px-4 py-1.5 text-sm", !customOrder ? "bg-ink text-paper" : "text-ink")}
                  onClick={() => onCustomOrder(false)}
                >
                  {i18n.t("orderStandard")}
                </button>
                <button
                  type="button"
                  aria-pressed={customOrder}
                  className={cx("rounded-full px-4 py-1.5 text-sm", customOrder ? "bg-ink text-paper" : "text-ink")}
                  onClick={() => onCustomOrder(true)}
                >
                  {i18n.t("orderCustom")}
                </button>
              </div>
              {customOrder ? <p className="mt-2 text-sm text-ink-soft">{i18n.t("orderHint")}</p> : null}
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium">{i18n.t("layout")}</p>
              <div className="mt-2 inline-flex rounded-full bg-parchment p-1" role="group" aria-label={i18n.t("layout")}>
                <button
                  type="button"
                  aria-pressed={!compact}
                  className={cx("rounded-full px-4 py-1.5 text-sm", !compact ? "bg-ink text-paper" : "text-ink")}
                  onClick={() => onCompact(false)}
                >
                  {i18n.t("layoutFull")}
                </button>
                <button
                  type="button"
                  aria-pressed={compact}
                  className={cx("rounded-full px-4 py-1.5 text-sm", compact ? "bg-ink text-paper" : "text-ink")}
                  onClick={() => onCompact(true)}
                >
                  {i18n.t("layoutSimple")}
                </button>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{i18n.t("layoutHint")}</p>
            </div>

            {customOrder ? (
              <div className="mt-4">
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    className="shrink-0 text-sm font-medium text-wine underline decoration-wine/30 underline-offset-2"
                    onClick={() => onOrder(STANDARD_ORDER)}
                  >
                    {i18n.t("resetOrder")}
                  </button>
                </div>
                <ol className="max-h-56 divide-y divide-line overflow-y-auto rounded-2xl bg-parchment/60">
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
                          "flex items-center gap-2 px-3 py-2",
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
          </div>
        ) : null}
      </div>
    </div>
  );
}
