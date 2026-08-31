import { useMemo, useRef, useState } from "react";
import { LESSONS, learnedGlyphs, lessonIndex } from "../data/curriculum";
import { buildLessonExercises } from "../lib/lessonContent";
import { useTypingSession, type TypingSessionResult } from "../hooks/useTypingSession";
import { TypingBox } from "../components/TypingBox";
import { VirtualKeyboard } from "../components/VirtualKeyboard";
import { FingerGuide } from "../components/FingerGuide";
import { StatsBar } from "../components/StatsBar";
import { LetterIntroCard } from "../components/LetterIntroCard";
import { LanguageWarningBanner } from "../components/LanguageWarningBanner";
import { ResultsPanel } from "../components/ResultsPanel";
import { starsFor } from "../lib/scoring";
import type { LessonResult } from "../hooks/useProgress";

interface Props {
  lessonId: string;
  startLevel?: number;
  levelsDone?: boolean[];
  onExit: () => void;
  onFinish: (lessonId: string, result: LessonResult, xp: number) => void;
  onLevelComplete: (lessonId: string, levelIndex: number) => void;
  onNeedKeyboardHelp: () => void;
}

function aggregate(results: TypingSessionResult[]): { wpm: number; accuracy: number } {
  const totalChars = results.reduce((s, r) => s + r.chars, 0);
  const totalErrors = results.reduce((s, r) => s + r.errors, 0);
  const totalMs = results.reduce((s, r) => s + r.elapsedMs, 0);
  const minutes = Math.max(totalMs / 60_000, 1 / 60);
  const wpm = Math.round(totalChars / 5 / minutes);
  const totalKeys = totalChars + totalErrors;
  const accuracy = totalKeys > 0 ? Math.round((totalChars / totalKeys) * 100) : 100;
  return { wpm, accuracy };
}

