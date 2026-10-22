import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Calendar } from "./components/Calendar.jsx";
import { DafPicker } from "./components/DafPicker.jsx";
import { Settings } from "./components/Settings.jsx";
import { AmudLinks } from "./components/AmudLinks.jsx";
import { I18nProvider, useI18n } from "./i18n.jsx";
import { AMUDIM, AMUD_TOTAL, TOTAL, findAmud, findDaf, masechtaByKey, resolvePlace } from "./data/shas.js";
import { makeI18n } from "./lib/i18n.js";
import { isStandardOrder, sanitizeOrder, studyIndex } from "./lib/order.js";
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
  monthStart,
  startOfDay,
  toISODate,
} from "./lib/plan.js";
import { officialOn } from "./lib/official.js";
import { clampPace, sanitizeCalendarView, sanitizeDays, sanitizeLanguage, settingsAtom } from "./state.js";

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

function indicesFromDone(done) {
  if (Array.isArray(done.units) && done.units.length) {
    return done.units
      .map((unit) => findAmud(unit.key, unit.daf, unit.amud)?.amudIndex)
      .filter((index) => index !== undefined);
  }
  if (done.from?.amud !== "a" && done.from?.amud !== "b") return [];
  const start = findAmud(done.from.key, done.from.daf, done.from.amud);
  if (!start || !Number.isInteger(done.count)) return [];
  const indices = [];
  for (let offset = 0; offset < done.count; offset += 1) {
    const index = start.amudIndex + offset;
    if (index >= AMUD_TOTAL) break;
    indices.push(index);
  }
  return indices;
}

