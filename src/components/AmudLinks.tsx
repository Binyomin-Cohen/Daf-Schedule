import { pdfUrl, type AmudSide, type Daf } from "../data/shas.ts";
import { useI18n } from "../i18n.tsx";

type PdfDaf = Pick<Daf, "pdfKey" | "daf" | "endAmud" | "name" | "hebrew">;

export function AmudLink({ daf, amud, tone = "paper" }: { daf: PdfDaf; amud: AmudSide; tone?: "paper" | "wine" }) {
  const i18n = useI18n();
  const letter = amud === "a" ? "א" : "ב";
  const className =
    tone === "wine"
      ? "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/15 font-hebrew text-sm text-paper transition hover:bg-paper hover:text-wine"
      : "inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-parchment font-hebrew text-sm text-ink transition hover:bg-wine hover:text-paper";

  return (
    <a
      href={pdfUrl(daf, amud)}
      target="_blank"
      rel="noreferrer"
      className={className}
      aria-label={i18n.t("openDaf", { name: `${i18n.name(daf)} ${i18n.dafNumber(daf.daf)}${i18n.amud(amud)}` })}
    >
      {letter}
    </a>
  );
}

export function AmudLinks({ daf, amud, tone = "paper" }: { daf: PdfDaf; amud?: AmudSide; tone?: "paper" | "wine" }) {
  const amudim: AmudSide[] = amud ? [amud] : daf.endAmud === "a" ? ["a"] : ["a", "b"];
  return (
    <span className="inline-flex gap-1">
      {amudim.map((amud) => (
        <AmudLink key={amud} daf={daf} amud={amud} tone={tone} />
      ))}
    </span>
  );
}
