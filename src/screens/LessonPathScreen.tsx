import { LESSONS } from "../data/curriculum";
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

interface Props {
  progress: Progress;
  isUnlocked: (index: number) => boolean;
  isUnitComplete: (stage: string) => boolean;
  userEmail: string | null;
  canSignIn: boolean;
  onStartLesson: (id: string) => void;
  onOpenPractice: () => void;
  onOpenLeaderboard: () => void;
  onSetupKeyboard: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function LessonPathScreen({
  progress,
  isUnlocked,
  isUnitComplete,
  userEmail,
  canSignIn,
  onStartLesson,
  onOpenPractice,
  onOpenLeaderboard,
  onSetupKeyboard,
  onSignIn,
  onSignOut,
}: Props) {
  const totalStars = Object.values(progress.lessons).reduce((s, l) => s + l.stars, 0);
  const maxStars = LESSONS.length * 3;

  let lastStage = "";

  return (
    <div className="max-w-md mx-auto py-8 px-6 pb-24">
      <header className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--color-ink)" }}>
            قلم <span className="text-base font-medium opacity-60">Qalam</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold">
          <Badge icon="🔥" value={progress.streakCount} />
          <Badge icon="⭐" value={`${totalStars}/${maxStars}`} />
          <Badge icon="✦" value={progress.xp} />
        </div>
      </header>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onSetupKeyboard} className="text-xs underline opacity-50 hover:opacity-90">
          ⌨️ Need help typing Arabic on your device?
        </button>
        {canSignIn &&
          (userEmail ? (
            <button onClick={onSignOut} className="text-xs opacity-50 hover:opacity-90 shrink-0 ml-3">
              {userEmail} · Sign out
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="text-xs font-bold shrink-0 ml-3"
              style={{ color: "var(--color-nur)" }}
            >
              Sign in to save progress
            </button>
          ))}
      </div>

      <button
        onClick={onOpenPractice}
        className="w-full text-left rounded-2xl p-5 mb-3 border-2 transition-transform hover:scale-[1.02]"
        style={{ borderColor: "var(--color-gold)", background: "linear-gradient(135deg,#fff,#fdf6e3)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-extrabold text-lg" style={{ color: "var(--color-gold-dark)" }}>
              Sunnah &amp; Qur'an practice
            </div>
            <div className="text-sm opacity-70">Type real hadith and short surahs — no lock, try it now</div>
          </div>
          <span className="text-2xl">📖</span>
        </div>
      </button>

      <button
        onClick={onOpenLeaderboard}
        className="w-full text-left rounded-2xl p-5 mb-8 border-2 transition-transform hover:scale-[1.02]"
        style={{ borderColor: "var(--color-nur)", background: "linear-gradient(135deg,#fff,#eef7f2)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-extrabold text-lg" style={{ color: "var(--color-nur)" }}>
              Leaderboard
            </div>
            <div className="text-sm opacity-70">See how you rank against everyone else</div>
          </div>
          <span className="text-2xl">🏆</span>
        </div>
      </button>

      <div className="flex flex-col items-center gap-3">
        {LESSONS.map((lesson, i) => {
          const unlocked = isUnlocked(i);
          const result = progress.lessons[lesson.id];
          const isNext = unlocked && !result;
          const showStageHeader = lesson.stage !== lastStage;
          lastStage = lesson.stage;
          const offset = i % 2 === 0 ? "-translate-x-6" : "translate-x-6";

          return (
            <div key={lesson.id} className="w-full flex flex-col items-center">
              {showStageHeader && (
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-50 mt-4 mb-2">
                  {STAGE_LABELS[lesson.stage]}
                  {isUnitComplete(lesson.stage) && <span style={{ color: "var(--color-nur)" }}>✓ done — jump in any order</span>}
                  {!isUnitComplete(lesson.stage) && isUnlocked(i) && <span className="normal-case font-medium">— any order</span>}
                </div>
              )}
              <button
                disabled={!unlocked}
                onClick={() => unlocked && onStartLesson(lesson.id)}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center font-arabic text-xl font-bold transition-transform ${offset} ${
                  unlocked ? "hover:scale-110" : "cursor-not-allowed"
                }`}
                style={{
                  background: result ? "var(--color-nur)" : unlocked ? "var(--color-gold)" : "var(--color-parchment-dim)",
                  color: result || unlocked ? "#fff" : "#a89f8a",
                  boxShadow: isNext ? "0 0 0 5px rgba(201,154,59,0.25)" : "none",
                }}
              >
                {result ? "✓" : !unlocked ? "🔒" : lesson.stage === "mastery" ? "📖" : lesson.subtitle.split(" ")[0]}
                {result && (
                  <span className="absolute -bottom-2 text-[10px] font-bold" style={{ color: "var(--color-gold-dark)" }}>
                    {"⭐".repeat(result.stars)}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ icon, value }: { icon: string; value: string | number }) {
  return (
    <div
      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
      style={{ background: "var(--color-parchment-dim)" }}
    >
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
}
