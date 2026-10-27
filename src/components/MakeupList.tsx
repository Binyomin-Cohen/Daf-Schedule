import { findAmud } from "../data/shas.ts";
import { useI18n } from "../i18n.tsx";
import { formatScheduleWhen, type DateStyle } from "../lib/dates.ts";
import { parseISODate } from "../lib/plan.ts";
import type { DoneUnit, MissedDay } from "../state.ts";
import { AmudLinks } from "./AmudLinks.tsx";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function MakeupList({
  items,
  compact,
  dates,
  onComplete,
}: {
  items: MissedDay[];
  compact: boolean;
  dates: DateStyle;
  onComplete: (date: string, unit: DoneUnit) => void;
}) {
  const i18n = useI18n();

  return (
    <section className={compact
      ? "rounded-2xl bg-paper px-4 py-3 shadow-[0_14px_36px_-28px_rgba(28,22,18,0.55)] ring-1 ring-ink/10"
      : "rounded-3xl bg-paper px-5 py-5 shadow-[0_18px_50px_-32px_rgba(28,22,18,0.55)] ring-1 ring-ink/8 sm:px-6"}>
      <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("makeup")}</p>
      {items.length === 0 ? (
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">{i18n.t("makeupEmpty")}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-ink-soft">{i18n.t("makeupHelp")}</p>
          <ul className="mt-2 divide-y divide-line">
            {items.map((item) => (
                <li key={item.date} className="py-2">
                  <p className={cx("text-xs text-ink-soft", dates.lang === "he" && "font-hebrew")}>{formatScheduleWhen(parseISODate(item.date), dates)}</p>
                  <ul className="mt-1">
                    {item.units.map((unit) => {
                      const amud = findAmud(unit.key, unit.daf, unit.amud);
                      const name = amud ? i18n.label(amud) : `${unit.key} ${unit.daf}${unit.amud}`;
                      return (
                        <li key={`${unit.key}:${unit.daf}:${unit.amud}`} className="flex items-center gap-2 py-0.5">
                          <p className={cx("min-w-0 truncate text-base tracking-tight", i18n.facts === "he" ? "font-hebrew" : "font-display")}>{name}</p>
                          {amud ? <span className="shrink-0"><AmudLinks daf={amud} amud={amud.amud} /></span> : null}
                          <button
                            type="button"
                            className="ms-auto shrink-0 rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-paper"
                            aria-label={i18n.t("completeAmud", { name })}
                            onClick={() => onComplete(item.date, unit)}
                          >
                            {i18n.t("complete")}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
          </ul>
        </>
      )}
    </section>
  );
}
