// Shared scoring so lesson completion, practice sessions, and the
// leaderboard all agree on what "good" means instead of drifting apart.
export function starsFor(accuracy: number, wpm: number): 1 | 2 | 3 {
  if (accuracy >= 97 && wpm >= 18) return 3;
  if (accuracy >= 90 && wpm >= 10) return 2;
  return 1;
}

/** 0-100 composite used by the results gauge and the leaderboard — accuracy-weighted since a fast-but-sloppy typist isn't actually better. */
export function overallScore(accuracy: number, wpm: number): number {
  return Math.round(accuracy * 0.7 + (Math.min(wpm, 60) / 60) * 100 * 0.3);
}
