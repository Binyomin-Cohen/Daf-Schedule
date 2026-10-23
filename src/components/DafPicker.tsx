import { useEffect, useRef, type RefObject } from "react";
import { AMUDIM, DAPIM, MASECHTOS, SEDERS, type AmudSide, type Daf, type Masechta } from "../data/shas.ts";
import { useI18n } from "../i18n.tsx";
import { formatDafAmount } from "../lib/plan.ts";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function DafPicker({
  position,
  currentDafIndex,
  currentAmud,
  currentKey,
  sessionDafIndices,
  viewKey,
  onViewKey,
  onPlace,
  order,
  customOrder,
  lastRankByDaf,
  rank,
}: {
  position: number;
  currentDafIndex: number | null;
  currentAmud: AmudSide;
  currentKey: string | null;
  sessionDafIndices: number[];
  viewKey: string;
  onViewKey: (key: string) => void;
  onPlace: (unit: Daf) => void;
  order: string[];
  customOrder: boolean;
  lastRankByDaf: Map<number, number>;
  rank: Map<number, number>;
}) {
  const i18n = useI18n();
  const activeRef = useRef<HTMLButtonElement>(null);
  const viewed = MASECHTOS.find((masechta) => masechta.key === viewKey) ?? MASECHTOS[0];
  const session = new Set(sessionDafIndices);
  const masechtaAmudim = AMUDIM.filter((unit) => unit.key === viewed.key);
  const doneAmudim = masechtaAmudim.filter((unit) => (rank.get(unit.amudIndex) ?? Infinity) < position).length;
  let status = i18n.t("notYet");
  if (doneAmudim === masechtaAmudim.length && doneAmudim > 0) status = i18n.t("finished");
  else if (doneAmudim > 0) status = i18n.t("doneOf", { done: formatDafAmount(doneAmudim / 2), total: viewed.count });

  const ordered = customOrder
    ? order
        .map((key) => MASECHTOS.find((masechta) => masechta.key === key))
        .filter((masechta): masechta is Masechta => masechta != null)
    : null;

  useEffect(() => {
    const node = activeRef.current;
    const row = node?.closest("[data-masechta-row]");
    if (!node || !row) return;
    const rowRect = row.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const delta = nodeRect.left - rowRect.left - rowRect.width / 2 + nodeRect.width / 2;
    row.scrollBy({ left: delta });
  }, [viewKey]);

  return (
    <section className="rounded-3xl bg-paper p-4 shadow-[0_18px_50px_-32px_rgba(28,22,18,0.55)] ring-1 ring-ink/8 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-ink-soft uppercase">{i18n.t("where")}</p>
          <h2 className="font-display text-3xl tracking-tight">{i18n.t("clickNext")}</h2>
        </div>
        <p className="max-w-sm text-sm text-ink-soft">{i18n.t("pickerHelp")}</p>
      </div>

      <div data-masechta-row className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {ordered ? (
          <div className="flex shrink-0 items-center gap-1.5">
            {ordered.map((masechta) => (
              <MasechtaChip
                key={masechta.key}
                masechta={masechta}
                active={masechta.key === viewed.key}
                here={masechta.key === currentKey}
                activeRef={activeRef}
                onViewKey={onViewKey}
              />
            ))}
          </div>
        ) : (
          SEDERS.map((seder) => (
            <div key={seder.id} className="flex shrink-0 items-center gap-1.5">
              <span className="pe-1 text-[11px] font-medium tracking-wide text-ink-soft uppercase">
                {i18n.lang === "he" ? seder.hebrew : seder.id}
              </span>
              {MASECHTOS.filter((masechta) => masechta.seder === seder.id).map((masechta) => (
                <MasechtaChip
                  key={masechta.key}
                  masechta={masechta}
                  active={masechta.key === viewed.key}
                  here={masechta.key === currentKey}
                  activeRef={activeRef}
                  onViewKey={onViewKey}
                />
              ))}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl">
          <span className="font-hebrew text-wine">{viewed.hebrew}</span>
          {i18n.lang === "en" ? <span className="text-ink"> {viewed.name}</span> : null}
        </h3>
        <p className="text-sm text-ink-soft">{status}</p>
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5">
        {Array.from({ length: viewed.count }, (_, offset) => {
          const daf = DAPIM[viewed.firstIndex + offset];
          const done = (lastRankByDaf.get(daf.index) ?? Infinity) < position;
          const current = daf.index === currentDafIndex;
          const inSession = session.has(daf.index);
          return (
            <button
              key={daf.index}
              id={`daf-${daf.index}`}
              type="button"
              aria-current={current ? "step" : undefined}
              aria-label={i18n.t("setDaf", { name: `${i18n.name(daf)} ${daf.daf}${i18n.amud("a")}` })}
              onClick={() => onPlace(daf)}
              className={cx(
                "aspect-square rounded-xl text-sm tabular-nums transition",
                current && "bg-wine text-paper shadow-[0_8px_16px_-10px_rgba(125,36,50,0.9)]",
                done && !current && "bg-moss/15 text-moss",
                !done && !current && "bg-parchment text-ink hover:bg-line",
                inSession && !current && "ring-2 ring-gold ring-inset",
              )}
            >
              {current && currentAmud === "b" ? (
                <>
                  {daf.daf}
                  <span className="text-[10px]">{i18n.amud("b")}</span>
                </>
              ) : (
                daf.daf
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-moss/30" /> {i18n.t("done")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-wine" /> {i18n.t("nextDaf")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-parchment ring-2 ring-gold ring-inset" /> {i18n.t("thisSession")}
        </span>
      </div>
    </section>
  );
}

function MasechtaChip({
  masechta,
  active,
  here,
  activeRef,
  onViewKey,
}: {
  masechta: Masechta;
  active: boolean;
  here: boolean;
  activeRef: RefObject<HTMLButtonElement | null>;
  onViewKey: (key: string) => void;
}) {
  const i18n = useI18n();
  return (
    <button
      ref={active ? activeRef : null}
      id={`masechta-${masechta.key}`}
      type="button"
      aria-pressed={active}
      onClick={() => onViewKey(masechta.key)}
      className={cx(
        "rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition",
        active ? "bg-ink text-paper" : "bg-parchment text-ink hover:bg-line",
        i18n.lang === "he" && "font-hebrew",
      )}
    >
      {here ? <span className="me-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" /> : null}
      {i18n.name(masechta)}
    </button>
  );
}
