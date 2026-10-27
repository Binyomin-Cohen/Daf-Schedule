import { useState } from "react";
import { AMUDIM, MASECHTOS, findAmud, type Masechta } from "../data/shas.ts";
import { useI18n } from "../i18n.tsx";
import { formatScheduleWhen, type DateStyle } from "../lib/dates.ts";
import { formatIndices, parseISODate, type Session } from "../lib/plan.ts";
import { ADDED_MISSED_DATE, type DoneUnit, type MissedDay } from "../state.ts";
import { AmudLinks } from "./AmudLinks.tsx";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const RECENT_DAYS = 7;

export function MakeupList({
  items,
  past,
  compact,
  dates,
  suggestKey,
  onComplete,
  onMiss,
  onAddDaf,
}: {
  items: MissedDay[];
  past: Session[];
  compact: boolean;
  dates: DateStyle;
  suggestKey: string;
  onComplete: (date: string, unit: DoneUnit) => void;
  onMiss: (date: string, unit: DoneUnit) => void;
  onAddDaf: (key: string, daf: number) => void;
}) {
  const i18n = useI18n();
  const [showAll, setShowAll] = useState(false);
  const [key, setKey] = useState(suggestKey);
  const masechta = MASECHTOS.find((item) => item.key === key) ?? MASECHTOS[0];
  const [daf, setDaf] = useState(masechta?.start ?? 2);
  const owed = new Set(items.flatMap((item) => item.units.map((unit) => `${item.date}:${unit.key}:${unit.daf}:${unit.amud}`)));
  const openDays = past.flatMap((session) => {
    const units = session.indices.flatMap((index) => {
      const amud = AMUDIM[index];
      if (!amud) return [];
      const unit: DoneUnit = { key: amud.key, daf: amud.daf, amud: amud.amud };
      if (owed.has(`${session.iso}:${unit.key}:${unit.daf}:${unit.amud}`)) return [];
      return [unit];
    });
    return units.length ? [{ session, units }] : [];
  }).reverse();
  const visibleDays = showAll ? openDays : openDays.slice(0, RECENT_DAYS);
  const dated = items.filter((item) => item.date !== ADDED_MISSED_DATE);
  const added = items.find((item) => item.date === ADDED_MISSED_DATE)?.units ?? [];
  const dafNumber = masechta && daf >= masechta.start && daf <= masechta.end ? daf : masechta?.start ?? daf;

  return (
    <section className={compact
      ? "rounded-2xl bg-paper px-4 py-3 shadow-[0_14px_36px_-28px_rgba(28,22,18,0.55)] ring-1 ring-ink/10"
      : "rounded-3xl bg-paper px-5 py-5 shadow-[0_18px_50px_-32px_rgba(28,22,18,0.55)] ring-1 ring-ink/8 sm:px-6"}>
      <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("makeup")}</p>
      <form
        className="mt-2 flex flex-wrap items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (masechta) onAddDaf(masechta.key, dafNumber);
        }}
      >
        <span className="text-sm text-ink-soft">{i18n.t("addDaf")}</span>
        <select
          aria-label={i18n.t("addDafMasechta")}
          className={cx("rounded-full bg-parchment px-3 py-1.5 text-sm", i18n.facts === "he" && "font-hebrew")}
          value={masechta?.key ?? ""}
          onChange={(event) => {
            const next = MASECHTOS.find((item) => item.key === event.target.value);
            setKey(event.target.value);
            if (next) setDaf(next.start);
          }}
        >
          {MASECHTOS.map((item) => (
            <option key={item.key} value={item.key}>{i18n.name(item)}</option>
          ))}
        </select>
        <select
          aria-label={i18n.t("addDafNumber")}
          className={cx("rounded-full bg-parchment px-3 py-1.5 text-sm", i18n.facts === "he" && "font-hebrew")}
          value={dafNumber}
          onChange={(event) => setDaf(Number(event.target.value))}
        >
          {dafOptions(masechta).map((number) => (
            <option key={number} value={number}>{i18n.dafNumber(number)}</option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-paper">
          {i18n.t("addDafAction")}
        </button>
      </form>
      {added.length ? (
        <ul className="mt-2">
          {added.map((unit) => {
            const amud = findAmud(unit.key, unit.daf, unit.amud);
            const name = amud ? i18n.label(amud) : `${unit.key} ${unit.daf}${unit.amud}`;
            return (
              <AmudRow
                key={`${unit.key}:${unit.daf}:${unit.amud}`}
                name={name}
                amud={amud}
                action={i18n.t("complete")}
                label={i18n.t("completeAmud", { name })}
                onClick={() => onComplete(ADDED_MISSED_DATE, unit)}
              />
            );
          })}
        </ul>
      ) : null}
      {dated.length === 0 && openDays.length === 0 && added.length === 0 ? (
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">{i18n.t("makeupEmpty")}</p>
      ) : (
        <>
          {dated.length ? (
            <>
              <p className="mt-3 text-sm text-ink-soft">{i18n.t("makeupHelp")}</p>
              <ul className="mt-2 divide-y divide-line">
                {dated.map((item) => (
                  <li key={item.date} className="py-2">
                    <p className={cx("text-xs text-ink-soft", dates.lang === "he" && "font-hebrew")}>{formatScheduleWhen(parseISODate(item.date), dates)}</p>
                    <ul className="mt-1">
                      {item.units.map((unit) => {
                        const amud = findAmud(unit.key, unit.daf, unit.amud);
                        const name = amud ? i18n.label(amud) : `${unit.key} ${unit.daf}${unit.amud}`;
                        return (
                          <AmudRow
                            key={`${unit.key}:${unit.daf}:${unit.amud}`}
                            name={name}
                            amud={amud}
                            action={i18n.t("complete")}
                            label={i18n.t("completeAmud", { name })}
                            onClick={() => onComplete(item.date, unit)}
                          />
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {openDays.length ? (
            <>
              <p className={cx("text-sm text-ink-soft", items.length ? "mt-4" : "mt-1")}>{i18n.t("pastDays")}</p>
              <ul className="mt-2 divide-y divide-line">
                {visibleDays.map(({ session, units }) => (
                  <li key={session.iso} className="py-2">
                    <p className={cx("text-xs text-ink-soft", dates.lang === "he" && "font-hebrew")}>
                      {formatScheduleWhen(parseISODate(session.iso), dates)}
                      <span className={cx("ms-2", i18n.facts === "he" ? "font-hebrew" : undefined)}>{formatIndices(session.indices, { ...i18n.groupOptions, short: true })}</span>
                    </p>
                    <ul className="mt-1">
                      {units.map((unit) => {
                        const amud = findAmud(unit.key, unit.daf, unit.amud);
                        const name = amud ? i18n.label(amud) : `${unit.key} ${unit.daf}${unit.amud}`;
                        return (
                          <AmudRow
                            key={`${unit.key}:${unit.daf}:${unit.amud}`}
                            name={name}
                            amud={amud}
                            action={i18n.t("missAmud")}
                            label={i18n.t("missAmudLabel", { name })}
                            onClick={() => onMiss(session.iso, unit)}
                          />
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
              {openDays.length > RECENT_DAYS && !showAll ? (
                <button type="button" className="mt-2 text-sm font-medium text-ink underline decoration-line underline-offset-2" onClick={() => setShowAll(true)}>
                  {i18n.t("showEarlier")}
                </button>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </section>
  );
}

function dafOptions(masechta: Masechta | undefined) {
  if (!masechta) return [];
  const numbers: number[] = [];
  for (let number = masechta.start; number <= masechta.end; number += 1) numbers.push(number);
  return numbers;
}

function AmudRow({
  name,
  amud,
  action,
  label,
  onClick,
}: {
  name: string;
  amud: ReturnType<typeof findAmud>;
  action: string;
  label: string;
  onClick: () => void;
}) {
  const i18n = useI18n();
  return (
    <li className="flex items-center gap-2 py-0.5">
      <p className={cx("min-w-0 truncate text-base tracking-tight", i18n.facts === "he" ? "font-hebrew" : "font-display")}>{name}</p>
      {amud ? <span className="shrink-0"><AmudLinks daf={amud} amud={amud.amud} /></span> : null}
      <button
        type="button"
        className="ms-auto shrink-0 rounded-full bg-ink px-2.5 py-1 text-xs font-medium text-paper"
        aria-label={label}
        onClick={onClick}
      >
        {action}
      </button>
    </li>
  );
}
