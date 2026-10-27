import { WEEKDAYS, hebrewNumeral } from "./plan.ts";

const HEBREW_WEEKDAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const HEBREW_WEEKDAY_NAMES = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"];
const ENGLISH_WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const STRINGS = {
  en: {
    appTitle: "My Daf",
    personal: "Personal schedule",
    tagline: "Learn in order, at your pace. If you fall behind, click the daf you’re up to and the calendar rebuilds from today.",
    shasComplete: "Shas complete",
    left: "{amount} {word} left",
    settings: "Settings",
    language: "Language",
    languageEnglish: "English",
    languageHebrew: "עברית",
    languageHint: "English, with Hebrew for the masechta you’re learning.",
    order: "Masechta order",
    orderStandard: "Daf Yomi",
    orderCustom: "Custom",
    orderHint: "Drag a masechta, or use the arrows. The calendar continues from your current daf through whatever comes after it in this list.",
    layout: "Layout",
    layoutFull: "Full",
    layoutSimple: "Simple",
    layoutHint: "Simple starts at today’s card and leaves out each amud and its link.",
    dates: "Dates",
    datesGregorian: "Gregorian",
    datesJewish: "Jewish",
    datesHint: "Jewish dates follow the Hebrew calendar. The site language does not change this.",
    makeup: "To make up",
    makeupEmpty: "Nothing to make up. A study day counts as done after it ends, unless you mark it missed.",
    makeupHelp: "Missed days stay on this list. The calendar keeps going.",
    missToday: "I missed today",
    didToday: "I did today",
    missedThis: "I missed this",
    madeUp: "Made up",
    countedDone: "Counted as done. Mark it if you still owe it. Later days stay on the schedule.",
    onMakeup: "On your makeup list. The calendar did not move.",
    markedMissed: "{range} is saved to make up. The calendar stays on schedule.",
    markedMadeUp: "Taken off the makeup list.",
    nothingToMiss: "Nothing was scheduled that day.",
    legendMakeup: "To make up",
    resetOrder: "Reset to Daf Yomi",
    now: "Now",
    moveEarlier: "Move {name} earlier",
    moveLater: "Move {name} later",
    dapimCount: "{count} dapim",
    pace: "Pace",
    fewer: "Fewer dapim per day",
    more: "More dapim per day",
    halfADay: "half a daf a day",
    oneADay: "daf a day",
    manyADay: "dapim a day",
    preset: "{amount} {word} a day",
    studyDays: "Study days",
    addDay: "Add {day}",
    removeDay: "Remove {day}",
    siyum: "Siyum",
    studyDay: "study day",
    studyDaysWord: "study days",
    atTheEnd: "You’re at the end",
    nextMasechta: "Next masechta",
    lastMasechta: "This is the last masechta.",
    beginsToday: "{name} begins in today’s session.",
    beginsWhen: "{name} begins {when}.",
    closesWhen: "{name} closes the cycle {when}.",
    dafYomi: "Daf Yomi",
    listedAs: "(listed as {name})",
    level: "Level with today's Daf Yomi",
    ahead: "{amount} {word} ahead of Daf Yomi",
    behind: "{amount} {word} behind Daf Yomi",
    customCompare: "The Daf Yomi comparison stays hidden while the masechta order is custom.",
    setOfficial: "Set my place to today’s Daf Yomi",
    calendar: "Calendar",
    calendarView: "Calendar view",
    today: "Today",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    prevYear: "Previous year",
    nextYear: "Next year",
    viewMonth: "Month",
    viewYear: "Year",
    viewList: "List",
    moreGroups: "+{count} more",
    hashas: "HaShas",
    legendOff: "Off days follow the study-day toggles.",
    selectedDay: "Selected day",
    pastDay: "This day has passed. The plan keeps no history — click the daf you’re up to and it rebuilds from today.",
    clickAmudToday: "Click an amud if you’re only partway through. That side becomes today’s starting point.",
    clickAmudLater: "Click an amud to say you’re up to it. Today’s session moves there, and every later day follows.",
    setAsNext: "set as next",
    loggedToday: "You already logged today’s session. The next dapim are on the following study day.",
    dayOff: "{day} is off. Turn the day on above if you want to learn then.",
    nothingScheduled: "Nothing is scheduled. You’ll have finished Shas before this date.",
    emptyYear: "Nothing is scheduled in this year.",
    where: "Where I’m up to",
    clickNext: "Click the next daf",
    pickerHelp: "Click a daf to start at amud aleph. On a day in the calendar, click one side if you’re in the middle of a page.",
    notYet: "Not yet",
    finished: "Finished",
    doneOf: "{done} of {total} done",
    done: "Done",
    nextDaf: "Next daf",
    thisSession: "This session",
    footerBefore: "Today’s cycle comes from the",
    footerBetween: ". Scanned dapim open through the",
    footerAfter: ", courtesy of Shas.org, HebrewBooks.org, and Moznaim. Your place stays in this browser.",
    apiName: "Shas.org Daf Yomi API",
    pdfName: "Daf PDF API",
    startOver: "Start over from {name}",
    startAgain: "Start again from {name}",
    siyumHashas: "Siyum HaShas",
    congrats: "מזל טוב",
    finishedAll: "You finished all {count} dapim",
    endingWith: ", ending with {range}",
    nothingLeft: "Nothing left on the calendar",
    todayKicker: "Today · {date}",
    nextKicker: "Next session · {date}",
    finishedRange: "You finished {range}.",
    alreadyLogged: "You already logged today.",
    todayOff: "Today is off.",
    finishButton: "I finished today’s {amount} {word}",
    studyMore: "Study another session today",
    scanHint: "א and ב open the scanned daf.",
    setAmud: "Set next amud to {name}",
    setDaf: "Set next daf to {name}",
    openDaf: "Open {name}",
    noticeNextToday: "Next up is {label}. The calendar starts there today.",
    noticeNextLater: "Next up is {label}. Your next study day picks it up.",
    loggedNext: "Logged. Next up is {label}.",
    loggedDone: "Logged. You finished Shas.",
    sessionBack: "Today's session is back on the calendar.",
    restored: "Restored your previous place.",
    keepOneDay: "Leave at least one study day on.",
    undo: "Undo",
    loading: "Checking today's Daf Yomi…",
    saving: "Saving a starting place…",
    wordDaf: "daf",
    wordDapim: "dapim",
  },
  he: {
    appTitle: "הדף שלי",
    personal: "סדר לימוד",
    tagline: "לומדים לפי הסדר, בקצב שלך. אם נשארת מאחור, לוחצים על הדף שהגעת אליו והלוח נבנה מחדש מהיום.",
    shasComplete: "סיימת את הש״ס",
    left: "נשארו {amount} {word}",
    settings: "הגדרות",
    language: "שפה",
    languageEnglish: "English",
    languageHebrew: "עברית",
    languageHint: "עברית לכל הממשק. מספרי הדפים באותיות.",
    order: "סדר המסכתות",
    orderStandard: "דף יומי",
    orderCustom: "סדר שלי",
    orderHint: "גוררים מסכת, או לוחצים על החצים. הלוח ממשיך מהדף הנוכחי אל מה שבא אחריו ברשימה.",
    layout: "תצוגה",
    layoutFull: "מלאה",
    layoutSimple: "מקוצרת",
    layoutHint: "התצוגה המקוצרת מתחילה בכרטיס של היום, בלי כל עמוד והקישור שלו.",
    dates: "תאריכים",
    datesGregorian: "לועזי",
    datesJewish: "עברי",
    datesHint: "תאריך עברי הוא לפי הלוח העברי, בלי קשר לשפת האתר.",
    makeup: "להשלמה",
    makeupEmpty: "אין מה להשלים. יום לימוד נחשב גמור אחרי שהוא עובר, אלא אם מסמנים שהוא חסר.",
    makeupHelp: "ימים שהחסרת נשארים ברשימה. הלוח ממשיך כרגיל.",
    missToday: "החסרתי היום",
    didToday: "למדתי היום",
    missedThis: "החסרתי את זה",
    madeUp: "הושלם",
    countedDone: "נחשב כגמור. אפשר לסמן אם עוד חייבים אותו. הימים הבאים נשארים במקום.",
    onMakeup: "ברשימת ההשלמה. הלוח לא זז.",
    markedMissed: "{range} נשמר להשלמה. הלוח נשאר לפי הסדר.",
    markedMadeUp: "ירד מרשימת ההשלמה.",
    nothingToMiss: "לא היה לימוד ביום הזה.",
    legendMakeup: "להשלמה",
    resetOrder: "חזרה לסדר הדף היומי",
    now: "עכשיו",
    moveEarlier: "הקדם את {name}",
    moveLater: "אחר את {name}",
    dapimCount: "{count} דפים",
    pace: "קצב",
    fewer: "פחות דפים ביום",
    more: "יותר דפים ביום",
    halfADay: "חצי דף ביום",
    oneADay: "דף ביום",
    manyADay: "דפים ביום",
    preset: "{amount} {word} ביום",
    studyDays: "ימי לימוד",
    addDay: "הוספת {day}",
    removeDay: "הסרת {day}",
    siyum: "סיום",
    studyDay: "יום לימוד",
    studyDaysWord: "ימי לימוד",
    atTheEnd: "הגעת לסוף",
    nextMasechta: "המסכת הבאה",
    lastMasechta: "זו המסכת האחרונה.",
    beginsToday: "{name} מתחילה בלימוד של היום.",
    beginsWhen: "{name} מתחילה ב{when}.",
    closesWhen: "{name} מסיימת את המחזור ב{when}.",
    dafYomi: "דף יומי",
    listedAs: "(מופיע כ{name})",
    level: "באותו מקום כמו הדף היומי",
    ahead: "{amount} {word} לפני הדף היומי",
    behind: "{amount} {word} אחרי הדף היומי",
    customCompare: "ההשוואה לדף היומי מוסתרת כשסדר המסכתות אישי.",
    setOfficial: "קבע את המקום לדף היומי של היום",
    calendar: "לוח",
    calendarView: "תצוגת לוח",
    today: "היום",
    prevMonth: "החודש הקודם",
    nextMonth: "החודש הבא",
    prevYear: "השנה הקודמת",
    nextYear: "השנה הבאה",
    viewMonth: "חודש",
    viewYear: "שנה",
    viewList: "רשימה",
    moreGroups: "+{count}",
    hashas: "הש״ס",
    legendOff: "ימים כבויים לפי ימי הלימוד.",
    selectedDay: "היום שנבחר",
    pastDay: "היום הזה כבר עבר. הלוח לא שומר היסטוריה — לוחצים על הדף שהגעת אליו והוא נבנה מחדש מהיום.",
    clickAmudToday: "לוחצים על עמוד אם עוד לא סיימת. העמוד הזה נהיה נקודת ההתחלה של היום.",
    clickAmudLater: "לוחצים על עמוד כדי לסמן שהגעת אליו. הלימוד של היום עובר לשם, וכל הימים שאחריו בעקבותיו.",
    setAsNext: "קבע כהבא",
    loggedToday: "כבר סימנת את הלימוד של היום. הדפים הבאים ביום הלימוד הבא.",
    dayOff: "{day} כבוי. מדליקים אותו למעלה אם רוצים ללמוד בו.",
    nothingScheduled: "אין כאן לימוד. הש״ס כבר ייגמר לפני התאריך הזה.",
    emptyYear: "אין לימוד בשנה הזאת.",
    where: "איפה אני עומד",
    clickNext: "לוחצים על הדף הבא",
    pickerHelp: "לוחצים על דף כדי להתחיל בעמוד א. ביום בלוח לוחצים על צד אחד אם נמצאים באמצע הדף.",
    notYet: "עוד לא",
    finished: "הסתיים",
    doneOf: "{done} מתוך {total}",
    done: "נלמד",
    nextDaf: "הדף הבא",
    thisSession: "הלימוד הזה",
    footerBefore: "המחזור של היום מגיע מ",
    footerBetween: ". הדפים הסרוקים נפתחים דרך",
    footerAfter: ", באדיבות Shas.org, HebrewBooks.org ו-Moznaim. המקום שלך נשמר בדפדפן הזה.",
    apiName: "Shas.org Daf Yomi API",
    pdfName: "Daf PDF API",
    startOver: "התחלה מ{name}",
    startAgain: "להתחיל שוב מ{name}",
    siyumHashas: "סיום הש״ס",
    congrats: "מזל טוב",
    finishedAll: "סיימת את כל {count} הדפים",
    endingWith: ", וסיום ב{range}",
    nothingLeft: "לא נשאר כלום בלוח",
    todayKicker: "היום · {date}",
    nextKicker: "הלימוד הבא · {date}",
    finishedRange: "סיימת את {range}.",
    alreadyLogged: "כבר סימנת את היום.",
    todayOff: "היום לא לומדים.",
    finishButton: "סיימתי היום {amount} {word}",
    studyMore: "עוד לימוד היום",
    scanHint: "א ו-ב פותחים את הדף הסרוק.",
    setAmud: "קבע את העמוד הבא ל{name}",
    setDaf: "קבע את הדף הבא ל{name}",
    openDaf: "פתיחת {name}",
    noticeNextToday: "הבא בתור הוא {label}. הלוח מתחיל שם היום.",
    noticeNextLater: "הבא בתור הוא {label}. יום הלימוד הבא מתחיל שם.",
    loggedNext: "נרשם. הבא בתור הוא {label}.",
    loggedDone: "נרשם. סיימת את הש״ס.",
    sessionBack: "הלימוד של היום חזר ללוח.",
    restored: "המקום הקודם שוחזר.",
    keepOneDay: "צריך להשאיר לפחות יום לימוד אחד.",
    undo: "ביטול",
    loading: "בודק את הדף היומי של היום…",
    saving: "שומר מקום התחלה…",
    wordDaf: "דף",
    wordDapim: "דפים",
  },
};

