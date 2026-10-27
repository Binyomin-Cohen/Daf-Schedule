import { useAtom } from "jotai";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Calendar } from "./components/Calendar.tsx";
import { DafPicker } from "./components/DafPicker.tsx";
import { Settings } from "./components/Settings.tsx";
import { AmudLinks } from "./components/AmudLinks.tsx";
import { I18nProvider, useI18n } from "./i18n.tsx";
import { AMUDIM, AMUD_TOTAL, TOTAL, findAmud, findDaf, isCompletePlace, masechtaByKey, resolvePlace, type Amud, type Daf, type Masechta, type Place } from "./data/shas.ts";
import { makeI18n, type I18n } from "./lib/i18n.ts";
import { isStandardOrder, sanitizeOrder, studyIndex } from "./lib/order.ts";
import {
  WEEKDAYS,
  addDays,
  buildPlan,
  formatDafAmount,
  formatGroup,
  formatIndices,
  formatMonth,
  formatPace,
  formatWeekday,
  groupAmudim,
  nextMasechtaOn,
  remainingDapim,
  type Plan,
  type Session,
  monthStart,
  parseISODate,
  positionOnDate,
  startOfDay,
  toISODate,
} from "./lib/plan.ts";
import { officialOn } from "./lib/official.ts";
import { clampPace, sanitizeAnchoredOn, sanitizeCalendarView, sanitizeDays, sanitizeLanguage, settingsAtom, type CalendarView, type DoneToday, type Language } from "./state.ts";

type DafYomiPayload = {
  current_daf: { key: string; daf: number; masechta?: string };
  cycle?: { number?: number; label?: string };
};

type OfficialState = { status: "loading" | "error" | "ready"; data: DafYomiPayload | null };
type Notice = { text: string; undo?: boolean };
type Undo = { place: Place | null; anchoredOn: string | null; doneToday: DoneToday | null };

function isDafYomiPayload(value: unknown): value is DafYomiPayload {
  if (!value || typeof value !== "object") return false;
  const current = (value as { current_daf?: { key?: unknown; daf?: unknown } }).current_daf;
  return typeof current?.key === "string" && typeof current.daf === "number";
}

const PACE_PRESETS = [0.5, 1, 2, 2.5, 3, 5, 7, 10];

function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    const update = () => {
      const next = startOfDay(new Date());
      setToday((current) => (toISODate(current) === toISODate(next) ? current : next));
    };
    const id = window.setInterval(update, 60_000);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", update);
    };
  }, []);
  return today;
}

function indicesFromDone(done: DoneToday): number[] {
  if (Array.isArray(done.units) && done.units.length) {
    return done.units
      .map((unit) => findAmud(unit.key, unit.daf, unit.amud)?.amudIndex)
      .filter((index): index is number => index !== undefined);
  }
  if (done.from?.amud !== "a" && done.from?.amud !== "b") return [];
  const start = findAmud(done.from.key, done.from.daf, done.from.amud);
  if (!start || !Number.isInteger(done.count)) return [];
  const indices: number[] = [];
  for (let offset = 0; offset < done.count; offset += 1) {
    const index = start.amudIndex + offset;
    if (index >= AMUD_TOTAL) break;
    indices.push(index);
  }
  return indices;
}

