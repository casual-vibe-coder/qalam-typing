import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { LESSONS } from "../data/curriculum";
import { overallScore } from "../lib/scoring";

interface Row {
  user_id: string;
  username: string;
  xp: number;
  lessons_completed: number;
  best_wpm: number;
  best_accuracy: number;
  total_chars_typed: number | null;
  furthest_lesson_index: number | null;
}

type Tab = "typers" | "practice";

interface Props {
  currentUserId: string | null;
  onExit: () => void;
}

/** "Where they are in their journey" — a short label from a lesson index, tolerant of rows written before this column existed (null/-1). */
function journeyLabel(furthestIndex: number | null | undefined): string {
  if (furthestIndex === null || furthestIndex === undefined || furthestIndex < 0) return "Just starting";
  const lesson = LESSONS[furthestIndex];
  if (!lesson) return "Just starting";
  return `${lesson.title} (${furthestIndex + 1}/${LESSONS.length})`;
}

export function LeaderboardScreen({ currentUserId, onExit }: Props) {
  const [tab, setTab] = useState<Tab>("typers");
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
      .select("user_id, username, xp, lessons_completed, best_wpm, best_accuracy, total_chars_typed, furthest_lesson_index")
      // Fetch everyone once and sort client-side per tab — the two rankings
      // use different composite metrics, so one query covers both.
      .limit(200)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  const typers = [...rows].sort((a, b) => {
    const scoreA = overallScore(a.best_accuracy, a.best_wpm);
    const scoreB = overallScore(b.best_accuracy, b.best_wpm);
    return scoreB - scoreA;
  });
  const practice = [...rows].sort((a, b) => (b.total_chars_typed ?? 0) - (a.total_chars_typed ?? 0));

  return (
    <div className="max-w-md mx-auto py-8 px-6 pb-24">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Back to path
      </button>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-ink)" }}>
        Leaderboard
      </h1>
      <p className="opacity-70 mb-6">
        {tab === "typers" ? "Ranked by speed + accuracy." : "Ranked by total characters typed."}
      </p>

      <div className="flex gap-2 mb-6">
        <TabButton active={tab === "typers"} onClick={() => setTab("typers")} label="🏆 Top Typers" />
        <TabButton active={tab === "practice"} onClick={() => setTab("practice")} label="✦ Most Practice" />
      </div>

      {!isSupabaseConfigured && <p className="text-sm opacity-70">Sign in to see and join the leaderboard.</p>}
      {error && (
        <p className="text-sm" style={{ color: "var(--color-clay)" }}>
          {error}
        </p>
      )}
      {loading && isSupabaseConfigured && <p className="text-sm opacity-60">Loading…</p>}

      {!loading && isSupabaseConfigured && rows.length === 0 && !error && (
        <p className="text-sm opacity-60">No one's on the board yet — finish a lesson to be first.</p>
      )}

      <div className="flex flex-col gap-2">
        {(tab === "typers" ? typers : practice).map((row, i) => {
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
                  {tab === "typers"
                    ? `${row.best_wpm} WPM · ${row.best_accuracy}% acc`
                    : `${(row.total_chars_typed ?? 0).toLocaleString()} characters typed`}
                </div>
                <div className="text-[11px] opacity-50">{journeyLabel(row.furthest_lesson_index)}</div>
              </div>
              <div className="text-sm font-extrabold shrink-0 text-right" style={{ color: "var(--color-gold-dark)" }}>
                {tab === "typers" ? overallScore(row.best_accuracy, row.best_wpm) : row.xp}
                <div className="text-[10px] font-medium opacity-60">{tab === "typers" ? "score" : "XP"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
      style={{
        background: active ? "var(--color-nur)" : "var(--color-parchment-dim)",
        color: active ? "#fff" : "var(--color-ink)",
      }}
    >
      {label}
    </button>
  );
}
