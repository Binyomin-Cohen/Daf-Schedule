/**
 * Masechta order and daf ranges come from the captured Shas.org responses
 * in masechtaApi.ts. Dapim are counted the way Daf Yomi counts them: daf 2
 * through the last printed daf, including a final amud aleph. Me'ilah,
 * Kinim, Tamid, and Middos share one printed volume; the Daf Yomi response
 * calls that whole stretch Me'ilah.
 */
import { DAF_YOMI_MASECHTOS, PDF_MASECHTA_LIST, capturedEndAmud, type DafYomiMasechta } from "./masechtaApi.ts";

export const SEDERS = [
  { id: "Zeraim", hebrew: "זרעים", color: "#5f6e32" },
  { id: "Moed", hebrew: "מועד", color: "#7d2432" },
  { id: "Nashim", hebrew: "נשים", color: "#2f4578" },
  { id: "Nezikin", hebrew: "נזיקין", color: "#8a5428" },
  { id: "Kodashim", hebrew: "קדשים", color: "#1e463f" },
  { id: "Taharos", hebrew: "טהרות", color: "#56486e" },
];

export type AmudSide = "a" | "b";

export type Note = { en: string; he: string };

export type Daf = {
  index: number;
  key: string;
  pdfKey: string;
  name: string;
  shortName: string;
  hebrew: string;
  seder: string;
  color: string;
  daf: number;
  endAmud: AmudSide;
  note: Note | null;
};

export type Amud = Daf & { amud: AmudSide; amudIndex: number };

type MasechtaDef = {
  key: string;
  name: string;
  shortName: string;
  hebrew: string;
  seder: string;
  end: number;
  endAmud: AmudSide;
  start?: number;
  pdfKey?: string;
};

export type Masechta = MasechtaDef & {
  start: number;
  color: string;
  firstIndex: number;
  count: number;
};

export type StudyPlace = { key: string; daf: number; amud?: AmudSide };
export type Place = StudyPlace | { complete: true };

export function isCompletePlace(place: Place | null | undefined): place is { complete: true } {
  return !!place && "complete" in place && place.complete === true;
}

const SEDER_COLOR: Record<string, string> = Object.fromEntries(SEDERS.map((seder) => [seder.id, seder.color]));

const NOTES: Record<string, Note> = {
  "meilah:22": {
    en: "22a finishes Me'ilah. 22b is the opening of Kinim.",
    he: "כב ע״א מסיים את מעילה. כב ע״ב הוא תחילת קינים.",
  },
  "kinim:25": {
    en: "25a finishes Kinim. 25b is the opening of Tamid.",
    he: "כה ע״א מסיים את קינים. כה ע״ב הוא תחילת תמיד.",
  },
};

