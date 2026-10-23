import type { ReactNode } from "react";
import { AMUDIM, type Amud } from "../data/shas.ts";
import { useI18n } from "../i18n.tsx";
import { addDays, formatGroup, formatIndices, formatLong, formatMonthName, formatWeekday, formatYear, groupAmudim, monthCells, toISODate, type Plan, type Session } from "../lib/plan.ts";
import type { CalendarView } from "../state.ts";
import { AmudLinks } from "./AmudLinks.tsx";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const VIEWS: CalendarView[] = ["month", "year", "list"];

export function Calendar({
  plan,
  today,
  month,
  onMonth,
  studyDays,
  onPlace,
  selected,
  onSelect,
  caughtUp,
  view,
  onView,
}: {
  plan: Plan;
  today: Date;
  month: Date;
  onMonth: (month: Date) => void;
  studyDays: number[];
  onPlace: (unit: Amud) => void;
  selected: Date;
  onSelect: (date: Date) => void;
  caughtUp: boolean;
  view: CalendarView;
  onView: (view: CalendarView) => void;
}) {
  const i18n = useI18n();
  const todayIso = toISODate(today);
  const selectedIso = toISODate(selected);
  const session = plan.byDate.get(selectedIso) ?? null;
  const selectedPast = selectedIso < todayIso;
  const yearMode = view === "year" || view === "list";
  const heading = yearMode
    ? formatYear(month, i18n.locale)
    : month.toLocaleDateString(i18n.locale, { month: "long", year: "numeric" });

  function showToday() {
    onMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelect(today);
  }

  function selectDate(date: Date) {
    onSelect(date);
    onMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function step(delta: number) {
    if (yearMode) onMonth(new Date(month.getFullYear() + delta, month.getMonth(), 1));
    else onMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }

  const prevGlyph = i18n.dir === "rtl" ? "›" : "‹";
  const nextGlyph = i18n.dir === "rtl" ? "‹" : "›";

  return (
    <section className="rounded-3xl bg-paper p-4 shadow-[0_18px_50px_-32px_rgba(28,22,18,0.55)] ring-1 ring-ink/8 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("calendar")}</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{heading}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-parchment p-1" role="group" aria-label={i18n.t("calendarView")}>
            {VIEWS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                className={cx("rounded-full px-3 py-1 text-sm", view === option ? "bg-ink text-paper" : "text-ink")}
                onClick={() => onView(option)}
              >
                {i18n.t(option === "month" ? "viewMonth" : option === "year" ? "viewYear" : "viewList")}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-sm text-ink-soft transition hover:bg-parchment hover:text-ink"
            onClick={showToday}
          >
            {i18n.t("today")}
          </button>
          <div className="flex overflow-hidden rounded-full ring-1 ring-line">
            <button
              type="button"
              className="px-3 py-1.5 text-lg leading-none transition hover:bg-parchment"
              aria-label={yearMode ? i18n.t("prevYear") : i18n.t("prevMonth")}
              onClick={() => step(-1)}
            >
              {prevGlyph}
            </button>
            <button
              type="button"
              className="border-s border-line px-3 py-1.5 text-lg leading-none transition hover:bg-parchment"
              aria-label={yearMode ? i18n.t("nextYear") : i18n.t("nextMonth")}
              onClick={() => step(1)}
            >
              {nextGlyph}
            </button>
          </div>
        </div>
      </div>

      {view === "year" ? (
        <YearGrid year={month.getFullYear()} plan={plan} todayIso={todayIso} selectedIso={selectedIso} studyDays={studyDays} onSelect={selectDate} />
      ) : null}
      {view === "list" ? (
        <ListView year={month.getFullYear()} plan={plan} today={today} selectedIso={selectedIso} caughtUp={caughtUp} onSelect={selectDate} />
      ) : null}
      {view === "month" ? (
        <MonthGrid
          month={month}
          plan={plan}
          todayIso={todayIso}
          selectedIso={selectedIso}
          studyDays={studyDays}
          caughtUp={caughtUp}
          onSelect={selectDate}
        />
      ) : null}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-wine" /> {i18n.t("today")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold" /> {i18n.t("siyum")}
        </span>
        <span>{i18n.t("legendOff")}</span>
      </div>

      {selectedIso === todayIso ? null : (
        <DayDetail
          selected={selected}
          session={session}
          selectedPast={selectedPast}
          todayIso={todayIso}
          caughtUp={caughtUp}
          studyDays={studyDays}
          onPlace={onPlace}
        />
      )}
    </section>
  );
}

function MonthGrid({
  month,
  plan,
  todayIso,
  selectedIso,
  studyDays,
  caughtUp,
  onSelect,
}: {
  month: Date;
  plan: Plan;
  todayIso: string;
  selectedIso: string;
  studyDays: number[];
  caughtUp: boolean;
  onSelect: (date: Date) => void;
}) {
  const i18n = useI18n();
  const cells = monthCells(month.getFullYear(), month.getMonth());

  return (
    <div className="grid grid-cols-7">
      {i18n.weekdays.map((day) => (
        <div key={day} className="px-1 pb-2 text-[11px] font-medium tracking-wide text-ink-soft uppercase">
          {day}
        </div>
      ))}
      {cells.map((date, index) => {
        if (!date) return <div key={`empty-${index}`} className="border-t border-line" />;
        const iso = toISODate(date);
        const daySession = plan.byDate.get(iso) ?? null;
        const isToday = iso === todayIso;
        const isSelected = iso === selectedIso;
        const isPast = iso < todayIso;
        const isOff = !isPast && !isToday && !studyDays.includes(date.getDay());
        const groups = daySession ? groupAmudim(daySession.indices) : [];
        const label = daySession
          ? `${formatLong(date, i18n.locale)}, ${groups.map((group) => formatGroup(group, { ...i18n.groupOptions, short: true })).join(", ")}`
          : formatLong(date, i18n.locale);

        return (
          <button
            key={iso}
            type="button"
            aria-pressed={isSelected}
            aria-label={label}
            onClick={() => onSelect(date)}
            className={cx(
              "flex min-h-14 flex-col items-start gap-1 border-t border-line px-1.5 py-1.5 text-start transition sm:min-h-28 sm:px-2 sm:py-2",
              isToday && "bg-[#f8e7e4]",
              isSelected && "ring-2 ring-wine ring-inset",
              !isSelected && "hover:bg-parchment/80",
              isOff && "opacity-55",
            )}
          >
            <span
              className={cx(
                "text-xs font-medium tabular-nums sm:text-sm",
                isPast ? "text-ink-soft/70" : "text-ink",
                isToday && "text-wine",
              )}
            >
              {date.getDate()}
              {isToday ? <span className="ms-1 hidden text-[10px] tracking-wide uppercase sm:inline">{i18n.t("today")}</span> : null}
            </span>
            {daySession ? (
              <span className="w-full">
                {groups.slice(0, 2).map((group) => (
                  <span key={`${group.key}-${group.startAmudIndex}`} className="mt-0.5 flex items-start gap-1 text-[10px] leading-tight text-ink sm:text-[11px]">
                    <span className="mt-1 hidden h-1.5 w-1.5 shrink-0 rounded-full sm:block" style={{ background: group.color }} />
                    <span className="line-clamp-2">{formatGroup(group, { ...i18n.groupOptions, short: true })}</span>
                  </span>
                ))}
                {groups.length > 2 ? (
                  <span className="mt-0.5 block text-[10px] text-ink-soft">{i18n.t("moreGroups", { count: groups.length - 2 })}</span>
                ) : null}
                {daySession.siyum ? (
                  <span className="mt-1 block text-[9px] font-medium tracking-wide text-gold uppercase">
                    {daySession.siyumHashas ? i18n.t("hashas") : i18n.t("siyum")}
                  </span>
                ) : null}
              </span>
            ) : isToday && caughtUp ? (
              <span className="text-[10px] font-medium text-moss sm:text-[11px]">{i18n.t("done")}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function YearGrid({
  year,
  plan,
  todayIso,
  selectedIso,
  studyDays,
  onSelect,
}: {
  year: number;
  plan: Plan;
  todayIso: string;
  selectedIso: string;
  studyDays: number[];
  onSelect: (date: Date) => void;
}) {
  const i18n = useI18n();
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }, (_, monthIndex) => {
        const cells = monthCells(year, monthIndex);
        const label = formatMonthName(new Date(year, monthIndex, 1), i18n.locale);
        return (
          <div key={monthIndex}>
            <h3 className="mb-1 text-sm font-medium">{label}</h3>
            <div className="grid grid-cols-7 gap-px">
              {i18n.weekdays.map((day) => (
                <div key={`${monthIndex}-${day}`} className="pb-0.5 text-center text-[9px] text-ink-soft">
                  {day.replace("׳", "").slice(0, 1)}
                </div>
              ))}
              {cells.map((date, index) => {
                if (!date) return <div key={`empty-${monthIndex}-${index}`} />;
                const iso = toISODate(date);
                const daySession = plan.byDate.get(iso) ?? null;
                const isToday = iso === todayIso;
                const isSelected = iso === selectedIso;
                const isPast = iso < todayIso;
                const isOff = !isPast && !isToday && !studyDays.includes(date.getDay());
                const groups = daySession ? groupAmudim(daySession.indices) : [];
                const labelText = daySession
                  ? `${formatLong(date, i18n.locale)}, ${formatIndices(daySession.indices, i18n.groupOptions)}`
                  : formatLong(date, i18n.locale);
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={labelText}
                    onClick={() => onSelect(date)}
                    className={cx(
                      "relative aspect-square rounded-sm text-[10px] tabular-nums leading-none",
                      isToday && "bg-[#f8e7e4] text-wine",
                      isSelected && "ring-2 ring-wine ring-inset",
                      !isSelected && "hover:bg-parchment",
                      isPast && "text-ink-soft/60",
                      isOff && "opacity-45",
                    )}
                    style={daySession && !isToday ? { background: `${groups[0]?.color ?? "#7d2432"}22` } : undefined}
                  >
                    {date.getDate()}
                    {daySession?.siyum ? <span className="absolute end-0.5 top-0.5 h-1 w-1 rounded-full bg-gold" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  year,
  plan,
  today,
  selectedIso,
  caughtUp,
  onSelect,
}: {
  year: number;
  plan: Plan;
  today: Date;
  selectedIso: string;
  caughtUp: boolean;
  onSelect: (date: Date) => void;
}) {
  const i18n = useI18n();
  const todayIso = toISODate(today);
  const start = year === today.getFullYear() && today > new Date(year, 0, 1) ? today : new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const groups: Array<{ key: string; label: string; rows: Array<{ date: Date; iso: string; session: Session | null }> }> = [];
  for (let cursor = startOf(start); cursor <= end; cursor = addDays(cursor, 1)) {
    const iso = toISODate(cursor);
    const session = plan.byDate.get(iso) ?? null;
    const doneRow = !session && iso === todayIso && caughtUp;
    if (!session && !doneRow) continue;
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    let bucket = groups[groups.length - 1];
    if (!bucket || bucket.key !== key) {
      bucket = { key, label: formatMonthName(cursor, i18n.locale), rows: [] };
      groups.push(bucket);
    }
    bucket.rows.push({ date: cursor, iso, session });
  }

  if (!groups.length) {
    return <p className="text-sm text-ink-soft">{i18n.t("emptyYear")}</p>;
  }

  return (
    <div className="max-h-[32rem] overflow-y-auto rounded-2xl">
      {groups.map((group) => (
        <div key={group.key}>
          <h3 className="sticky top-0 bg-paper/95 py-2 text-xs font-medium tracking-[0.14em] text-ink-soft uppercase backdrop-blur-sm">
            {group.label}
          </h3>
          <div className="divide-y divide-line">
            {group.rows.map((row) => {
              const selected = row.iso === selectedIso;
              const isToday = row.iso === todayIso;
              const range = row.session ? formatIndices(row.session.indices, { ...i18n.groupOptions, short: true }) : i18n.t("done");
              return (
                <button
                  key={row.iso}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(row.date)}
                  className={cx(
                    "flex w-full items-baseline gap-3 py-1.5 text-start text-sm",
                    selected && "bg-[#f8e7e4]",
                    !selected && "hover:bg-parchment/70",
                  )}
                >
                  <span className={cx("w-8 shrink-0 tabular-nums", isToday ? "font-medium text-wine" : "text-ink")}>
                    {row.date.getDate()}
                  </span>
                  <span className="w-10 shrink-0 text-xs text-ink-soft">{i18n.weekdays[row.date.getDay()]}</span>
                  <span className="min-w-0 flex-1 truncate">{range}</span>
                  {row.session?.siyum ? (
                    <span className="shrink-0 text-[10px] font-medium tracking-wide text-gold uppercase">
                      {row.session.siyumHashas ? i18n.t("hashas") : i18n.t("siyum")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function startOf(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function DayDetail({
  selected,
  session,
  selectedPast,
  caughtUp,
  todayIso,
  studyDays,
  onPlace,
}: {
  selected: Date;
  session: Session | null;
  selectedPast: boolean;
  caughtUp: boolean;
  todayIso: string;
  studyDays: number[];
  onPlace: (unit: Amud) => void;
}) {
  const i18n = useI18n();
  const iso = toISODate(selected);
  const isToday = iso === todayIso;

  let heading = formatLong(selected, i18n.locale);
  let body: ReactNode = null;

  if (selectedPast) {
    body = <p className="text-sm text-ink-soft">{i18n.t("pastDay")}</p>;
  } else if (session) {
    heading = formatLong(selected, i18n.locale);
    const noted: Amud[] = [];
    const seen = new Set<number>();
    for (const index of session.indices) {
      const unit = AMUDIM[index];
      if (unit?.note && !seen.has(unit.index)) {
        seen.add(unit.index);
        noted.push(unit);
      }
    }
    body = (
      <div>
        <p className="font-display text-2xl tracking-tight">{formatIndices(session.indices, i18n.groupOptions)}</p>
        <p className="mt-1 text-sm text-ink-soft">{isToday ? i18n.t("clickAmudToday") : i18n.t("clickAmudLater")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {session.indices.map((index) => {
            const unit = AMUDIM[index];
            return (
              <div key={index} className="flex items-center gap-2 rounded-2xl bg-paper px-3 py-2">
                <button type="button" className="text-start" onClick={() => onPlace(unit)} aria-label={i18n.t("setAmud", { name: i18n.label(unit) })}>
                  <span className="block font-display text-2xl leading-none">
                    {unit.daf}
                    <span className="text-base">{i18n.amud(unit.amud)}</span>
                  </span>
                  <span className="mt-1 block text-[11px] text-ink-soft">
                    {i18n.short(unit)} · {i18n.t("setAsNext")}
                  </span>
                </button>
                <AmudLinks daf={unit} amud={unit.amud} />
              </div>
            );
          })}
        </div>
        {noted.length ? (
          <ul className="mt-3 space-y-1 text-sm text-ink-soft">
            {noted.map((unit) => (
              <li key={unit.index}>
                {i18n.name(unit)} {unit.daf}: {i18n.note(unit)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  } else if (isToday && caughtUp) {
    body = <p className="text-sm text-ink-soft">{i18n.t("loggedToday")}</p>;
  } else if (!studyDays.includes(selected.getDay())) {
    body = <p className="text-sm text-ink-soft">{i18n.t("dayOff", { day: formatWeekday(selected, i18n.locale) })}</p>;
  } else {
    body = <p className="text-sm text-ink-soft">{i18n.t("nothingScheduled")}</p>;
  }

  return (
    <div className="mt-5 rounded-2xl bg-parchment/70 px-4 py-4">
      <p className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase">{isToday ? i18n.t("today") : i18n.t("selectedDay")}</p>
      <h3 className="mt-1 font-display text-xl">{heading}</h3>
      <div className="mt-2">{body}</div>
    </div>
  );
}
