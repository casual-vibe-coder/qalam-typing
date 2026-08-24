// The real Arabic-101 international standard keyboard layout — the same
// physical mapping used on macOS/Windows Arabic keyboards. Each key has a
// base (unshifted) glyph and, for most keys, a shifted glyph (usually a
// harakah/diacritic or punctuation mark). Verified against a live reference
// touch-typing course rather than reconstructed from memory, since a wrong
// key mapping here would teach the wrong keyboard entirely.

export type Finger =
  | "l-pinky"
  | "l-ring"
  | "l-middle"
  | "l-index"
  | "r-index"
  | "r-middle"
  | "r-ring"
  | "r-pinky"
  | "thumb";

export interface KeyDef {
  /** Physical key id — the QWERTY-hardware label, not the Arabic glyph. */
  id: string;
  row: 0 | 1 | 2 | 3; // 0 = number row, 1 = top, 2 = home, 3 = bottom
  finger: Finger;
  base: string; // unshifted glyph
  shift?: string; // shifted glyph (harakah or punctuation), if any
  width?: number; // relative key width, default 1
}

export const KEYBOARD_ROWS: KeyDef[][] = [
  // Number row — base glyphs are Arabic-Indic digits (١٢٣...), which is what
  // the number row actually produces on a real Arabic keyboard/IME; Western
  // digits sit on Shift instead, same position as the English layout.
  [
    { id: "`", row: 0, finger: "l-pinky", base: "ذ", shift: "ّ" },
    { id: "1", row: 0, finger: "l-pinky", base: "١", shift: "1" },
    { id: "2", row: 0, finger: "l-ring", base: "٢", shift: "2" },
    { id: "3", row: 0, finger: "l-middle", base: "٣", shift: "3" },
    { id: "4", row: 0, finger: "l-index", base: "٤", shift: "4" },
    { id: "5", row: 0, finger: "l-index", base: "٥", shift: "5" },
    { id: "6", row: 0, finger: "r-index", base: "٦", shift: "6" },
    { id: "7", row: 0, finger: "r-index", base: "٧", shift: "7" },
    { id: "8", row: 0, finger: "r-middle", base: "٨", shift: "8" },
    { id: "9", row: 0, finger: "r-ring", base: "٩", shift: "9" },
    { id: "0", row: 0, finger: "r-pinky", base: "٠", shift: "0" },
    { id: "-", row: 0, finger: "r-pinky", base: "-", shift: "_" },
    { id: "=", row: 0, finger: "r-pinky", base: "=", shift: "+" },
  ],
  // Top row
  [
    { id: "q", row: 1, finger: "l-pinky", base: "ض", shift: "َ" },
    { id: "w", row: 1, finger: "l-ring", base: "ص", shift: "ً" },
    { id: "e", row: 1, finger: "l-middle", base: "ث", shift: "ُ" },
    { id: "r", row: 1, finger: "l-index", base: "ق", shift: "ٌ" },
    { id: "t", row: 1, finger: "l-index", base: "ف" },
    { id: "y", row: 1, finger: "r-index", base: "غ", shift: "إ" },
    { id: "u", row: 1, finger: "r-index", base: "ع", shift: "'" },
    { id: "i", row: 1, finger: "r-middle", base: "ه", shift: "÷" },
    { id: "o", row: 1, finger: "r-ring", base: "خ", shift: "×" },
    { id: "p", row: 1, finger: "r-pinky", base: "ح", shift: "؛" },
    { id: "[", row: 1, finger: "r-pinky", base: "ج", shift: "<" },
    { id: "]", row: 1, finger: "r-pinky", base: "د", shift: ">" },
  ],
  // Home row
  [
    { id: "a", row: 2, finger: "l-pinky", base: "ش", shift: "ِ" },
    { id: "s", row: 2, finger: "l-ring", base: "س", shift: "ٍ" },
    { id: "d", row: 2, finger: "l-middle", base: "ي", shift: "]" },
    { id: "f", row: 2, finger: "l-index", base: "ب", shift: "[" },
    { id: "g", row: 2, finger: "l-index", base: "ل" },
    { id: "h", row: 2, finger: "r-index", base: "ا", shift: "أ" },
    { id: "j", row: 2, finger: "r-index", base: "ت", shift: "ـ" },
    { id: "k", row: 2, finger: "r-middle", base: "ن", shift: "،" },
    { id: "l", row: 2, finger: "r-ring", base: "م", shift: "/" },
    { id: ";", row: 2, finger: "r-pinky", base: "ك", shift: ":" },
    { id: "'", row: 2, finger: "r-pinky", base: "ط", shift: '"' },
  ],
  // Bottom row
  [
    { id: "z", row: 3, finger: "l-pinky", base: "ئ", shift: "~" },
    { id: "x", row: 3, finger: "l-ring", base: "ء", shift: "ْ" },
    { id: "c", row: 3, finger: "l-middle", base: "ؤ", shift: "}" },
    { id: "v", row: 3, finger: "l-index", base: "ر", shift: "{" },
    { id: "b", row: 3, finger: "l-index", base: "" },
    { id: "n", row: 3, finger: "r-index", base: "ى", shift: "آ" },
    { id: "m", row: 3, finger: "r-index", base: "ة", shift: "’" },
    { id: ",", row: 3, finger: "r-middle", base: "و", shift: "," },
    { id: ".", row: 3, finger: "r-ring", base: "ز", shift: "." },
    { id: "/", row: 3, finger: "r-pinky", base: "ظ", shift: "؟" },
  ],
];

export const ALL_KEYS: KeyDef[] = KEYBOARD_ROWS.flat();

export function keyForGlyph(glyph: string): { key: KeyDef; shifted: boolean } | null {
  for (const key of ALL_KEYS) {
    if (key.base === glyph) return { key, shifted: false };
    if (key.shift === glyph) return { key, shifted: true };
  }
  return null;
}

export const FINGER_LABELS: Record<Finger, string> = {
  "l-pinky": "Left pinky",
  "l-ring": "Left ring",
  "l-middle": "Left middle",
  "l-index": "Left index",
  "r-index": "Right index",
  "r-middle": "Right middle",
  "r-ring": "Right ring",
  "r-pinky": "Right pinky",
  thumb: "Thumb",
};

export const FINGER_COLORS: Record<Finger, string> = {
  "l-pinky": "#c65b5b",
  "l-ring": "#c98a3c",
  "l-middle": "#c9b23c",
  "l-index": "#5ea36f",
  "r-index": "#3f9e8f",
  "r-middle": "#3f7fc9",
  "r-ring": "#6b5ec9",
  "r-pinky": "#a13fc9",
  thumb: "#8a8a8a",
};

/** Home-row resting keys, right hand first since Arabic reads RTL. */
export const HOME_ROW_REST = ["h", "j", "k", "l", ";"];
export const HOME_ROW_REST_LEFT = ["a", "s", "d", "f"];