const FACE: Record<string, { shortName: string; hebrew: string; seder: string }> = {
  berachos: { shortName: "Berachos", hebrew: "ברכות", seder: "Zeraim" },
  shabbos: { shortName: "Shabbos", hebrew: "שבת", seder: "Moed" },
  eruvin: { shortName: "Eruvin", hebrew: "עירובין", seder: "Moed" },
  pesachim: { shortName: "Pesachim", hebrew: "פסחים", seder: "Moed" },
  shekalim: { shortName: "Shekalim", hebrew: "שקלים", seder: "Moed" },
  yoma: { shortName: "Yoma", hebrew: "יומא", seder: "Moed" },
  sukkah: { shortName: "Sukkah", hebrew: "סוכה", seder: "Moed" },
  beitzah: { shortName: "Beitzah", hebrew: "ביצה", seder: "Moed" },
  "rosh-hashanah": { shortName: "Rosh Hash.", hebrew: "ראש השנה", seder: "Moed" },
  taanis: { shortName: "Ta'anis", hebrew: "תענית", seder: "Moed" },
  megillah: { shortName: "Megillah", hebrew: "מגילה", seder: "Moed" },
  "moed-katan": { shortName: "Moed Katan", hebrew: "מועד קטן", seder: "Moed" },
  chagigah: { shortName: "Chagigah", hebrew: "חגיגה", seder: "Moed" },
  yevamos: { shortName: "Yevamos", hebrew: "יבמות", seder: "Nashim" },
  kesubos: { shortName: "Kesubos", hebrew: "כתובות", seder: "Nashim" },
  nedarim: { shortName: "Nedarim", hebrew: "נדרים", seder: "Nashim" },
  nazir: { shortName: "Nazir", hebrew: "נזיר", seder: "Nashim" },
  sotah: { shortName: "Sotah", hebrew: "סוטה", seder: "Nashim" },
  gittin: { shortName: "Gittin", hebrew: "גיטין", seder: "Nashim" },
  kiddushin: { shortName: "Kiddushin", hebrew: "קידושין", seder: "Nashim" },
  "bava-kamma": { shortName: "B. Kamma", hebrew: "בבא קמא", seder: "Nezikin" },
  "bava-metzia": { shortName: "B. Metzia", hebrew: "בבא מציעא", seder: "Nezikin" },
  "bava-basra": { shortName: "B. Basra", hebrew: "בבא בתרא", seder: "Nezikin" },
  sanhedrin: { shortName: "Sanhedrin", hebrew: "סנהדרין", seder: "Nezikin" },
  makkos: { shortName: "Makkos", hebrew: "מכות", seder: "Nezikin" },
  shevuos: { shortName: "Shevuos", hebrew: "שבועות", seder: "Nezikin" },
  "avodah-zarah": { shortName: "A. Zarah", hebrew: "עבודה זרה", seder: "Nezikin" },
  horayos: { shortName: "Horayos", hebrew: "הוריות", seder: "Nezikin" },
  zevachim: { shortName: "Zevachim", hebrew: "זבחים", seder: "Kodashim" },
  menachos: { shortName: "Menachos", hebrew: "מנחות", seder: "Kodashim" },
  chullin: { shortName: "Chullin", hebrew: "חולין", seder: "Kodashim" },
  bechoros: { shortName: "Bechoros", hebrew: "בכורות", seder: "Kodashim" },
  arachin: { shortName: "Arachin", hebrew: "ערכין", seder: "Kodashim" },
  temurah: { shortName: "Temurah", hebrew: "תמורה", seder: "Kodashim" },
  kereisos: { shortName: "Kereisos", hebrew: "כריתות", seder: "Kodashim" },
  meilah: { shortName: "Me'ilah", hebrew: "מעילה", seder: "Kodashim" },
  kinim: { shortName: "Kinim", hebrew: "קינים", seder: "Kodashim" },
  tamid: { shortName: "Tamid", hebrew: "תמיד", seder: "Kodashim" },
  middos: { shortName: "Middos", hebrew: "מידות", seder: "Kodashim" },
  niddah: { shortName: "Niddah", hebrew: "נדה", seder: "Taharos" },
};

// Printed breaks inside the single Me'ilah volume the Daf Yomi API returns.
const MEILAH_PARTS: Array<{ key: string; name: string; start: number; end: number }> = [
  { key: "meilah", name: "Me'ilah", start: 2, end: 22 },
  { key: "kinim", name: "Kinim", start: 23, end: 25 },
  { key: "tamid", name: "Tamid", start: 26, end: 33 },
  { key: "middos", name: "Middos", start: 34, end: 37 },
];

function faceOf(key: string): { shortName: string; hebrew: string; seder: string } {
  const face = FACE[key];
  if (!face) throw new Error(`Missing Hebrew name for ${key}`);
  return face;
}

function defFromSpan(span: DafYomiMasechta): MasechtaDef {
  const key = span.first.current_daf.key;
  const end = span.last.current_daf.daf;
  const face = faceOf(key);
  return {
    key,
    name: span.first.current_daf.masechta,
    shortName: face.shortName,
    hebrew: face.hebrew,
    seder: face.seder,
    start: span.first.current_daf.daf,
    end,
    endAmud: capturedEndAmud(key, end),
  };
}

function expandMeilah(span: DafYomiMasechta): MasechtaDef[] {
  const volumeStart = span.first.current_daf.daf;
  const volumeEnd = span.last.current_daf.daf;
  const defs: MasechtaDef[] = [];
  let cursor = volumeStart;
  for (const part of MEILAH_PARTS) {
    const start = part.key === "meilah" ? volumeStart : part.start;
    if (start !== cursor) throw new Error(`Me'ilah split leaves a gap before ${part.key}`);
    const face = faceOf(part.key);
    defs.push({
      key: part.key,
      name: part.key === "meilah" ? span.first.current_daf.masechta : part.name,
      shortName: face.shortName,
      hebrew: face.hebrew,
      seder: face.seder,
      start,
      end: part.end,
      endAmud: capturedEndAmud(part.key, part.end),
    });
    cursor = part.end + 1;
  }
  if (cursor !== volumeEnd + 1) {
    throw new Error(`Me'ilah split ends at daf ${cursor - 1}; the API volume ends at ${volumeEnd}`);
  }
  return defs;
}

