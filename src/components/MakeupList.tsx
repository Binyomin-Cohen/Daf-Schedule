import { AMUDIM, findAmud } from "../data/shas.ts";
import { useI18n } from "../i18n.tsx";
import { formatScheduleWhen, type DateStyle } from "../lib/dates.ts";
import { formatIndices, parseISODate } from "../lib/plan.ts";
import type { MissedDay } from "../state.ts";
import { AmudLinks } from "./AmudLinks.tsx";

export function MakeupList({
  items,
  compact,
  dates,
  onMadeUp,
}: {
  items: MissedDay[];
  compact: boolean;
  dates: DateStyle;
  onMadeUp: (date: string) => void;
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
          <ul className="mt-3 divide-y divide-line">
            {items.map((item) => {
              const indices = item.units.flatMap((unit) => {
                const amud = findAmud(unit.key, unit.daf, unit.amud);
                return amud ? [amud.amudIndex] : [];
              });
              const range = indices.length ? formatIndices(indices, i18n.groupOptions) : "";
              return (
                <li key={item.date} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-soft">{formatScheduleWhen(parseISODate(item.date), dates)}</p>
                    <p className="font-display text-xl tracking-tight">{range}</p>
                    {compact ? null : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {indices.map((index) => {
                          const unit = AMUDIM[index];
                          if (!unit) return null;
                          return <AmudLinks key={index} daf={unit} amud={unit.amud} />;
                        })}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper"
                    onClick={() => onMadeUp(item.date)}
                  >
                    {i18n.t("madeUp")}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
