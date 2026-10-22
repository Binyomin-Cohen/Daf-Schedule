/**
 * Masechta order and daf ranges follow the Shas.org Daf Yomi and PDF APIs.
 * Dapim are counted the way Daf Yomi counts them: daf 2 through the last
 * printed daf, including a final amud aleph. Me'ilah, Kinim, Tamid, and
 * Middos share one printed volume (daf 2–37); the Daf Yomi API calls that
 * whole stretch Me'ilah.
 * https://www.shas.org/daf-yomi-api/api-documentation.html
 * https://www.shas.org/daf-pdf/api/api-documentation.html
 */

export const SEDERS = [
  { id: "Zeraim", hebrew: "זרעים", color: "#5f6e32" },
  { id: "Moed", hebrew: "מועד", color: "#7d2432" },
  { id: "Nashim", hebrew: "נשים", color: "#2f4578" },
  { id: "Nezikin", hebrew: "נזיקין", color: "#8a5428" },
  { id: "Kodashim", hebrew: "קדשים", color: "#1e463f" },
  { id: "Taharos", hebrew: "טהרות", color: "#56486e" },
];

const SEDER_COLOR = Object.fromEntries(SEDERS.map((seder) => [seder.id, seder.color]));

const NOTES = {
  "meilah:22": {
    en: "22a finishes Me'ilah. 22b is the opening of Kinim.",
    he: "כב ע״א מסיים את מעילה. כב ע״ב הוא תחילת קינים.",
  },
  "kinim:25": {
    en: "25a finishes Kinim. 25b is the opening of Tamid.",
    he: "כה ע״א מסיים את קינים. כה ע״ב הוא תחילת תמיד.",
  },
};

/** @type {Array<{key: string, name: string, shortName: string, hebrew: string, seder: string, end: number, endAmud: "a" | "b", start?: number, pdfKey?: string}>} */
const MASECHTA_DEFS = [
  { key: "berachos", name: "Berachos", shortName: "Berachos", hebrew: "ברכות", seder: "Zeraim", end: 64, endAmud: "a" },
  { key: "shabbos", name: "Shabbos", shortName: "Shabbos", hebrew: "שבת", seder: "Moed", end: 157, endAmud: "b" },
  { key: "eruvin", name: "Eruvin", shortName: "Eruvin", hebrew: "עירובין", seder: "Moed", end: 105, endAmud: "a" },
  { key: "pesachim", name: "Pesachim", shortName: "Pesachim", hebrew: "פסחים", seder: "Moed", end: 121, endAmud: "b" },
  { key: "shekalim", name: "Shekalim", shortName: "Shekalim", hebrew: "שקלים", seder: "Moed", end: 22, endAmud: "b" },
  { key: "yoma", name: "Yoma", shortName: "Yoma", hebrew: "יומא", seder: "Moed", end: 88, endAmud: "a" },
  { key: "sukkah", name: "Sukkah", shortName: "Sukkah", hebrew: "סוכה", seder: "Moed", end: 56, endAmud: "b" },
  { key: "beitzah", name: "Beitzah", shortName: "Beitzah", hebrew: "ביצה", seder: "Moed", end: 40, endAmud: "b" },
  { key: "rosh-hashanah", name: "Rosh Hashanah", shortName: "Rosh Hash.", hebrew: "ראש השנה", seder: "Moed", end: 35, endAmud: "a" },
  { key: "taanis", name: "Ta'anis", shortName: "Ta'anis", hebrew: "תענית", seder: "Moed", end: 31, endAmud: "a" },
  { key: "megillah", name: "Megillah", shortName: "Megillah", hebrew: "מגילה", seder: "Moed", end: 32, endAmud: "a" },
  { key: "moed-katan", name: "Moed Katan", shortName: "Moed Katan", hebrew: "מועד קטן", seder: "Moed", end: 29, endAmud: "a" },
  { key: "chagigah", name: "Chagigah", shortName: "Chagigah", hebrew: "חגיגה", seder: "Moed", end: 27, endAmud: "a" },
  { key: "yevamos", name: "Yevamos", shortName: "Yevamos", hebrew: "יבמות", seder: "Nashim", end: 122, endAmud: "a" },
  { key: "kesubos", name: "Kesubos", shortName: "Kesubos", hebrew: "כתובות", seder: "Nashim", end: 112, endAmud: "b" },
  { key: "nedarim", name: "Nedarim", shortName: "Nedarim", hebrew: "נדרים", seder: "Nashim", end: 91, endAmud: "b" },
  { key: "nazir", name: "Nazir", shortName: "Nazir", hebrew: "נזיר", seder: "Nashim", end: 66, endAmud: "b" },
  { key: "sotah", name: "Sotah", shortName: "Sotah", hebrew: "סוטה", seder: "Nashim", end: 49, endAmud: "b" },
  { key: "gittin", name: "Gittin", shortName: "Gittin", hebrew: "גיטין", seder: "Nashim", end: 90, endAmud: "b" },
  { key: "kiddushin", name: "Kiddushin", shortName: "Kiddushin", hebrew: "קידושין", seder: "Nashim", end: 82, endAmud: "b" },
  { key: "bava-kamma", name: "Bava Kamma", shortName: "B. Kamma", hebrew: "בבא קמא", seder: "Nezikin", end: 119, endAmud: "b" },
  { key: "bava-metzia", name: "Bava Metzia", shortName: "B. Metzia", hebrew: "בבא מציעא", seder: "Nezikin", end: 119, endAmud: "a" },
  { key: "bava-basra", name: "Bava Basra", shortName: "B. Basra", hebrew: "בבא בתרא", seder: "Nezikin", end: 176, endAmud: "b" },
  { key: "sanhedrin", name: "Sanhedrin", shortName: "Sanhedrin", hebrew: "סנהדרין", seder: "Nezikin", end: 113, endAmud: "b" },
  { key: "makkos", name: "Makkos", shortName: "Makkos", hebrew: "מכות", seder: "Nezikin", end: 24, endAmud: "b" },
  { key: "shevuos", name: "Shevuos", shortName: "Shevuos", hebrew: "שבועות", seder: "Nezikin", end: 49, endAmud: "b" },
  { key: "avodah-zarah", name: "Avodah Zarah", shortName: "A. Zarah", hebrew: "עבודה זרה", seder: "Nezikin", end: 76, endAmud: "b" },
  { key: "horayos", name: "Horayos", shortName: "Horayos", hebrew: "הוריות", seder: "Nezikin", end: 14, endAmud: "a" },
  { key: "zevachim", name: "Zevachim", shortName: "Zevachim", hebrew: "זבחים", seder: "Kodashim", end: 120, endAmud: "b" },
  { key: "menachos", name: "Menachos", shortName: "Menachos", hebrew: "מנחות", seder: "Kodashim", end: 110, endAmud: "a" },
  { key: "chullin", name: "Chullin", shortName: "Chullin", hebrew: "חולין", seder: "Kodashim", end: 142, endAmud: "a" },
  { key: "bechoros", name: "Bechoros", shortName: "Bechoros", hebrew: "בכורות", seder: "Kodashim", end: 61, endAmud: "a" },
  { key: "arachin", name: "Arachin", shortName: "Arachin", hebrew: "ערכין", seder: "Kodashim", end: 34, endAmud: "a" },
  { key: "temurah", name: "Temurah", shortName: "Temurah", hebrew: "תמורה", seder: "Kodashim", end: 34, endAmud: "a" },
  { key: "kereisos", name: "Kereisos", shortName: "Kereisos", hebrew: "כריתות", seder: "Kodashim", end: 28, endAmud: "b" },
  { key: "meilah", name: "Me'ilah", shortName: "Me'ilah", hebrew: "מעילה", seder: "Kodashim", end: 22, endAmud: "b" },
  { key: "kinim", name: "Kinim", shortName: "Kinim", hebrew: "קינים", seder: "Kodashim", start: 23, end: 25, endAmud: "b", pdfKey: "kinim" },
  { key: "tamid", name: "Tamid", shortName: "Tamid", hebrew: "תמיד", seder: "Kodashim", start: 26, end: 33, endAmud: "b", pdfKey: "tamid" },
  { key: "middos", name: "Middos", shortName: "Middos", hebrew: "מידות", seder: "Kodashim", start: 34, end: 37, endAmud: "b", pdfKey: "middos" },
  { key: "niddah", name: "Niddah", shortName: "Niddah", hebrew: "נדה", seder: "Taharos", end: 73, endAmud: "a" },
];