function formatPercent(position, total) {
  if (!total) return "0";
  const value = Math.round((position / total) * 1000) / 10;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function gapLabel(apart, i18n) {
  if (apart === 0) return i18n.t("level");
  const amount = formatDafAmount(Math.abs(apart));
  const word = i18n.dafWord(Math.abs(apart));
  return i18n.t(apart > 0 ? "ahead" : "behind", { amount, word });
}

export default function App() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [official, setOfficial] = useState({ status: "loading", data: null });
  const [notice, setNotice] = useState(null);
  const [undo, setUndo] = useState(null);
  const today = useToday();
  const todayIso = toISODate(today);
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => monthStart(today));

  const pace = clampPace(settings.pace);
  const studyDays = useMemo(() => sanitizeDays(settings.studyDays), [settings.studyDays]);
  const language = sanitizeLanguage(settings.language);
  const calendarView = sanitizeCalendarView(settings.calendarView);
  const customOrder = settings.customOrder === true;
  const order = useMemo(
    () => sanitizeOrder(customOrder ? settings.masechtaOrder : null),
    [customOrder, settings.masechtaOrder],
  );
  const orderIsStandard = !customOrder || isStandardOrder(order);
  const { sequence, rank, lastRankByDaf } = useMemo(() => studyIndex(order), [order]);
  const i18n = useMemo(() => makeI18n(language), [language]);
  const complete = Boolean(settings.place?.complete);
  const active = resolvePlace(settings.place);
  const position = complete ? sequence.length : (active ? (rank.get(active.amudIndex) ?? 0) : 0);
  const placeKey = active?.key ?? "berachos";
  const [viewKey, setViewKey] = useState(placeKey);
  const [trackedKey, setTrackedKey] = useState(placeKey);
  if (trackedKey !== placeKey) {
    setTrackedKey(placeKey);
    setViewKey(placeKey);
  }

  const doneRecord =
    settings.doneToday?.date === todayIso &&
    settings.doneToday.from &&
    (settings.doneToday.from.amud === "a" || settings.doneToday.from.amud === "b")
      ? settings.doneToday
      : null;
  const caughtUp = Boolean(doneRecord);

  const plan = useMemo(
    () =>
      buildPlan({
        position,
        pace,
        studyDays,
        start: caughtUp ? addDays(today, 1) : today,
        sequence,
      }),
    [position, pace, studyDays, today, caughtUp, sequence],
  );
  const calculated = useMemo(() => officialOn(today), [today]);

  if (!settings.place) {
    const place = { key: calculated.entry.key, daf: calculated.entry.daf, amud: "a" };
    setSettings((current) => (current.place ? current : { ...current, place }));
  }

  useEffect(() => {
    let cancelled = false;

    async function loadOfficial() {
      // The dev server proxies the first URL. The public API is tried second;
      // it currently omits CORS headers, so browsers often cannot read it directly.
      const urls = ["/api/daf-yomi", "https://www.shas.org/daf-yomi-api/"];
      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) continue;
          const data = await response.json();
          if (cancelled || !data?.current_daf?.key) continue;
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
    if (!settings.place || settings.place.complete) return;
    if (resolvePlace(settings.place)) return;
    setSettings((current) => ({
      ...current,
      place: { key: "berachos", daf: 2, amud: "a" },
      doneToday: null,
    }));
  }, [settings.place, setSettings]);

  function remember() {
    setUndo({ place: settings.place, doneToday: settings.doneToday ?? null });
  }

  function jumpToToday() {
    setSelected(today);
    setMonth(monthStart(today));
  }

  function choosePlace(unit) {
    const amud = unit.amud === "b" ? "b" : "a";
    const resolved = findAmud(unit.key, unit.daf, amud);
    if (!resolved) return;
    remember();
    setSettings((current) => ({
      ...current,
      place: { key: resolved.key, daf: resolved.daf, amud: resolved.amud },
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
    if (!session) return;
    const first = AMUDIM[session.indices[0]];
    const next = AMUDIM[session.indices[session.indices.length - 1] + 1] ?? null;
    remember();
    setSettings((current) => ({
      ...current,
      place: next ? { key: next.key, daf: next.daf, amud: next.amud } : { complete: true },
      doneToday: {
        date: todayIso,
        from: { key: first.key, daf: first.daf, amud: first.amud },
        count: session.indices.length,
        units: session.indices.map((index) => {
          const unit = AMUDIM[index];
          return { key: unit.key, daf: unit.daf, amud: unit.amud };
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
    remember();
    setSettings((current) => ({ ...current, doneToday: null }));
    setNotice({ text: i18n.t("sessionBack"), undo: true });
  }

  function undoPlace() {
    if (!undo) return;
    setSettings((current) => ({ ...current, place: undo.place, doneToday: undo.doneToday }));
    setUndo(null);
    setNotice({ text: i18n.t("restored") });
    jumpToToday();
  }

  function setPace(nextPace) {
    setSettings((current) => ({ ...current, pace: clampPace(nextPace) }));
  }

  function setLanguage(next) {
    setSettings((current) => ({ ...current, language: sanitizeLanguage(next) }));
  }

  function setCustomOrder(enabled) {
    setSettings((current) => ({
      ...current,
      customOrder: enabled,
      masechtaOrder: enabled ? sanitizeOrder(current.masechtaOrder) : current.masechtaOrder,
    }));
  }

  function setMasechtaOrder(next) {
    setSettings((current) => ({ ...current, customOrder: true, masechtaOrder: sanitizeOrder(next) }));
  }

  function setCalendarView(next) {
    setSettings((current) => ({ ...current, calendarView: sanitizeCalendarView(next) }));
  }

  function toggleStudyDay(day) {
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
  const startName = firstUnit ? `${i18n.name(firstUnit)} ${firstUnit.daf}` : "";

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
  const sessionDafIndices = highlight.map((index) => AMUDIM[index]?.index).filter((index) => index !== undefined);
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
      <header className="flex flex-wrap items-end justify-between gap-6">
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

      <div className="mt-8 grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
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
        <Settings
          language={language}
          customOrder={customOrder}
          order={order}
          currentKey={active?.key ?? null}
          onLanguage={setLanguage}
          onCustomOrder={setCustomOrder}
          onOrder={setMasechtaOrder}
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
}) {
  const i18n = useI18n();

  if (complete) {
    const ending = caughtUp && finishedIndices.length ? i18n.t("endingWith", { range: formatIndices(finishedIndices, i18n.groupOptions) }) : "";
    return (
      <section className="rise relative overflow-hidden rounded-3xl bg-wine px-5 py-6 text-paper shadow-[0_22px_50px_-28px_rgba(92,24,36,0.85)] sm:px-7 sm:py-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gold" />
        <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">{i18n.t("siyumHashas")}</p>
        <h2 className="mt-3 font-hebrew text-5xl leading-none">{i18n.t("congrats")}</h2>
        <p className="mt-4 max-w-md text-paper/85">
          {i18n.t("finishedAll", { count: TOTAL.toLocaleString(i18n.locale) })}
          {ending}
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-paper px-4 py-2 text-sm font-medium text-wine"
          onClick={onStartOver}
        >
          {i18n.t("startAgain", { name: startName })}
        </button>
      </section>
    );
  }

  let indices = todaySession?.indices ?? [];
  let kicker = i18n.t("todayKicker", { date: formatWeekday(today, i18n.locale) });
  let lede = null;
  let action = null;

  if (todaySession) {
    const amount = formatDafAmount(todaySession.spent / 2);
    const word = i18n.dafWord(todaySession.spent / 2);
    action = (
      <button type="button" className="rounded-full bg-paper px-4 py-2 text-sm font-medium text-wine" onClick={onFinish}>
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
      <button type="button" className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-paper" onClick={onStudyMore}>
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
  const notes = [];
  const seenNotes = new Set();
  for (const index of indices) {
    const unit = AMUDIM[index];
    if (unit?.note && !seenNotes.has(unit.index)) {
      seenNotes.add(unit.index);
      notes.push(unit);
    }
  }

  return (
    <section className="rise relative overflow-hidden rounded-3xl bg-wine px-5 py-6 text-paper shadow-[0_22px_50px_-28px_rgba(92,24,36,0.85)] sm:px-7 sm:py-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gold" />
      <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">{kicker}</p>
      {lead ? (
        <>
          <h2 className="mt-3 font-hebrew text-5xl leading-none sm:text-6xl">{lead.hebrew}</h2>
          <p className="mt-3 font-display text-3xl tracking-tight">
            {groups.map((group) => formatGroup(group, i18n.groupOptions)).join(" · ")}
          </p>
          {lede ? <p className="mt-2 text-sm text-paper/80">{lede}</p> : null}
        </>
      ) : (
        <h2 className="mt-3 font-display text-3xl">{i18n.t("nothingLeft")}</h2>
      )}

      {indices.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {indices.map((index) => {
            const unit = AMUDIM[index];
            return (
              <div key={index} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
                <button type="button" className="text-start" onClick={() => onPlace(unit)} aria-label={i18n.t("setAmud", { name: i18n.label(unit) })}>
                  <span className="block font-display text-3xl leading-none">
                    {unit.daf}
                    <span className="text-lg">{i18n.amud(unit.amud)}</span>
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
        <ul className="mt-4 space-y-1 text-sm text-paper/80">
          {notes.map((daf) => (
            <li key={daf.index}>
              {i18n.name(daf)} {daf.daf}: {i18n.note(daf)}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {action}
        <p className="text-sm text-paper/75">{i18n.t("scanHint")}</p>
      </div>
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
            {cycleLabel} · {i18n.name(officialDaf)} {officialDaf.daf}
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
