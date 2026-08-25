import { ALL_KEYS } from "../data/keyboard";
import type { GlyphIntro, Lesson } from "../data/curriculum";
import { WORD_BANK, type BankWord } from "../data/wordBank";
import { HADITHS } from "../data/hadiths";
import { isHarakah, isTypeableWith, shuffled } from "./arabic";

function glyphOf(intro: GlyphIntro): string {
  const key = ALL_KEYS.find((k) => k.id === intro.keyId);
  if (!key) return "";
  return intro.shift ? (key.shift ?? "") : key.base;
}

export interface Exercise {
  label: string;
  target: string;
}

// Every lesson now walks through 3 fixed levels of increasing length and
// complexity (per instructor feedback: lessons finished in one sitting
// where a comparable course took a week — these need real substance):
//   Level 1 — only the brand-new key(s), pure repetition.
//   Level 2 — the brand-new key(s), still dominant, mixed with review letters.
//   Level 3 — everything learned so far, unrestricted (real words / full mix).

/** Repeat token(s) out to at least `minTokens`, cycling if there aren't enough unique ones. */
function repeatTo(tokens: string[], minTokens: number): string[] {
  if (tokens.length === 0) return [];
  const out: string[] = [];
  for (let i = 0; i < minTokens; i++) out.push(tokens[i % tokens.length]);
  return out;
}

/** Level 1: pure repetition of only the brand-new key(s) — builds raw finger-position memory.
 * Kept shorter than the other levels on purpose: a single wrong keystroke buried in a long
 * run of one identical character is hard to spot and fix (see "Start over" in LessonScreen). */
function buildKeyDrill(newGlyphs: string[], seed: number): string {
  if (newGlyphs.length === 1) {
    return Array(28).fill(newGlyphs[0]).join(" ");
  }
  const [a, b] = newGlyphs;
  const blockA = Array(12).fill(a).join(" ");
  const blockB = Array(12).fill(b).join(" ");
  const alternating = repeatTo(shuffled([a, b], seed), 20).join(" ");
  return [blockA, blockB, alternating].join(" ");
}

/** Level 2: new key(s) still dominant, combined with review letters — plausible combos, not real words yet. */
function buildMixedDrill(newGlyphs: string[], learnedBefore: string[], seed: number, count = 36): string {
  const pool = learnedBefore.length > 0 ? shuffled(learnedBefore, seed).slice(0, 8) : newGlyphs;
  const combos: string[] = [];
  for (const g of newGlyphs) {
    for (const other of pool) {
      combos.push(g + other);
      combos.push(other + g);
    }
    combos.push(g + g);
    combos.push(g + g + g);
  }
  return repeatTo(shuffled(combos, seed + 3), count).join(" ");
}

/** Level 3: real words drawn from everything learned so far — a handful guaranteed to use the new key(s), the rest a free mix. */
function buildRealWordsExercise(
  newGlyphs: string[],
  learnedIncludingNew: Set<string>,
  seed: number,
  wordCount: number
): string {
  const eligible = WORD_BANK.filter((w) => isTypeableWith(w.ar, learnedIncludingNew));
  const fresh = eligible.filter((w) => [...w.ar].some((ch) => newGlyphs.includes(ch)));
  const guaranteedFresh = shuffled(fresh, seed + 7).slice(0, Math.min(6, fresh.length));
  const guaranteed = new Set(guaranteedFresh);
  const rest = shuffled(eligible, seed + 13).filter((w) => !guaranteed.has(w));
  const words = [...guaranteedFresh, ...rest].slice(0, wordCount);
  return words.map((w) => w.ar).join(" ");
}

/** Fallback for early lessons where the word bank has nothing typeable yet — a full review mix of every letter learned so far, not just the new one(s). */
function buildFullMixDrill(learnedIncludingNew: Set<string>, seed: number, count = 32): string {
  const letters = [...learnedIncludingNew];
  if (letters.length < 2) return letters.join(" ");
  const combos: string[] = [];
  for (let i = 0; i < letters.length; i++) {
    for (let j = 0; j < letters.length; j++) {
      if (i !== j) combos.push(letters[i] + letters[j]);
    }
  }
  return repeatTo(shuffled(combos, seed + 19), count).join(" ");
}

