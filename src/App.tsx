import { useState } from "react";
import { LandingScreen } from "./screens/LandingScreen";
import { LessonPathScreen } from "./screens/LessonPathScreen";
import { LessonScreen } from "./screens/LessonScreen";
import { PracticeScreen } from "./screens/PracticeScreen";
import { KeyboardSetupScreen } from "./screens/KeyboardSetupScreen";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";
import { useProgress } from "./hooks/useProgress";

type View =
  | { name: "landing" }
  | { name: "path" }
  | { name: "lesson"; id: string }
  | { name: "practice" }
  | { name: "setup"; from: "landing" | "path" };

const AUTH_GATE_LESSON_COUNT = 6; // prompt once the home row is done — a real "I'm already typing real words" moment

function App() {
  const [view, setView] = useState<View>({ name: "landing" });
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { session, signOut, isConfigured } = useAuth();
  const { progress, recordLesson, completedCount, isUnlocked, isUnitComplete } = useProgress(session?.user.id ?? null);

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
          onStartLesson={(id) => setView({ name: "lesson", id })}
          onOpenPractice={() => setView({ name: "practice" })}
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
          onExit={() => setView({ name: "path" })}
          onNeedKeyboardHelp={() => setView({ name: "setup", from: "path" })}
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
        <PracticeScreen onExit={() => setView({ name: "path" })} onNeedKeyboardHelp={() => setView({ name: "setup", from: "path" })} />
      )}

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
