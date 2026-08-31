import { useCallback, useMemo, useRef, useState } from "react";

export type CharStatus = "pending" | "correct" | "incorrect" | "current";

export interface TypingSessionResult {
  wpm: number;
  accuracy: number;
  errors: number;
  elapsedMs: number;
  chars: number;
}

export function useTypingSession(target: string, onComplete: (result: TypingSessionResult) => void) {
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const errorsRef = useRef(0);
  const prevLenRef = useRef(0);
  const doneRef = useRef(false);
  const latinStreakRef = useRef(0);
  const [wrongLanguageSuspected, setWrongLanguageSuspected] = useState(false);

  const reset = useCallback(() => {
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    errorsRef.current = 0;
    prevLenRef.current = 0;
    doneRef.current = false;
    latinStreakRef.current = 0;
    setWrongLanguageSuspected(false);
  }, []);

  const onChange = useCallback(
    (value: string) => {
      if (doneRef.current) return;
      // Never let typed race ahead of the target's length.
      const next = value.slice(0, target.length);
      if (startedAt === null && next.length > 0) setStartedAt(Date.now());

      if (next.length > prevLenRef.current) {
        // New character(s) appended — count fresh mismatches only.
        for (let i = prevLenRef.current; i < next.length; i++) {
          if (next[i] !== target[i]) {
            errorsRef.current += 1;
            // A run of plain Latin letters landing where Arabic is expected
            // almost always means the OS input language wasn't switched —
            // a single stray wrong-Arabic-letter shouldn't trigger this.
            if (/[a-zA-Z]/.test(next[i])) {
              latinStreakRef.current += 1;
              if (latinStreakRef.current >= 5) setWrongLanguageSuspected(true);
            } else {
              latinStreakRef.current = 0;
            }
          } else {
            latinStreakRef.current = 0;
            setWrongLanguageSuspected(false);
          }
        }
      }
      prevLenRef.current = next.length;
      setTyped(next);

      if (next === target) {
        doneRef.current = true;
        const end = Date.now();
        setFinishedAt(end);
        const start = startedAt ?? end;
        const elapsedMs = Math.max(end - start, 1);
        const minutes = elapsedMs / 60_000;
        const wpm = Math.round(target.length / 5 / minutes);
        const totalKeys = target.length + errorsRef.current;
        const accuracy = Math.round((target.length / totalKeys) * 100);
        onComplete({ wpm, accuracy, errors: errorsRef.current, elapsedMs, chars: target.length });
      }
    },
    [target, startedAt, onComplete]
  );

  const charStatuses = useMemo<CharStatus[]>(() => {
    return target.split("").map((ch, i) => {
      if (i < typed.length) return typed[i] === ch ? "correct" : "incorrect";
      if (i === typed.length) return "current";
      return "pending";
    });
  }, [target, typed]);

  // Typing is append/backspace-only, so an earlier mistake that got typed
  // past (rather than backspaced right away) can only be fixed by erasing
  // everything after it too — not obvious, and tedious to do character by
  // character. This jumps straight to just before the first still-wrong
  // character instead of making someone count backspaces.
  const fixFirstMistake = useCallback(() => {
    const firstBad = charStatuses.findIndex((s) => s === "incorrect");
    if (firstBad === -1) return;
    prevLenRef.current = firstBad;
    setTyped(target.slice(0, firstBad));
  }, [charStatuses, target]);

  const progressPct = target.length === 0 ? 0 : Math.round((typed.length / target.length) * 100);

  return {
    typed,
    onChange,
    reset,
    fixFirstMistake,
    charStatuses,
    progressPct,
    isDone: finishedAt !== null,
    liveErrors: errorsRef.current,
    wrongLanguageSuspected,
  };
}