/** Tashkeel stage: same 3-level shape, but anchored on consonants learned so far instead of a fixed set. */
function buildTashkeelExercises(newGlyphs: string[], learnedBefore: Set<string>): Exercise[] {
  const learned = [...learnedBefore];
  const anchors = learned.filter((ch) => !isHarakah(ch));
  const learnedMarks = learned.filter(isHarakah);
  const anchorPool = anchors.length > 0 ? anchors : ["ب", "ك", "ن"]; // taught in lesson 1 — safe fallback

  const level1Combos = newGlyphs.flatMap((g) => anchorPool.map((a) => a + g));
  const level1 = repeatTo(shuffled(level1Combos, newGlyphs.length + 11), Math.max(28, level1Combos.length)).join(
    " "
  );

  const level2Combos = newGlyphs.flatMap((g) => anchorPool.map((a) => a + g + a));
  const level2 = repeatTo(shuffled(level2Combos, newGlyphs.length + 17), 32).join(" ");

  const allMarks = [...learnedMarks, ...newGlyphs];
  const level3Combos = allMarks.flatMap((g) => anchorPool.map((a) => a + g));
  const level3 = repeatTo(shuffled(level3Combos, newGlyphs.length + 29), 36).join(" ");

  return [
    { label: "Level 1 · New mark", target: level1 },
    { label: "Level 2 · Across anchors", target: level2 },
    { label: "Level 3 · Everything so far", target: level3 },
  ];
}

/** Numbers stage: target stays Western digits — that's what the number-row keys actually type
 * (see data/keyboard.ts). Arabic-Indic digits are shown for reading only, at display time in
 * TypingBox.tsx, so the on-screen target still visually matches Arabic-Indic without requiring
 * a keystroke no real keyboard in this layout can produce. */
function buildNumberExercises(): Exercise[] {
  const level1 = "0 1 2 3 4 5 6 7 8 9 9 8 7 6 5 4 3 2 1 0 0 1 2 3 4 5 6 7 8 9 1 3 5 7 9 0 2 4 6 8";
  const level2 = "10 20 30 40 50 60 70 80 90 100 12 34 56 78 90 21 43 65 87 09 15 60 11 22 33 44 55 66 77 88";
  const level3 = "2026 1445 10 500 1974 27 99 2025 1000 365 24 60 12 40 100 2030 7 300 1990 45 200 3 800 15 90";
  return [
    { label: "Level 1 · Digits", target: level1 },
    { label: "Level 2 · Two-digit numbers", target: level2 },
    { label: "Level 3 · Real numbers", target: level3 },
  ];
}

// Mastery stage: everything's been taught by now, so exercises switch to
// real, full-length vocalized Hadith text instead of constrained drills —
// each of the 3 mastery lessons pulls a different, deterministic slice of
// HADITHS, growing from one hadith to several concatenated together.
const MASTERY_SLICES: Record<string, number[][]> = {
  m1: [[0], [0, 1], [0, 1, 2]],
  m2: [[3], [3, 4], [3, 4, 5]],
  m3: [[6, 7], [6, 7, 8], [6, 7, 8, 9]],
};

function buildMasteryExercises(lessonId: string): Exercise[] {
  const slices = MASTERY_SLICES[lessonId] ?? [[0], [0, 1], [0, 1, 2]];
  const labels = ["Level 1 · One hadith", "Level 2 · Two hadiths", "Level 3 · Full passage"];
  return slices.map((indices, i) => ({
    label: labels[i] ?? `Level ${i + 1}`,
    target: indices.map((idx) => HADITHS[idx % HADITHS.length].ar).join("   "),
  }));
}

export function buildLessonExercises(
  lesson: Lesson,
  learnedIncludingNew: Set<string>,
  learnedBefore: Set<string>,
  wordCount = 30
): Exercise[] {
  const newGlyphs = lesson.newGlyphs.map(glyphOf).filter(Boolean);
  const seed = lesson.id.length + lesson.id.charCodeAt(0);

  if (lesson.stage === "mastery") return buildMasteryExercises(lesson.id);
  if (lesson.stage === "tashkeel") return buildTashkeelExercises(newGlyphs, learnedBefore);
  if (lesson.stage === "numbers") return buildNumberExercises();

  const wordsTarget = buildRealWordsExercise(newGlyphs, learnedIncludingNew, seed, wordCount);
  const level3Target = wordsTarget.trim().length > 0 ? wordsTarget : buildFullMixDrill(learnedIncludingNew, seed);

  return [
    { label: "Level 1 · New letters", target: buildKeyDrill(newGlyphs, seed) },
    { label: "Level 2 · Mostly new", target: buildMixedDrill(newGlyphs, [...learnedBefore], seed) },
    { label: "Level 3 · Everything so far", target: level3Target },
  ];
}

export function wordsUsedIn(lesson: Lesson, learned: Set<string>, wordCount = 12): BankWord[] {
  const newGlyphs = lesson.newGlyphs.map(glyphOf).filter(Boolean);
  const eligible = WORD_BANK.filter((w) => isTypeableWith(w.ar, learned));
  const fresh = eligible.filter((w) => [...w.ar].some((ch) => newGlyphs.includes(ch)));
  const review = eligible.filter((w) => !fresh.includes(w));
  return shuffled(fresh, lesson.id.length + 7)
    .concat(shuffled(review, lesson.id.length + 13))
    .slice(0, wordCount);
}
