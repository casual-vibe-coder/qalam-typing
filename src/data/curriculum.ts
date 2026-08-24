// Lesson progression. Keys are introduced by physical hand position
// (home row -> top row -> bottom row -> the odd dhal key -> hamza forms &
// harakat -> numbers) because that's how touch-typing muscle memory
// actually works — you build outward from the resting position, you don't
// jump around the keyboard by letter frequency. What DOES get tailored to
// frequency is the practice content: see wordBank.ts + lib/arabic.ts,
// which pick real high-frequency words out of only the letters taught so
// far, instead of arbitrary drill strings.
import { ALL_KEYS, type KeyDef } from "./keyboard";

export interface GlyphIntro {
  keyId: string;
  shift: boolean;
}

export interface Lesson {
  id: string;
  stage: "home" | "top" | "bottom" | "extra" | "tashkeel" | "numbers" | "mastery";
  title: string;
  subtitle: string;
  newGlyphs: GlyphIntro[];
}

function g(keyId: string, shift = false): GlyphIntro {
  return { keyId, shift };
}

export const LESSONS: Lesson[] = [
  // --- Home row ---
  { id: "h1", stage: "home", title: "Index fingers", subtitle: "ب ت", newGlyphs: [g("f"), g("j")] },
  { id: "h2", stage: "home", title: "Middle fingers", subtitle: "ي ن", newGlyphs: [g("d"), g("k")] },
  { id: "h3", stage: "home", title: "Ring fingers", subtitle: "س م", newGlyphs: [g("s"), g("l")] },
  { id: "h4", stage: "home", title: "Pinky fingers", subtitle: "ش ك", newGlyphs: [g("a"), g(";")] },
  { id: "h5", stage: "home", title: "Reaching in", subtitle: "ل ا", newGlyphs: [g("g"), g("h")] },
  { id: "h6", stage: "home", title: "Home row review", subtitle: "ط", newGlyphs: [g("'")] },

  // --- Top row ---
  { id: "t1", stage: "top", title: "Top row reach", subtitle: "ق ع", newGlyphs: [g("r"), g("u")] },
  { id: "t2", stage: "top", title: "Top row reach", subtitle: "ث ه", newGlyphs: [g("e"), g("i")] },
  { id: "t3", stage: "top", title: "Top row stretch", subtitle: "ص خ", newGlyphs: [g("w"), g("o")] },
  { id: "t4", stage: "top", title: "Top row stretch", subtitle: "ض ح", newGlyphs: [g("q"), g("p")] },
  { id: "t5", stage: "top", title: "Inner keys", subtitle: "ف غ", newGlyphs: [g("t"), g("y")] },
  { id: "t6", stage: "top", title: "Top row review", subtitle: "ج د", newGlyphs: [g("["), g("]")] },

  // --- Bottom row ---
  { id: "b1", stage: "bottom", title: "Bottom row reach", subtitle: "ر ى", newGlyphs: [g("v"), g("n")] },
  { id: "b2", stage: "bottom", title: "Bottom row reach", subtitle: "ؤ ة", newGlyphs: [g("c"), g("m")] },
  { id: "b3", stage: "bottom", title: "Bottom row stretch", subtitle: "ء و", newGlyphs: [g("x"), g(",")] },
  { id: "b4", stage: "bottom", title: "Bottom row stretch", subtitle: "ئ ز", newGlyphs: [g("z"), g(".")] },
  { id: "b5", stage: "bottom", title: "Bottom row review", subtitle: "ظ", newGlyphs: [g("/")] },

  // --- The odd one out ---
  { id: "x1", stage: "extra", title: "One more letter", subtitle: "ذ", newGlyphs: [g("`")] },

  // --- Hamza seats & harakat, needed for full vocalized text ---
  { id: "z1", stage: "tashkeel", title: "Hamza forms", subtitle: "أ إ آ", newGlyphs: [g("h", true), g("y", true), g("n", true)] },
  {
    id: "z2",
    stage: "tashkeel",
    title: "Harakat — short vowels",
    subtitle: "َ ُ ِ",
    newGlyphs: [g("q", true), g("e", true), g("a", true)],
  },
  {
    id: "z3",
    stage: "tashkeel",
    title: "Harakat — sukoon & shaddah",
    subtitle: "ْ ّ",
    newGlyphs: [g("x", true), g("`", true)],
  },
  {
    id: "z4",
    stage: "tashkeel",
    title: "Tanween & punctuation",
    subtitle: "ً ٌ ٍ",
    newGlyphs: [g("w", true), g("r", true), g("s", true), g("k", true), g("p", true), g("/", true)],
  },

  // --- Numbers ---
  {
    id: "n1",
    stage: "numbers",
    title: "Numbers",
    subtitle: "١٢٣ 0-9",
    newGlyphs: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].map((k) => g(k)),
  },

  // --- Mastery: everything's been taught — now type real, full-length
  // vocalized Hadith text (see lib/lessonContent.ts buildMasteryExercises,
  // data/hadiths.ts). No new keys introduced, so newGlyphs stays empty.
  { id: "m1", stage: "mastery", title: "Mastery I", subtitle: "أحاديث قصيرة", newGlyphs: [] },
  { id: "m2", stage: "mastery", title: "Mastery II", subtitle: "أحاديث متوسطة", newGlyphs: [] },
  { id: "m3", stage: "mastery", title: "Mastery III", subtitle: "أحاديث طويلة", newGlyphs: [] },
];

export function lessonIndex(id: string): number {
  return LESSONS.findIndex((l) => l.id === id);
}

/** All glyphs (letters + harakat) introduced by the end of lesson `uptoIndex` (inclusive). */
export function learnedGlyphs(uptoIndex: number): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i <= uptoIndex && i < LESSONS.length; i++) {
    for (const intro of LESSONS[i].newGlyphs) {
      const key = findKey(intro.keyId);
      if (!key) continue;
      const glyph = intro.shift ? key.shift : key.base;
      if (glyph) set.add(glyph);
    }
  }
  return set;
}

function findKey(id: string): KeyDef | undefined {
  return ALL_KEYS.find((k) => k.id === id);
}