function cycleLength(): number {
  const start = DAF_YOMI_MASECHTOS[0]?.first.date;
  const next = DAF_YOMI_MASECHTOS[DAF_YOMI_MASECHTOS.length - 1]?.last.next_masechta.starts;
  if (!start || !next) throw new Error("Captured Daf Yomi cycle is empty");
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [nextYear, nextMonth, nextDay] = next.split("-").map(Number);
  return Math.round((Date.UTC(nextYear, nextMonth - 1, nextDay) - Date.UTC(startYear, startMonth - 1, startDay)) / 86_400_000);
}

const MASECHTA_DEFS: MasechtaDef[] = DAF_YOMI_MASECHTOS.flatMap((span) =>
  span.first.current_daf.key === "meilah" ? expandMeilah(span) : [defFromSpan(span)],
);

function buildShas(): { dapim: Daf[]; masechtos: Masechta[]; lookup: Map<string, Map<number, Daf>> } {
  const dapim: Daf[] = [];
  const lookup = new Map<string, Map<number, Daf>>();

  const masechtos = MASECHTA_DEFS.map((def) => {
    const start = def.start ?? 2;
    const firstIndex = dapim.length;
    const byDaf = new Map<number, Daf>();

    for (let daf = start; daf <= def.end; daf += 1) {
      const entry = {
        index: dapim.length,
        key: def.key,
        pdfKey: def.pdfKey ?? def.key,
        name: def.name,
        shortName: def.shortName,
        hebrew: def.hebrew,
        seder: def.seder,
        color: SEDER_COLOR[def.seder] ?? "#1c1612",
        daf,
        endAmud: daf === def.end ? def.endAmud : "b",
        note: NOTES[`${def.key}:${daf}`] ?? null,
      };
      dapim.push(entry);
      byDaf.set(daf, entry);
    }

    lookup.set(def.key, byDaf);
    return {
      ...def,
      start,
      color: SEDER_COLOR[def.seder] ?? "#1c1612",
      firstIndex,
      count: def.end - start + 1,
    };
  });

  if (dapim.length !== cycleLength()) {
    throw new Error(`Captured cycle is ${cycleLength()} days, but the catalog has ${dapim.length} dapim`);
  }
  for (const def of MASECHTA_DEFS) {
    if (!PDF_MASECHTA_LIST.available_masechtot.includes(def.key)) {
      throw new Error(`${def.key} is missing from the captured masechta list`);
    }
  }

  return { dapim, masechtos, lookup };
}

const built = buildShas();

export const DAPIM = built.dapim;
export const MASECHTOS = built.masechtos;
export const TOTAL = DAPIM.length;

const VOLUME_KEYS = ["meilah", "kinim", "tamid", "middos"];

export function findDaf(key: string, dafNumber: number): Daf | null {
  const direct = built.lookup.get(key)?.get(dafNumber);
  if (direct) return direct;
  if (key === "meilah") {
    for (const alt of VOLUME_KEYS) {
      const hit = built.lookup.get(alt)?.get(dafNumber);
      if (hit) return hit;
    }
  }
  return null;
}

export function masechtaByKey(key: string): Masechta | null {
  return MASECHTOS.find((masechta) => masechta.key === key) ?? null;
}

export const AMUDIM: Amud[] = DAPIM.flatMap((daf) => {
  const sides: AmudSide[] = daf.endAmud === "a" ? ["a"] : ["a", "b"];
  return sides.map((amud) => ({ ...daf, amud }));
}).map((entry, amudIndex) => ({ ...entry, amudIndex }));

export const AMUD_TOTAL = AMUDIM.length;

export function pdfUrl(daf: Pick<Daf, "pdfKey" | "daf">, amud: AmudSide = "a"): string {
  const params = new URLSearchParams({
    masechta: daf.pdfKey,
    daf: String(daf.daf),
    amud,
  });
  return `https://www.shas.org/daf-pdf/api/?${params.toString()}`;
}

export function findAmud(key: string, dafNumber: number, amud: AmudSide = "a"): Amud | null {
  const daf = findDaf(key, dafNumber);
  if (!daf) return null;
  const side = amud === "b" && daf.endAmud !== "a" ? "b" : "a";
  return AMUDIM.find((entry) => entry.index === daf.index && entry.amud === side) ?? null;
}

export function resolvePlace(place: Place | null): Amud | null {
  if (!place || isCompletePlace(place)) return null;
  return findAmud(place.key, place.daf, place.amud ?? "a");
}

export function isLastAmud(amudIndex: number): boolean {
  const current = AMUDIM[amudIndex];
  const next = AMUDIM[amudIndex + 1];
  return Boolean(current) && (!next || next.key !== current.key);
}