export function LessonScreen({
  lessonId,
  startLevel,
  levelsDone = [false, false, false],
  onExit,
  onFinish,
  onLevelComplete,
  onNeedKeyboardHelp,
}: Props) {
  const idx = lessonIndex(lessonId);
  const lesson = LESSONS[idx];
  const learned = useMemo(() => learnedGlyphs(idx), [idx]);
  const learnedBefore = useMemo(() => learnedGlyphs(idx - 1), [idx]);
  const exercises = useMemo(() => buildLessonExercises(lesson, learned, learnedBefore), [lesson, learned, learnedBefore]);

  // Mastery lessons introduce no new key, so there's nothing to show on an
  // intro page — go straight to typing, like a real typing test.
  const [showIntro, setShowIntro] = useState(lesson.stage !== "mastery");
  const [exerciseIndex, setExerciseIndex] = useState(() =>
    Math.min(Math.max(startLevel ?? 0, 0), exercises.length - 1)
  );
  // Where this session actually started — needed to tell "walked past this
  // level just now" apart from "jumped straight past it," since exerciseIndex
  // only ever increases from whatever it started at.
  const startIndexRef = useRef(exerciseIndex);
  const [results, setResults] = useState<TypingSessionResult[]>([]);
  const [awaitingContinue, setAwaitingContinue] = useState(false);

  const exercise = exercises[exerciseIndex];
  const isLastExercise = exerciseIndex === exercises.length - 1;

  const { typed, onChange, reset, charStatuses, progressPct, liveErrors, wrongLanguageSuspected } = useTypingSession(
    exercise.target,
    (r) => {
      onLevelComplete(lessonId, exerciseIndex);
      setResults((prev) => [...prev, r]);
      setAwaitingContinue(true);
    }
  );

  const currentChar = exercise.target[typed.length] ?? null;

  if (showIntro) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-6">
        <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-8">
          ← Back to path
        </button>
        <LetterIntroCard newGlyphs={lesson.newGlyphs} learned={learned} onStart={() => setShowIntro(false)} />
      </div>
    );
  }

  if (awaitingContinue && !isLastExercise) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 px-6">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-xl font-bold mb-8" style={{ color: "var(--color-ink)" }}>
          {exercise.label} done — exercise {exerciseIndex + 1} of {exercises.length}
        </h2>
        <button
          onClick={() => {
            setExerciseIndex((i) => i + 1);
            setAwaitingContinue(false);
            reset();
          }}
          className="px-8 py-3 rounded-full font-bold text-white transition-transform hover:scale-105"
          style={{ background: "var(--color-nur)" }}
        >
          Continue
        </button>
      </div>
    );
  }

  if (awaitingContinue && isLastExercise) {
    const { wpm, accuracy } = aggregate(results);
    const stars = starsFor(accuracy, wpm);
    const xp = 10 + stars * 10;
    return (
      <div className="max-w-xl mx-auto text-center py-16 px-6">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: "var(--color-ink)" }}>
          Lesson complete!
        </h2>
        <p className="opacity-70 mb-8">{lesson.title}</p>
        <div className="mb-6">
          <ResultsPanel wpm={wpm} accuracy={accuracy} stars={stars} />
        </div>
        <div className="mb-10">
          <Result label="XP earned" value={`+${xp}`} />
        </div>
        <button
          onClick={() => onFinish(lessonId, { stars, bestWpm: wpm, bestAccuracy: accuracy }, xp)}
          className="px-8 py-3 rounded-full font-bold text-white transition-transform hover:scale-105"
          style={{ background: "var(--color-nur)" }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Back to path
      </button>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-ink)" }}>
            {lesson.title}
          </h2>
          <p className="font-arabic text-xl" style={{ color: "var(--color-gold-dark)" }}>
            {lesson.subtitle}
          </p>
        </div>
        <div className="text-sm opacity-60">
          Lesson {idx + 1} of {LESSONS.length}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        {exercises.map((ex, i) => {
          // A level counts as done if we've walked past it this session, or
          // if it was already recorded done before this session started
          // (relevant when jumping straight to a later level from the path
          // screen — the levels skipped over on the way there shouldn't
          // falsely show ✓ just because their index is below the current one).
          const done = (i >= startIndexRef.current && i < exerciseIndex) || Boolean(levelsDone[i]);
          return (
            <div
              key={i}
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: i === exerciseIndex ? "var(--color-gold)" : done ? "var(--color-nur)" : "var(--color-parchment-dim)",
                color: i === exerciseIndex || done ? "#fff" : "var(--color-ink)",
                opacity: i === exerciseIndex || done ? 1 : 0.6,
              }}
            >
              {done && "✓ "}
              {ex.label}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <StatsBar errors={liveErrors} progressPct={progressPct} />
        <button
          onClick={reset}
          title="Clear what you've typed and start this level over"
          className="text-xs font-bold shrink-0 opacity-60 hover:opacity-100 underline"
          style={{ color: "var(--color-ink)" }}
        >
          ↺ Start over
        </button>
      </div>
      {liveErrors > 0 && typed.length >= exercise.target.length && (
        <p className="text-center text-xs mb-4" style={{ color: "var(--color-clay)" }}>
          There's a mistake hiding in what you've typed — backspace to fix it, or hit "Start over".
        </p>
      )}

      {wrongLanguageSuspected && <LanguageWarningBanner onNeedHelp={onNeedKeyboardHelp} />}

      <div className="mb-8">
        <TypingBox target={exercise.target} typed={typed} statuses={charStatuses} onChange={onChange} />
      </div>

      {currentChar === " " ? (
        <p className="text-center text-sm font-bold mb-3" style={{ color: "var(--color-nur)" }}>
          ␣ Press Space — no key lights up for this one
        </p>
      ) : (
        <FingerGuide targetChar={currentChar} />
      )}
      <VirtualKeyboard learned={learned} targetChar={currentChar} />
    </div>
  );
}

function Result({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-3xl font-extrabold" style={{ color: "var(--color-nur)" }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide opacity-60">{label}</div>
    </div>
  );
}