function ordinal(number: number): string {
  const mod100 = number % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${number}th`;
  switch (number % 10) {
    case 1:
      return `${number}st`;
    case 2:
      return `${number}nd`;
    case 3:
      return `${number}rd`;
    default:
      return `${number}th`;
  }
}

type Messages = typeof STRINGS.en;

function fill(template: string, vars?: Record<string, string | number>): string {
  let text = template;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export function makeI18n(language: string) {
  const lang = language === "he" ? "he" : "en";
  const dict: Messages = STRINGS[lang];
  return {
    lang,
    dir: lang === "he" ? "rtl" : "ltr",
    locale: lang === "he" ? "he-IL" : "en-US",
    weekdays: lang === "he" ? HEBREW_WEEKDAYS : WEEKDAYS,
    weekdayName(day: number) {
      const names = lang === "he" ? HEBREW_WEEKDAY_NAMES : ENGLISH_WEEKDAY_NAMES;
      return names[day] ?? "";
    },
    t(key: keyof Messages, vars?: Record<string, string | number>) {
      return fill(dict[key] ?? STRINGS.en[key], vars);
    },
    name(entity: { name: string; hebrew: string } | null | undefined) {
      if (!entity) return "";
      return lang === "he" ? entity.hebrew : entity.name;
    },
    short(entity: { shortName: string; hebrew: string } | null | undefined) {
      if (!entity) return "";
      return lang === "he" ? entity.hebrew : entity.shortName;
    },
    note(entity: { note?: string | { en?: string; he?: string } | null } | null | undefined) {
      if (!entity?.note) return null;
      if (typeof entity.note === "string") return entity.note;
      return entity.note[lang] ?? entity.note.en ?? null;
    },
    amud(letter: string) {
      if (lang !== "he") return letter;
      return letter === "a" ? "א" : "ב";
    },
    dafNumber(value: number) {
      return lang === "he" ? hebrewNumeral(value) : String(value);
    },
    dafWord(count: number) {
      const amount = Math.round(Number(count) * 2) / 2;
      return amount === 0.5 || amount === 1 ? dict.wordDaf : dict.wordDapim;
    },
    paceCaption(pace: number) {
      if (pace === 0.5) return dict.halfADay;
      if (pace === 1) return dict.oneADay;
      return dict.manyADay;
    },
    cycle(number: number) {
      return lang === "he" ? `מחזור ${number}` : `${ordinal(number)} cycle`;
    },
    label(unit: { name: string; hebrew: string; daf: number; amud: string }) {
      const number = lang === "he" ? hebrewNumeral(unit.daf) : String(unit.daf);
      const side = lang === "he" ? (unit.amud === "a" ? "א" : "ב") : unit.amud;
      return `${lang === "he" ? unit.hebrew : unit.name} ${number}${lang === "he" ? " " : ""}${side}`;
    },
    groupOptions: { hebrew: lang === "he" },
  };
}

export type I18n = ReturnType<typeof makeI18n>;
