import { useCallback, useEffect, useRef, useState } from "react";
import { LESSONS } from "../data/curriculum";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export interface LessonResult {
  stars: 1 | 2 | 3;
  bestWpm: number;
  bestAccuracy: number;
}

export interface Progress {
  xp: number;
  streakCount: number;
  lastActiveDate: string | null; // yyyy-mm-dd
  lessons: Record<string, LessonResult>;
  // Per-level (1/2/3) completion within a lesson, independent of the
  // whole-lesson `lessons` entry above — lets the path screen show and
  // link to each level individually instead of only the finished lesson
  // as a whole. Keyed by lesson id, three booleans per lesson.
  levelsDone: Record<string, boolean[]>;
  // Every character of every completed exercise, lesson or free practice —
  // a pure volume metric for the "most practice" leaderboard, independent
  // of skill or curriculum progress.
  totalCharsTyped: number;
}

const STORAGE_KEY = "qalam:progress:v1";

const EMPTY: Progress = {
  xp: 0,
  streakCount: 0,
  lastActiveDate: null,
  lessons: {},
  levelsDone: {},
  totalCharsTyped: 0,
};

/** Index into LESSONS of the furthest one completed so far, or -1 if none — "where they are in their journey" for the leaderboard. */
function furthestLessonIndex(p: Progress): number {
  let furthest = -1;
  LESSONS.forEach((l, i) => {
    if (p.lessons[l.id]) furthest = i;
  });
  return furthest;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadLocal(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

function saveLocal(p: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // storage unavailable — progress just won't persist locally this session
  }
}

function bumpStreak(p: Progress): Progress {
  const today = todayStr();
  if (p.lastActiveDate === today) return p;
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const continued = p.lastActiveDate === yesterday;
  return { ...p, lastActiveDate: today, streakCount: continued ? p.streakCount + 1 : 1 };
}

/** Whichever of two progress snapshots represents more actual work done. */
function richerOf(a: Progress, b: Progress): Progress {
  const aCount = Object.keys(a.lessons).length;
  const bCount = Object.keys(b.lessons).length;
  if (aCount !== bCount) return aCount > bCount ? a : b;
  return a.xp >= b.xp ? a : b;
}

export function useProgress(userId: string | null, username: string | null) {
  const [progress, setProgress] = useState<Progress>(loadLocal);
  const syncedForUser = useRef<string | null>(null);

  // Aggregate + upsert the public leaderboard row. Skipped until a username
  // is chosen (see AuthModal) — no username means nothing to show publicly.
  const pushLeaderboard = useCallback(
    (p: Progress) => {
      if (!isSupabaseConfigured || !userId || !username) return;
      const results = Object.values(p.lessons);
      const bestWpm = results.reduce((max, r) => Math.max(max, r.bestWpm), 0);
      const bestAccuracy = results.reduce((max, r) => Math.max(max, r.bestAccuracy), 0);
      supabase.from("qalam_leaderboard").upsert({
        user_id: userId,
        username,
        xp: p.xp,
        lessons_completed: results.length,
        best_wpm: bestWpm,
        best_accuracy: bestAccuracy,
        total_chars_typed: p.totalCharsTyped,
        furthest_lesson_index: furthestLessonIndex(p),
        updated_at: new Date().toISOString(),
      });
    },
    [userId, username]
  );

  // Push once whenever a username becomes available — covers both "just
  // claimed one" and "signed in elsewhere, one already existed".
  useEffect(() => {
    pushLeaderboard(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  useEffect(() => {
    saveLocal(progress);
  }, [progress]);

  // On sign-in, reconcile with whatever's already saved remotely — keep
  // whichever snapshot represents more done, then make sure Supabase has it.
  useEffect(() => {
    if (!isSupabaseConfigured || !userId || syncedForUser.current === userId) return;
    syncedForUser.current = userId;
    (async () => {
      const { data } = await supabase.from("qalam_progress").select("data").eq("user_id", userId).maybeSingle();
      // Backfill against EMPTY here too — a row saved before a field like
      // `levelsDone` existed comes back missing it entirely (this is raw
      // Supabase JSON, not run through loadLocal's own {...EMPTY, ...} merge),
      // and an app crash on load traces straight back to that.
      const remote = data?.data ? ({ ...EMPTY, ...(data.data as Partial<Progress>) } as Progress) : undefined;
      const merged = remote ? richerOf(remote, progress) : progress;
      setProgress(merged);
      await supabase.from("qalam_progress").upsert({ user_id: userId, data: merged, updated_at: new Date().toISOString() });
    })();
    // Only re-run when the signed-in user changes, not on every local progress edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const pushRemote = useCallback(
    (p: Progress) => {
      if (!isSupabaseConfigured || !userId) return;
      supabase.from("qalam_progress").upsert({ user_id: userId, data: p, updated_at: new Date().toISOString() });
      pushLeaderboard(p);
    },
    [userId, pushLeaderboard]
  );

  const recordLesson = useCallback(
    (lessonId: string, result: LessonResult, xpEarned: number) => {
      setProgress((p) => {
        const prevBest = p.lessons[lessonId];
        const merged: LessonResult = prevBest
          ? {
              stars: Math.max(prevBest.stars, result.stars) as 1 | 2 | 3,
              bestWpm: Math.max(prevBest.bestWpm, result.bestWpm),
              bestAccuracy: Math.max(prevBest.bestAccuracy, result.bestAccuracy),
            }
          : result;
        const withStreak = bumpStreak(p);
        const next: Progress = {
          ...withStreak,
          xp: withStreak.xp + (prevBest ? Math.round(xpEarned * 0.2) : xpEarned),
          lessons: { ...withStreak.lessons, [lessonId]: merged },
        };
        pushRemote(next);
        return next;
      });
    },
    [pushRemote]
  );

  /** Mark a single level (0/1/2) of a lesson done — fires every time a level's
   * typing session finishes, regardless of whether the other two levels have
   * been done yet, so the path screen's per-level circles stay accurate even
   * when someone jumps straight to level 3. */
  const recordLevel = useCallback(
    (lessonId: string, levelIndex: number) => {
      setProgress((p) => {
        const prevLevels = p.levelsDone?.[lessonId] ?? [false, false, false];
        if (prevLevels[levelIndex]) return p; // already recorded — no-op
        const nextLevels = [...prevLevels];
        nextLevels[levelIndex] = true;
        const next: Progress = { ...p, levelsDone: { ...p.levelsDone, [lessonId]: nextLevels } };
        pushRemote(next);
        return next;
      });
    },
    [pushRemote]
  );

  /** Add to the running total-characters-typed count — called for every
   * completed exercise, lesson or free practice alike, since this metric is
   * about typing volume, not curriculum progress. */
  const recordChars = useCallback(
    (count: number) => {
      setProgress((p) => {
        const next: Progress = { ...p, totalCharsTyped: p.totalCharsTyped + count };
        pushRemote(next);
        return next;
      });
    },
    [pushRemote]
  );

  const completedCount = Object.keys(progress.lessons).length;
  const nextLesson = LESSONS.find((l) => !progress.lessons[l.id]) ?? LESSONS[LESSONS.length - 1];

  // Unlocked per UNIT (stage), not per lesson — someone who already knows
  // some letters can jump to any lesson within an unlocked unit in any
  // order. The unit itself only unlocks once the previous unit is fully
  // finished, and "done" for the unit means every lesson in it is done.
  const isUnitComplete = useCallback(
    (stage: string) => LESSONS.filter((l) => l.stage === stage).every((l) => Boolean(progress.lessons[l.id])),
    [progress.lessons]
  );
  const isUnlocked = useCallback(
    (index: number) => {
      const stage = LESSONS[index].stage;
      const firstIndexOfStage = LESSONS.findIndex((l) => l.stage === stage);
      if (firstIndexOfStage === 0) return true;
      const prevStage = LESSONS[firstIndexOfStage - 1].stage;
      return isUnitComplete(prevStage);
    },
    [isUnitComplete]
  );

  return { progress, recordLesson, recordLevel, recordChars, completedCount, nextLesson, isUnlocked, isUnitComplete };
}
