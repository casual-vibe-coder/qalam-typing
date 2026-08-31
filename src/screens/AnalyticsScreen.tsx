import { LESSONS } from "../data/curriculum";
import { overallScore } from "../lib/scoring";
import type { Progress } from "../hooks/useProgress";

const STAGE_LABELS: Record<string, string> = {
  home: "Home row",
  top: "Top row",
  bottom: "Bottom row",
  extra: "One more letter",
  tashkeel: "Hamza & harakat",
  numbers: "Numbers",
  mastery: "Mastery — real Hadith",
};

const STAGES = ["home", "top", "bottom", "extra", "tashkeel", "numbers", "mastery"];

interface Props {
  progress: Progress;
  onExit: () => void;
}

export function AnalyticsScreen({ progress, onExit }: Props) {
  const results = Object.entries(progress.lessons);
  const bestWpm = results.reduce((max, [, r]) => Math.max(max, r.bestWpm), 0);
  const bestAccuracy = results.reduce((max, [, r]) => Math.max(max, r.bestAccuracy), 0);
  const bestScore = results.reduce((max, [, r]) => Math.max(max, overallScore(r.bestAccuracy, r.bestWpm)), 0);

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 pb-24">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Back to path
      </button>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-ink)" }}>
        My Analytics
      </h1>
      <p className="opacity-70 mb-6">How your typing is actually coming along.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <Stat label="Lessons done" value={`${results.length}/${LESSONS.length}`} />
        <Stat label="Total XP" value={progress.xp} color="var(--color-gold-dark)" />
        <Stat label="Streak" value={`${progress.streakCount} 🔥`} />
        <Stat label="Chars typed" value={progress.totalCharsTyped.toLocaleString()} />
        <Stat label="Best speed" value={`${bestWpm} WPM`} color="var(--color-nur)" />
        <Stat label="Best accuracy" value={`${bestAccuracy}%`} color="var(--color-nur)" />
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wide opacity-60 mb-3">Sunnah &amp; Qur'an practice</h2>
      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="Hadith completed" value={progress.hadithCompleted} />
        <Stat label="Qur'an pages" value={progress.quranPagesCompleted} color="var(--color-nur)" />
        <Stat label="✍️ Memory reps" value={progress.memoryModeCompletions} color="var(--color-gold-dark)" />
      </div>

      <div className="rounded-2xl border p-5 bg-white mb-8" style={{ borderColor: "var(--color-parchment-dim)" }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>
            Best overall rating
          </span>
          <span className="text-sm font-extrabold" style={{ color: "var(--color-nur)" }}>
            {bestScore}/100
          </span>
        </div>
        <p className="text-xs opacity-60">
          Accuracy-weighted, so a fast-but-sloppy run scores lower than a slower, clean one.
        </p>
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wide opacity-60 mb-3">Progress by stage</h2>
      <div className="flex flex-col gap-3 mb-8">
        {STAGES.map((stage) => {
          const inStage = LESSONS.filter((l) => l.stage === stage);
          const doneInStage = inStage.filter((l) => progress.lessons[l.id]).length;
          const pct = inStage.length === 0 ? 0 : Math.round((doneInStage / inStage.length) * 100);
          return (
            <div key={stage}>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span style={{ color: "var(--color-ink)" }}>{STAGE_LABELS[stage]}</span>
                <span className="opacity-60">
                  {doneInStage}/{inStage.length}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-parchment-dim)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-nur)" }} />
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="text-sm font-bold uppercase tracking-wide opacity-60 mb-3">Every lesson</h2>
      <div className="flex flex-col gap-2">
        {LESSONS.map((lesson) => {
          const result = progress.lessons[lesson.id];
          return (
            <div
              key={lesson.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
              style={{ borderColor: "var(--color-parchment-dim)", background: result ? "#fff" : "var(--color-parchment-dim)" }}
            >
              <div className="min-w-0">
                <div className="font-bold text-sm truncate" style={{ color: "var(--color-ink)" }}>
                  {lesson.title}
                </div>
                <div className="font-arabic text-sm opacity-60">{lesson.subtitle}</div>
              </div>
              <div className="text-right shrink-0 text-xs">
                {result ? (
                  <>
                    <div className="font-bold" style={{ color: "var(--color-gold-dark)" }}>
                      {"⭐".repeat(result.stars)}
                    </div>
                    <div className="opacity-60">
                      {result.bestWpm} WPM · {result.bestAccuracy}%
                    </div>
                  </>
                ) : (
                  <span className="opacity-40">Not done</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border p-3 bg-white" style={{ borderColor: "var(--color-parchment-dim)" }}>
      <div className="text-lg font-extrabold" style={{ color: color ?? "var(--color-ink)" }}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide opacity-60">{label}</div>
    </div>
  );
}
