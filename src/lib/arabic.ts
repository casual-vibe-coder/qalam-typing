// Small utilities for deriving lesson content from raw Arabic text rather
// than hand-bucketing every word per lesson.

/** Arabic combining diacritics (harakat, shadda, sukoon, tanween). */
const HARAKAT = /[ً-ْٰ]/g;

export function stripHarakat(text: string): string {
  return text.replace(HARAKAT, "");
}

/** True for a single combining diacritic (harakah, shaddah, sukoon, tanween) — false for a base letter. */
export function isHarakah(ch: string): boolean {
  return /[ً-ْٰ]/.test(ch);
}

/** The set of distinct base letters (diacritics stripped) used in a string. */
export function lettersOf(text: string): Set<string> {
  const letters = new Set<string>();
  for (const ch of stripHarakat(text)) {
    if (ch === " ") continue;
    letters.add(ch);
  }
  return letters;
}

/** True if every letter in `text` is already in `learned`. */
export function isTypeableWith(text: string, learned: Set<string>): boolean {
  for (const ch of lettersOf(text)) {
    if (!learned.has(ch)) return false;
  }
  return true;
}

const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** Convert Western digits (0-9) in a string to Arabic-Indic digits (٠-٩), matching the number-row keys taught in the course. */
export function toArabicIndicDigits(text: string): string {
  return text.replace(/[0-9]/g, (d) => ARABIC_INDIC_DIGITS[Number(d)]);
}

/** Deterministic-ish shuffle for practice-item ordering (seeded by index, not Date/Math.random-only). */
export function shuffled<T>(items: T[], seed = 1): T[] {
  const arr = [...items];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