function buildShas() {
  const dapim = [];
  const lookup = new Map();

  const masechtos = MASECHTA_DEFS.map((def) => {
    const start = def.start ?? 2;
    const firstIndex = dapim.length;
    const byDaf = new Map();

    for (let daf = start; daf <= def.end; daf += 1) {
      const entry = {
        index: dapim.length,
        key: def.key,
        pdfKey: def.pdfKey ?? def.key,
        name: def.name,
        shortName: def.shortName,
        hebrew: def.hebrew,
        seder: def.seder,
        color: SEDER_COLOR[def.seder],
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
      color: SEDER_COLOR[def.seder],
      firstIndex,
      count: def.end - start + 1,
    };
  });

  return { dapim, masechtos, lookup };
}

const built = buildShas();

export const DAPIM = built.dapim;
export const MASECHTOS = built.masechtos;
export const TOTAL = DAPIM.length;

const VOLUME_KEYS = ["meilah", "kinim", "tamid", "middos"];

export function findDaf(key, dafNumber) {
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

export function masechtaByKey(key) {
  return MASECHTOS.find((masechta) => masechta.key === key) ?? null;
}

export const AMUDIM = DAPIM.flatMap((daf) => {
  const sides = daf.endAmud === "a" ? ["a"] : ["a", "b"];
  return sides.map((amud) => ({ ...daf, amud }));
}).map((entry, amudIndex) => ({ ...entry, amudIndex }));

export const AMUD_TOTAL = AMUDIM.length;

export function pdfUrl(daf, amud = "a") {
  const params = new URLSearchParams({
    masechta: daf.pdfKey,
    daf: String(daf.daf),
    amud,
  });
  return `https://www.shas.org/daf-pdf/api/?${params.toString()}`;
}

export function findAmud(key, dafNumber, amud = "a") {
  const daf = findDaf(key, dafNumber);
  if (!daf) return null;
  const side = amud === "b" && daf.endAmud !== "a" ? "b" : "a";
  return AMUDIM.find((entry) => entry.index === daf.index && entry.amud === side) ?? null;
}

export function resolvePlace(place) {
  if (!place || place.complete) return null;
  return findAmud(place.key, place.daf, place.amud || "a");
}

export function isLastAmud(amudIndex) {
  const current = AMUDIM[amudIndex];
  const next = AMUDIM[amudIndex + 1];
  return Boolean(current) && (!next || next.key !== current.key);
}
