import { useState } from "react";
import { LandingScreen } from "./screens/LandingScreen";
import { LessonPathScreen } from "./screens/LessonPathScreen";
import { LessonScreen } from "./screens/LessonScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { KeyboardSetupScreen } from "./screens/KeyboardSetupScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { AnalyticsScreen } from "./screens/AnalyticsScreen";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";
import { useProgress } from "./hooks/useProgress";
import { useProfile } from "./hooks/useProfile";

type View =
  | { name: "landing" }
  | { name: "path" }
  | { name: "lesson"; id: string; level?: number }
  | { name: "practice" }
  | { name: "leaderboard" }
  | { name: "analytics" }
  | { name: "setup"; from: "landing" | "path" };

const AUTH_GATE_LESSON_COUNT = 6; // prompt once the home row is done — a real "I'm already typing real words" moment

function App() {
  const [view, setView] = useState<View>({ name: "landing" });
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { session, signOut, isConfigured } = useAuth();
  const { username } = useProfile(session?.user.id ?? null);
  const { progress, recordLesson, recordLevel, recordChars, completedCount, isUnlocked, isUnitComplete } = useProgress(
    session?.user.id ?? null,
    username
  );

  return (
    <div className="min-h-screen">
      {view.name === "landing" && (
        <LandingScreen
          onStart={() => setView({ name: "path" })}
          onSetupKeyboard={() => setView({ name: "setup", from: "landing" })}
        />
      )}

      {view.name === "path" && (
        <LessonPathScreen
          progress={progress}
          isUnlocked={isUnlocked}
          isUnitComplete={isUnitComplete}
          userEmail={session?.user.email ?? null}
          canSignIn={isConfigured}
          onStartLesson={(id, level) => setView({ name: "lesson", id, level })}
          onOpenPractice={() => setView({ name: "practice" })}
          onOpenLeaderboard={() => setView({ name: "leaderboard" })}
          onOpenAnalytics={() => setView({ name: "analytics" })}
          onSetupKeyboard={() => setView({ name: "setup", from: "path" })}
          onSignIn={() => setShowAuthModal(true)}
          onSignOut={signOut}
        />
      )}

      {view.name === "setup" && (
        <KeyboardSetupScreen
          onBack={() => setView(view.from === "landing" ? { name: "landing" } : { name: "path" })}
        />
      )}

      {view.name === "lesson" && (
        <LessonScreen
          lessonId={view.id}
          startLevel={view.level}
          levelsDone={progress.levelsDone?.[view.id]}
          onExit={() => setView({ name: "path" })}
          onNeedKeyboardHelp={() => setView({ name: "setup", from: "path" })}
          onLevelComplete={recordLevel}
          onCharsTyped={recordChars}
          onFinish={(id, result, xp) => {
            recordLesson(id, result, xp);
            const nowCompleted = completedCount + 1;
            if (nowCompleted === AUTH_GATE_LESSON_COUNT && !session && isConfigured) {
              setShowAuthGate(true);
            }
            setView({ name: "path" });
          }}
        />
      )}

      {view.name === "practice" && (
        <PracticeScreen
          onExit={() => setView({ name: "path" })}
          onNeedKeyboardHelp={() => setView({ name: "setup", from: "path" })}
          onCharsTyped={recordChars}
        />
      )}

      {view.name === "leaderboard" && (
        <LeaderboardScreen currentUserId={session?.user.id ?? null} onExit={() => setView({ name: "path" })} />
      )}

      {view.name === "analytics" && <AnalyticsScreen progress={progress} onExit={() => setView({ name: "path" })} />}

      {showAuthGate && (
        <AuthModal
          title="Nice progress!"
          subtitle="Sign in with just your email — no password — and your progress saves to your account instead of just this browser."
          onSignedIn={() => setShowAuthGate(false)}
          onClose={() => setShowAuthGate(false)}
        />
      )}

      {showAuthModal && (
        <AuthModal onSignedIn={() => setShowAuthModal(false)} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

export default App;
