import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

interface Row {
  user_id: string;
  username: string;
  xp: number;
  lessons_completed: number;
  best_wpm: number;
  best_accuracy: number;
}

interface Props {
  currentUserId: string | null;
  onExit: () => void;
}

export function LeaderboardScreen({ currentUserId, onExit }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase
      .from("qalam_leaderboard")
      // Ranked by lessons completed first — "who's gone the furthest" is the
      // metric that was actually asked for, not raw typing speed.
      .select("user_id, username, xp, lessons_completed, best_wpm, best_accuracy")
      .order("lessons_completed", { ascending: false })
      .order("xp", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-md mx-auto py-8 px-6 pb-24">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Back to path
      </button>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-ink)" }}>
        Leaderboard
      </h1>
      <p className="opacity-70 mb-6">Ranked by lessons completed.</p>

      {!isSupabaseConfigured && (
        <p className="text-sm opacity-70">Sign in to see and join the leaderboard.</p>
      )}
      {error && <p className="text-sm" style={{ color: "var(--color-clay)" }}>{error}</p>}
      {loading && isSupabaseConfigured && <p className="text-sm opacity-60">Loading…</p>}

      {!loading && isSupabaseConfigured && rows.length === 0 && !error && (
        <p className="text-sm opacity-60">No one's on the board yet — finish a lesson to be first.</p>
      )}

      <div className="flex flex-col gap-2">
        {rows.map((row, i) => {
          const isMe = row.user_id === currentUserId;
          return (
            <div
              key={row.user_id}
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{
                borderColor: isMe ? "var(--color-nur)" : "var(--color-parchment-dim)",
                background: isMe ? "var(--color-nur)" + "0f" : "#fff",
              }}
            >
              <div className="w-7 text-center font-extrabold text-sm opacity-60">
                {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate" style={{ color: "var(--color-ink)" }}>
                  {row.username}
                  {isMe && <span className="ml-1.5 font-medium opacity-60">(you)</span>}
                </div>
                <div className="text-[11px] opacity-60">
                  {row.lessons_completed} lesson{row.lessons_completed !== 1 ? "s" : ""} · {row.best_wpm} WPM ·{" "}
                  {row.best_accuracy}% acc
                </div>
              </div>
              <div className="text-sm font-extrabold shrink-0" style={{ color: "var(--color-gold-dark)" }}>
                {row.xp} XP
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