function formatPercent(position: number, total: number): string {
  if (!total) return "0";
  const value = Math.round((position / total) * 1000) / 10;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function gapLabel(apart: number, i18n: I18n): string {
  if (apart === 0) return i18n.t("level");
  const amount = formatDafAmount(Math.abs(apart));
  const word = i18n.dafWord(Math.abs(apart));
  return i18n.t(apart > 0 ? "ahead" : "behind", { amount, word });
}

export default function App() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [official, setOfficial] = useState<OfficialState>({ status: "loading", data: null });
  const [notice, setNotice] = useState<Notice | null>(null);
  const [undo, setUndo] = useState<Undo | null>(null);
  const today = useToday();
  const todayIso = toISODate(today);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => monthStart(today));

  const pace = clampPace(settings.pace);
  const studyDays = useMemo(() => sanitizeDays(settings.studyDays), [settings.studyDays]);
  const language = sanitizeLanguage(settings.language);
  const calendarView = sanitizeCalendarView(settings.calendarView);
  const customOrder = settings.customOrder === true;
  const compact = settings.compact === true;
  const order = useMemo(
    () => sanitizeOrder(customOrder ? settings.masechtaOrder : null),
    [customOrder, settings.masechtaOrder],
  );
  const orderIsStandard = !customOrder || isStandardOrder(order);
  const { sequence, rank, lastRankByDaf } = useMemo(() => studyIndex(order), [order]);
  const i18n = useMemo(() => makeI18n(language), [language]);
  const storedComplete = settings.place != null && isCompletePlace(settings.place);
  const anchorUnit = storedComplete ? null : resolvePlace(settings.place);
  const anchorIndex = storedComplete ? sequence.length : (anchorUnit ? (rank.get(anchorUnit.amudIndex) ?? 0) : 0);
  const storedAnchor = sanitizeAnchoredOn(settings.anchoredOn);
  const anchoredOnIso = storedAnchor
    ?? (settings.doneToday?.date === todayIso ? toISODate(addDays(today, 1)) : todayIso);
  const anchoredOnDate = parseISODate(anchoredOnIso);
  const startToday = useMemo(
    () => positionOnDate({
      position: anchorIndex,
      pace,
      studyDays,
      anchoredOn: anchoredOnDate,
      date: today,
      sequence,
    }),
    [anchorIndex, pace, studyDays, anchoredOnIso, today, sequence],
  );

  const doneRecord =
    settings.doneToday?.date === todayIso &&
    settings.doneToday.from &&
    (settings.doneToday.from.amud === "a" || settings.doneToday.from.amud === "b")
      ? settings.doneToday
      : null;
  const caughtUp = Boolean(doneRecord);
  const anchorIsFuture = anchoredOnDate.getTime() > today.getTime();
  const position = useMemo(() => {
    if (anchorIsFuture || !caughtUp) return startToday;
    return positionOnDate({
      position: startToday,
      pace,
      studyDays,
      anchoredOn: today,
      date: addDays(today, 1),
      sequence,
    });
  }, [anchorIsFuture, caughtUp, startToday, pace, studyDays, today, sequence]);
  const complete = storedComplete || position >= sequence.length;
  const active = position < sequence.length ? (AMUDIM[sequence[position] ?? -1] ?? null) : null;
  const placeKey = active?.key ?? anchorUnit?.key ?? "berachos";
  const [viewKey, setViewKey] = useState(placeKey);
  const [trackedKey, setTrackedKey] = useState(placeKey);
  if (trackedKey !== placeKey) {
    setTrackedKey(placeKey);
    setViewKey(placeKey);
  }

  const plan = useMemo(
    () =>
      buildPlan({
        position,
        pace,
        studyDays,
        start: anchorIsFuture ? anchoredOnDate : (caughtUp ? addDays(today, 1) : today),
        sequence,
      }),
    [position, pace, studyDays, today, caughtUp, anchorIsFuture, anchoredOnIso, sequence],
  );
  const calculated = useMemo(() => officialOn(today), [today]);

  if (!settings.place) {
    const place: Place = { key: calculated.entry.key, daf: calculated.entry.daf, amud: "a" };
    setSettings((current) => (current.place ? current : { ...current, place, anchoredOn: todayIso }));
  } else if (!sanitizeAnchoredOn(settings.anchoredOn)) {
    const stamp = settings.doneToday?.date === todayIso ? toISODate(addDays(today, 1)) : todayIso;
    setSettings((current) => (sanitizeAnchoredOn(current.anchoredOn) ? current : { ...current, anchoredOn: stamp }));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadOfficial() {
      // Masechta lengths are stored locally. This call only learns the live
      // cycle, so today's official daf can replace the local one when the
      // API answers. The dev server proxies the first URL. The public API is
      // tried second; it currently omits CORS headers, so browsers often
      // cannot read it directly.
      const urls = ["/api/daf-yomi", "https://www.shas.org/daf-yomi-api/"];
      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const data: unknown = await response.json();
          if (cancelled || !isDafYomiPayload(data)) continue;
          setOfficial({ status: "ready", data });
          return;
        } catch {
          // Try the next source.
        }
      }
      if (!cancelled) setOfficial({ status: "error", data: null });
    }

    loadOfficial();
    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  useEffect(() => {
    document.documentElement.lang = i18n.lang;
    document.documentElement.dir = i18n.dir;
    document.title = i18n.t("appTitle");
  }, [i18n]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = window.setTimeout(() => setNotice(null), 5200);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    if (!settings.place || isCompletePlace(settings.place)) return;
    if (resolvePlace(settings.place)) return;
    setSettings((current) => ({
      ...current,
      place: { key: "berachos", daf: 2, amud: "a" },
      anchoredOn: todayIso,
      doneToday: null,
    }));
  }, [settings.place, setSettings, todayIso]);

  function remember() {
    setUndo({
      place: settings.place,
      anchoredOn: sanitizeAnchoredOn(settings.anchoredOn),
      doneToday: settings.doneToday ?? null,
    });
  }

  function jumpToToday() {
    setSelected(today);
    setMonth(monthStart(today));
  }

  function choosePlace(unit: { key: string; daf: number; amud?: string }) {
    const amud = unit.amud === "b" ? "b" : "a";
    const resolved = findAmud(unit.key, unit.daf, amud);
    if (!resolved) return;
    remember();
    setSettings((current) => ({
      ...current,
      place: { key: resolved.key, daf: resolved.daf, amud: resolved.amud },
      anchoredOn: todayIso,
      doneToday: null,
    }));
    const learnsToday = studyDays.includes(today.getDay());
    const label = i18n.label(resolved);
    setNotice({
      text: learnsToday
        ? i18n.t("noticeNextToday", { label })
        : i18n.t("noticeNextLater", { label }),
      undo: true,
    });
    jumpToToday();
  }

  function finishSession() {
    const session = plan.byDate.get(todayIso);
    if (!session?.indices.length) return;
    const first = AMUDIM[session.indices[0] ?? -1];
    if (!first) return;
    const next = AMUDIM[sequence[position + session.indices.length] ?? -1] ?? null;
    remember();
    setSettings((current) => ({
      ...current,
      place: next ? current.place : { complete: true },
      doneToday: {
        date: todayIso,
        from: { key: first.key, daf: first.daf, amud: first.amud },
        count: session.indices.length,
        units: session.indices.flatMap((index) => {
          const unit = AMUDIM[index];
          return unit ? [{ key: unit.key, daf: unit.daf, amud: unit.amud }] : [];
        }),
      },
    }));
    setNotice({
      text: next ? i18n.t("loggedNext", { label: i18n.label(next) }) : i18n.t("loggedDone"),
      undo: true,
    });
    jumpToToday();
  }

  function studyMore() {
    const next = position < sequence.length ? AMUDIM[sequence[position] ?? -1] : null;
    if (!next) return;
    remember();
    setSettings((current) => ({
      ...current,
      place: { key: next.key, daf: next.daf, amud: next.amud },
      anchoredOn: todayIso,
      doneToday: null,
    }));
    setNotice({ text: i18n.t("sessionBack"), undo: true });
  }

  function undoPlace() {
    if (!undo) return;
    setSettings((current) => ({
      ...current,
      place: undo.place,
      anchoredOn: undo.anchoredOn,
      doneToday: undo.doneToday,
    }));
    setUndo(null);
    setNotice({ text: i18n.t("restored") });
    jumpToToday();
  }

  function setPace(nextPace: number) {
    setSettings((current) => ({ ...current, pace: clampPace(nextPace) }));
  }

  function setLanguage(next: Language) {
    setSettings((current) => ({ ...current, language: sanitizeLanguage(next) }));
  }

  function setCustomOrder(enabled: boolean) {
    setSettings((current) => ({
      ...current,
      customOrder: enabled,
      masechtaOrder: enabled ? sanitizeOrder(current.masechtaOrder) : current.masechtaOrder,
    }));
  }

  function setMasechtaOrder(next: string[]) {
    setSettings((current) => ({ ...current, customOrder: true, masechtaOrder: sanitizeOrder(next) }));
  }

  function setCalendarView(next: CalendarView) {
    setSettings((current) => ({ ...current, calendarView: sanitizeCalendarView(next) }));
  }

  function setCompact(next: boolean) {
    setSettings((current) => ({ ...current, compact: next }));
  }

  function toggleStudyDay(day: number) {
    if (studyDays.includes(day) && studyDays.length === 1) {
      setNotice({ text: i18n.t("keepOneDay") });
      return;
    }
    const next = studyDays.includes(day)
      ? studyDays.filter((value) => value !== day)
      : [...studyDays, day].sort((a, b) => a - b);
    setSettings((current) => ({ ...current, studyDays: next }));
  }

  const firstUnit = AMUDIM[sequence[0]];
  const startName = firstUnit ? `${i18n.name(firstUnit)} ${i18n.dafNumber(firstUnit.daf)}` : "";

  if (!settings.place) {
    return (
      <I18nProvider i18n={i18n}>
        <div dir={i18n.dir} lang={i18n.lang} className="grid min-h-dvh place-items-center px-6">
          <div className="text-center">
            <p className="font-hebrew text-6xl text-wine">דף</p>
            <p className="mt-3 text-ink-soft">{official.status === "error" ? i18n.t("saving") : i18n.t("loading")}</p>
          </div>
        </div>
      </I18nProvider>
    );
  }

  const todaySession = plan.byDate.get(todayIso) ?? null;
  const finishedIndices = doneRecord ? indicesFromDone(doneRecord) : [];
  const nextSession = plan.sessions.find((session) => session.iso > todayIso) ?? null;
  const highlight = todaySession?.indices ?? nextSession?.indices ?? [];
  const sessionDafIndices = highlight
    .map((index) => AMUDIM[index]?.index)
    .filter((index): index is number => index !== undefined);
  const boundary = complete ? null : nextMasechtaOn(plan, sequence, position);
  const apiDaf = official.data ? findDaf(official.data.current_daf.key, official.data.current_daf.daf) : null;
  const officialDaf = apiDaf ?? calculated.entry;
  const officialAmud = findAmud(officialDaf.key, officialDaf.daf, "a");
  const cycleNumber = official.data?.cycle?.number ?? calculated.cycleNumber;
  const cycleLabel = i18n.cycle(cycleNumber);
  const listedMasechta =
    apiDaf && official.data && apiDaf.key !== official.data.current_daf.key
      ? masechtaByKey(official.data.current_daf.key)
      : null;
  const officialRank = officialAmud ? rank.get(officialAmud.amudIndex) : null;
  const apart = orderIsStandard && officialRank != null ? (position - officialRank) / 2 : null;
  const remaining = complete ? 0 : remainingDapim(sequence, position);

  return (
    <I18nProvider i18n={i18n}>
    <div dir={i18n.dir} lang={i18n.lang} className="mx-auto min-h-dvh max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <Settings
        language={language}
        customOrder={customOrder}
        order={order}
        currentKey={active?.key ?? null}
        compact={compact}
        onLanguage={setLanguage}
        onCustomOrder={setCustomOrder}
        onOrder={setMasechtaOrder}
        onCompact={setCompact}
      />

      {compact ? null : (
      <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <p className="text-xs font-medium tracking-[0.18em] text-wine uppercase">{i18n.t("personal")}</p>
          <h1 className="mt-2 font-display text-5xl tracking-tight sm:text-6xl">{i18n.t("appTitle")}</h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{i18n.t("tagline")}</p>
        </div>
        <div className="min-w-36">
          <p className="font-display text-5xl leading-none tabular-nums">{formatPercent(position, sequence.length)}%</p>
          <p className="mt-1 text-sm text-ink-soft">
            {remaining === 0 ? i18n.t("shasComplete") : i18n.t("left", { amount: formatDafAmount(remaining), word: i18n.dafWord(remaining) })}
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-wine" style={{ width: `${Math.min(100, (position / sequence.length) * 100)}%` }} />
          </div>
        </div>
      </header>
      )}

      <div className={`${compact ? "mt-4" : "mt-8 "}grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]`}>
        <TodayCard
          complete={complete}
          caughtUp={caughtUp}
          today={today}
          todaySession={todaySession}
          finishedIndices={finishedIndices}
          nextSession={nextSession}
          onPlace={choosePlace}
          onFinish={finishSession}
          onStudyMore={studyMore}
          onStartOver={() => firstUnit && choosePlace(firstUnit)}
          startName={startName}
          compact={compact}
        />
        <Controls
          pace={pace}
          onPace={setPace}
          studyDays={studyDays}
          onToggleDay={toggleStudyDay}
          plan={plan}
          boundary={boundary}
          todayIso={todayIso}
          officialDaf={officialDaf}
          cycleLabel={cycleLabel}
          listedMasechta={listedMasechta}
          apart={apart}
          onUseOfficial={() => officialAmud && choosePlace(officialAmud)}
          sameAsOfficial={Boolean(officialAmud && active && officialAmud.amudIndex === active.amudIndex)}
        />
      </div>

      <div className="mt-4">
        <DafPicker
          position={position}
          currentDafIndex={complete ? null : (active?.index ?? null)}
          currentAmud={active?.amud ?? "a"}
          currentKey={complete ? null : (active?.key ?? null)}
          sessionDafIndices={sessionDafIndices}
          viewKey={viewKey}
          onViewKey={setViewKey}
          onPlace={choosePlace}
          order={order}
          customOrder={customOrder && !orderIsStandard}
          rank={rank}
          lastRankByDaf={lastRankByDaf}
        />
      </div>

      <div className="mt-4">
        <Calendar
          plan={plan}
          today={today}
          month={month}
          onMonth={setMonth}
          studyDays={studyDays}
          onPlace={choosePlace}
          selected={selected}
          onSelect={setSelected}
          caughtUp={caughtUp}
          view={calendarView}
          onView={setCalendarView}
        />
      </div>

      <footer className="mt-8 flex flex-wrap items-start justify-between gap-3 pb-16 text-xs leading-relaxed text-ink-soft">
        <p className="max-w-xl">
          {i18n.t("footerBefore")}{" "}
          <a className="underline decoration-line underline-offset-2 hover:text-ink" href="https://www.shas.org/daf-yomi-api/api-documentation.html">
            {i18n.t("apiName")}
          </a>
          {i18n.t("footerBetween")}{" "}
          <a className="underline decoration-line underline-offset-2 hover:text-ink" href="https://www.shas.org/daf-pdf/api/api-documentation.html">
            {i18n.t("pdfName")}
          </a>
          {i18n.t("footerAfter")}
        </p>
        <button
          type="button"
          className="underline decoration-line underline-offset-2 hover:text-ink"
          onClick={() => firstUnit && choosePlace(firstUnit)}
        >
          {i18n.t("startOver", { name: startName })}
        </button>
      </footer>

      {notice ? (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-20 flex w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 items-center justify-between gap-4 rounded-2xl bg-ink px-4 py-3 text-sm text-paper shadow-xl"
        >
          <span>{notice.text}</span>
          {notice.undo && undo ? (
            <button type="button" className="shrink-0 font-medium text-gold" onClick={undoPlace}>
              {i18n.t("undo")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
    </I18nProvider>
  );
}

function TodayCard({
  complete,
  caughtUp,
  today,
  todaySession,
  finishedIndices,
  nextSession,
  onPlace,
  onFinish,
  onStudyMore,
  onStartOver,
  startName,
  compact,
}: {
  complete: boolean;
  caughtUp: boolean;
  today: Date;
  todaySession: Session | null;
  finishedIndices: number[];
  nextSession: Session | null;
  onPlace: (unit: Amud) => void;
  onFinish: () => void;
  onStudyMore: () => void;
  onStartOver: () => void;
  startName: string;
  compact: boolean;
}) {
  const i18n = useI18n();

  if (complete) {
    const ending = caughtUp && finishedIndices.length ? i18n.t("endingWith", { range: formatIndices(finishedIndices, i18n.groupOptions) }) : "";
    return (
      <section className={compact
        ? "rise relative overflow-hidden rounded-2xl bg-wine px-4 py-3 text-paper shadow-[0_14px_36px_-28px_rgba(92,24,36,0.85)]"
        : "rise relative overflow-hidden rounded-3xl bg-wine px-5 py-6 text-paper shadow-[0_22px_50px_-28px_rgba(92,24,36,0.85)] sm:px-7 sm:py-7"}>
        <div className="absolute inset-x-0 top-0 h-px bg-gold" />
        <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">{i18n.t("siyumHashas")}</p>
        <h2 className={compact ? "mt-1 font-hebrew text-3xl leading-none" : "mt-3 font-hebrew text-5xl leading-none"}>{i18n.t("congrats")}</h2>
        <p className={compact ? "mt-2 max-w-md text-sm text-paper/85" : "mt-4 max-w-md text-paper/85"}>
          {i18n.t("finishedAll", { count: TOTAL.toLocaleString(i18n.locale) })}
          {ending}
        </p>
        <button
          type="button"
          className={compact
            ? "mt-3 rounded-full bg-paper px-3 py-1 text-sm font-medium text-wine"
            : "mt-6 rounded-full bg-paper px-4 py-2 text-sm font-medium text-wine"}
          onClick={onStartOver}
        >
          {i18n.t("startAgain", { name: startName })}
        </button>
      </section>
    );
  }

  let indices = todaySession?.indices ?? [];
  let kicker = i18n.t("todayKicker", { date: formatWeekday(today, i18n.locale) });
  let lede: string | null = null;
  let action: ReactNode = null;

  if (todaySession) {
    const amount = formatDafAmount(todaySession.spent / 2);
    const word = i18n.dafWord(todaySession.spent / 2);
    action = (
      <button type="button" className={compact ? "rounded-full bg-paper px-3 py-1 text-sm font-medium text-wine" : "rounded-full bg-paper px-4 py-2 text-sm font-medium text-wine"} onClick={onFinish}>
        {i18n.t("finishButton", { amount, word })}
      </button>
    );
  } else if (caughtUp && nextSession) {
    indices = nextSession.indices;
    kicker = i18n.t("nextKicker", { date: formatWeekday(nextSession.date, i18n.locale) });
    lede = finishedIndices.length
      ? i18n.t("finishedRange", { range: formatIndices(finishedIndices, i18n.groupOptions) })
      : i18n.t("alreadyLogged");
    action = (
      <button type="button" className={compact ? "rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-paper" : "rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-paper"} onClick={onStudyMore}>
        {i18n.t("studyMore")}
      </button>
    );
  } else if (nextSession) {
    indices = nextSession.indices;
    kicker = i18n.t("nextKicker", { date: formatWeekday(nextSession.date, i18n.locale) });
    lede = i18n.t("todayOff");
  }

  const groups = groupAmudim(indices);
  const lead = groups[0];
  const notes: Amud[] = [];
  const seenNotes = new Set<number>();
  for (const index of indices) {
    const unit = AMUDIM[index];
    if (unit?.note && !seenNotes.has(unit.index)) {
      seenNotes.add(unit.index);
      notes.push(unit);
    }
  }

  return (
    <section className={compact
      ? "rise relative overflow-hidden rounded-2xl bg-wine px-4 py-3 text-paper shadow-[0_14px_36px_-28px_rgba(92,24,36,0.85)]"
      : "rise relative overflow-hidden rounded-3xl bg-wine px-5 py-6 text-paper shadow-[0_22px_50px_-28px_rgba(92,24,36,0.85)] sm:px-7 sm:py-7"}>
      <div className="absolute inset-x-0 top-0 h-px bg-gold" />
      <div className={compact ? "flex flex-wrap items-center justify-between gap-x-3 gap-y-1" : ""}>
        <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">{kicker}</p>
        {compact ? action : null}
      </div>
      {lead ? (
        <>
          <h2 className={compact ? "mt-1 font-hebrew text-3xl leading-none" : "mt-3 font-hebrew text-5xl leading-none sm:text-6xl"}>{lead.hebrew}</h2>
          <p className={compact ? "mt-1 font-display text-xl tracking-tight" : "mt-3 font-display text-3xl tracking-tight"}>
            {groups.map((group) => formatGroup(group, i18n.groupOptions)).join(" · ")}
          </p>
          {lede ? <p className={compact ? "mt-1 text-sm text-paper/80" : "mt-2 text-sm text-paper/80"}>{lede}</p> : null}
        </>
      ) : (
        <h2 className={compact ? "mt-1 font-display text-2xl" : "mt-3 font-display text-3xl"}>{i18n.t("nothingLeft")}</h2>
      )}

      {!compact && indices.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {indices.map((index) => {
            const unit = AMUDIM[index];
            return (
              <div key={index} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
                <button type="button" className="text-start" onClick={() => onPlace(unit)} aria-label={i18n.t("setAmud", { name: i18n.label(unit) })}>
                  <span className="block font-display text-3xl leading-none">
                    {i18n.dafNumber(unit.daf)}
                    <span className={i18n.lang === "he" ? "ms-1 text-lg" : "text-lg"}>{i18n.amud(unit.amud)}</span>
                  </span>
                  <span className="mt-1 block text-[11px] tracking-wide text-paper/75 uppercase">{i18n.short(unit)}</span>
                </button>
                <AmudLinks daf={unit} amud={unit.amud} tone="wine" />
              </div>
            );
          })}
        </div>
      ) : null}

      {notes.length ? (
        <ul className={compact ? "mt-2 space-y-1 text-sm text-paper/80" : "mt-4 space-y-1 text-sm text-paper/80"}>
          {notes.map((daf) => (
            <li key={daf.index}>
              {i18n.name(daf)} {i18n.dafNumber(daf.daf)}: {i18n.note(daf)}
            </li>
          ))}
        </ul>
      ) : null}

      {compact ? null : (
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {action}
        <p className="text-sm text-paper/75">{i18n.t("scanHint")}</p>
      </div>
      )}
    </section>
  );
}

function Controls({
  pace,
  onPace,
  studyDays,
  onToggleDay,
  plan,
  boundary,
  todayIso,
  officialDaf,
  cycleLabel,
  listedMasechta,
  apart,
  onUseOfficial,
  sameAsOfficial,
}: {
  pace: number;
  onPace: (pace: number) => void;
  studyDays: number[];
  onToggleDay: (day: number) => void;
  plan: Plan;
  boundary: ReturnType<typeof nextMasechtaOn>;
  todayIso: string;
  officialDaf: Daf;
  cycleLabel: string;
  listedMasechta: Masechta | null;
  apart: number | null;
  onUseOfficial: () => void;
  sameAsOfficial: boolean;
}) {
  const i18n = useI18n();
  let boundaryText = i18n.t("lastMasechta");
  if (boundary?.upcoming && boundary.starts) {
    const when = formatWeekday(boundary.starts.date, i18n.locale);
    boundaryText = boundary.starts.iso === todayIso
      ? i18n.t("beginsToday", { name: i18n.name(boundary.upcoming) })
      : i18n.t("beginsWhen", { name: i18n.name(boundary.upcoming), when });
  } else if (boundary?.finishes && !boundary.upcoming) {
    boundaryText = i18n.t("closesWhen", {
      name: i18n.name(boundary.current),
      when: formatWeekday(boundary.finishes.date, i18n.locale),
    });
  }

  return (
    <section className="rounded-3xl bg-paper px-5 py-6 shadow-[0_18px_50px_-32px_rgba(28,22,18,0.55)] ring-1 ring-ink/10">
      <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("pace")}</p>
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-parchment text-xl disabled:opacity-40"
          aria-label={i18n.t("fewer")}
          disabled={pace <= 0.5}
          onClick={() => onPace(pace - 0.5)}
        >
          −
        </button>
        <div>
          <p className="font-display text-5xl leading-none tabular-nums">{formatPace(pace)}</p>
          <p className="mt-1 text-sm text-ink-soft">{i18n.paceCaption(pace)}</p>
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full bg-parchment text-xl disabled:opacity-40"
          aria-label={i18n.t("more")}
          disabled={pace >= 10}
          onClick={() => onPace(pace + 0.5)}
        >
          +
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {PACE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-pressed={pace === preset}
            aria-label={i18n.t("preset", { amount: preset, word: i18n.dafWord(preset) })}
            className={`rounded-full px-3 py-1 text-sm tabular-nums ${pace === preset ? "bg-ink text-paper" : "bg-parchment text-ink"}`}
            onClick={() => onPace(preset)}
          >
            {formatPace(preset)}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("studyDays")}</p>
      <div className="mt-3 flex gap-1.5">
        {i18n.weekdays.map((label, day) => {
          const on = studyDays.includes(day);
          return (
            <button
              key={WEEKDAYS[day]}
              type="button"
              aria-pressed={on}
              aria-label={i18n.t(on ? "removeDay" : "addDay", { day: i18n.weekdayName(day) })}
              className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-xs font-medium ${on ? "bg-moss text-paper" : "bg-parchment text-ink-soft"}`}
              onClick={() => onToggleDay(day)}
            >
              {i18n.lang === "he" ? label : label.slice(0, 2)}
            </button>
          );
        })}
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-ink-soft">{i18n.t("siyum")}</dt>
          <dd className="font-medium">
            {plan.finishDate
              ? `${formatMonth(plan.finishDate, i18n.locale)} · ${plan.studyDayCount} ${plan.studyDayCount === 1 ? i18n.t("studyDay") : i18n.t("studyDaysWord")}`
              : i18n.t("atTheEnd")}
          </dd>
        </div>
        <div>
          <dt className="text-ink-soft">{i18n.t("nextMasechta")}</dt>
          <dd className="font-medium">{boundaryText}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">{i18n.t("dafYomi")}</dt>
          <dd className="font-medium">
            {cycleLabel} · {i18n.name(officialDaf)} {i18n.dafNumber(officialDaf.daf)}
            {listedMasechta ? ` ${i18n.t("listedAs", { name: i18n.name(listedMasechta) })}` : ""}
            <span className="mt-1 block font-normal text-ink-soft">
              {apart == null ? i18n.t("customCompare") : gapLabel(apart, i18n)}
            </span>
          </dd>
        </div>
      </dl>

      {officialDaf && !sameAsOfficial ? (
        <button type="button" className="mt-4 text-sm font-medium text-wine underline decoration-wine/30 underline-offset-2" onClick={onUseOfficial}>
          {i18n.t("setOfficial")}
        </button>
      ) : null}
    </section>
  );
}
