import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { claimUsername, hasProfile } from "../hooks/useProfile";

interface Props {
  onClose: () => void;
  onSignedIn: () => void;
  title?: string;
  subtitle?: string;
}

type Step = "email" | "code" | "username";

const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export function AuthModal({ onClose, onSignedIn, title, subtitle }: Props) {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const usernameValid = USERNAME_RE.test(username);

  const submitEmail = async () => {
    if (!emailValid || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await sendCode(email);
    setBusy(false);
    if (error) return setError(error);
    setStep("code");
  };

  const submitCode = async () => {
    if (code.trim().length < 6 || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await verifyCode(email, code.trim());
    if (error) {
      setBusy(false);
      return setError(error);
    }
    // New sign-ups pick a leaderboard display name once; returning users skip straight through.
    const alreadyHasProfile = await hasProfile();
    setBusy(false);
    if (alreadyHasProfile) return onSignedIn();
    setStep("username");
  };

  const submitUsername = async () => {
    if (!usernameValid || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await claimUsername(username.trim());
    setBusy(false);
    if (error) return setError(error);
    onSignedIn();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative">
        <button onClick={onClose} className="absolute top-3 right-4 opacity-50 hover:opacity-100">
          ✕
        </button>

        {step === "email" && (
          <>
            <div className="text-4xl mb-3">🎖️</div>
            <h3 className="text-xl font-extrabold mb-2" style={{ color: "var(--color-ink)" }}>
              {title ?? "Sign in with email"}
            </h3>
            <p className="text-sm opacity-70 mb-5">
              {subtitle ?? "No password needed — we'll email you a 6-digit code to save your progress."}
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border rounded-xl px-4 py-3 mb-3 text-center"
              style={{ borderColor: "var(--color-parchment-dim)" }}
            />
            {error && <p className="text-sm mb-3" style={{ color: "var(--color-clay)" }}>{error}</p>}
            <button
              disabled={!emailValid || busy}
              onClick={submitEmail}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "var(--color-nur)" }}
            >
              {busy ? "Sending…" : "Send me a code"}
            </button>
          </>
        )}
        {step === "code" && (
          <>
            <div className="text-4xl mb-3">📩</div>
            <h3 className="text-xl font-extrabold mb-2" style={{ color: "var(--color-ink)" }}>
              Check your email
            </h3>
            <p className="text-sm opacity-70 mb-5">
              We sent a 6-digit code to <strong>{email}</strong>.
            </p>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="w-full border rounded-xl px-4 py-3 mb-3 text-center text-2xl tracking-[0.5em]"
              style={{ borderColor: "var(--color-parchment-dim)" }}
            />
            {error && <p className="text-sm mb-3" style={{ color: "var(--color-clay)" }}>{error}</p>}
            <button
              disabled={code.length < 6 || busy}
              onClick={submitCode}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "var(--color-nur)" }}
            >
              {busy ? "Verifying…" : "Verify & sign in"}
            </button>
            <button onClick={() => setStep("email")} className="text-xs opacity-50 hover:opacity-80 mt-3">
              Use a different email
            </button>
          </>
        )}
        {step === "username" && (
          <>
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-xl font-extrabold mb-2" style={{ color: "var(--color-ink)" }}>
              Pick a leaderboard name
            </h3>
            <p className="text-sm opacity-70 mb-5">
              This is what other students see on the leaderboard — not your email. Letters, numbers, underscores,
              3–20 characters.
            </p>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              placeholder="fastest_qalam"
              maxLength={20}
              className="w-full border rounded-xl px-4 py-3 mb-3 text-center"
              style={{ borderColor: "var(--color-parchment-dim)" }}
            />
            {error && <p className="text-sm mb-3" style={{ color: "var(--color-clay)" }}>{error}</p>}
            <button
              disabled={!usernameValid || busy}
              onClick={submitUsername}
              className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-40 transition-opacity"
              style={{ background: "var(--color-nur)" }}
            >
              {busy ? "Saving…" : "Save & continue"}
            </button>
          </>
        )}
        <button onClick={onClose} className="text-xs opacity-50 hover:opacity-80 mt-3 block mx-auto">
          Maybe later
        </button>
      </div>
    </div>
  );
}
