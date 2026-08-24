import { useMemo, useState } from "react";
import { HADITHS } from "../data/hadiths";
import { SURAHS } from "../data/quran";
import { TypingBox } from "../components/TypingBox";
import { StatsBar } from "../components/StatsBar";
import { LanguageWarningBanner } from "../components/LanguageWarningBanner";
import { ResultsPanel } from "../components/ResultsPanel";
import { starsFor } from "../lib/scoring";
import { useTypingSession, type TypingSessionResult } from "../hooks/useTypingSession";

type Mode = "hadith" | "quran";
type Item =
  | { kind: "hadith"; ar: string; translations: string[]; sub: string }
  | { kind: "quran"; ar: string; translations: string[]; sub: string };

interface Props {
  onExit: () => void;
  onNeedKeyboardHelp: () => void;
}

export function PracticeScreen({ onExit, onNeedKeyboardHelp }: Props) {
  const [mode, setMode] = useState<Mode>("hadith");
  const [selected, setSelected] = useState<Item | null>(null);

  if (selected) {
    return <PracticeSession item={selected} onExit={() => setSelected(null)} onNeedKeyboardHelp={onNeedKeyboardHelp} />;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 pb-24">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Back to path
      </button>
      <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--color-ink)" }}>
        Sunnah &amp; Qur'an practice
      </h1>
      <p className="opacity-70 mb-6">Type real, verified text — the translation stays visible below as you go.</p>

      <div className="flex gap-2 mb-6">
        <TabButton active={mode === "hadith"} onClick={() => setMode("hadith")} label="Hadith" />
        <TabButton active={mode === "quran"} onClick={() => setMode("quran")} label="Qur'an" />
      </div>

      {mode === "hadith" ? (
        <div className="flex flex-col gap-3">
          {HADITHS.map((h, i) => (
            <button
              key={i}
              onClick={() => setSelected({ kind: "hadith", ar: h.ar, translations: [h.en], sub: `${h.narrator} — ${h.reference}` })}
              className="text-left rounded-xl border p-4 hover:shadow-md transition-shadow bg-white"
              style={{ borderColor: "var(--color-parchment-dim)" }}
            >
              <div className="font-arabic text-lg mb-1 truncate" dir="rtl" style={{ color: "var(--color-ink)" }}>
                {h.ar}
              </div>
              <div className="text-xs opacity-60">{h.narrator} — {h.reference}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {SURAHS.map((s) => (
            <button
              key={s.id}
              onClick={() =>
                setSelected({
                  kind: "quran",
                  ar: s.ayahs.map((a) => a.ar).join("   "),
                  translations: s.ayahs.map((a) => a.en),
                  sub: `${s.name} (${s.ayahs.length} ayahs)`,
                })
              }
              className="text-left rounded-xl border p-4 hover:shadow-md transition-shadow bg-white"
              style={{ borderColor: "var(--color-parchment-dim)" }}
            >
              <div className="font-arabic text-lg mb-1" dir="rtl" style={{ color: "var(--color-ink)" }}>
                {s.arabicName}
              </div>
              <div className="text-xs opacity-60">
                {s.name} — {s.ayahs.length} ayahs
              </div>
            </button>
          ))}
        </div>
      )}
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

function PracticeSession({
  item,
  onExit,
  onNeedKeyboardHelp,
}: {
  item: Item;
  onExit: () => void;
  onNeedKeyboardHelp: () => void;
}) {
  const [result, setResult] = useState<TypingSessionResult | null>(null);
  const { typed, onChange, charStatuses, progressPct, liveErrors, wrongLanguageSuspected } = useTypingSession(
    item.ar,
    (r) => setResult(r)
  );

  const translationBlock = useMemo(
    () => item.translations.map((t, i) => <p key={i} className="mb-2 last:mb-0">{t}</p>),
    [item]
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 pb-24">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Choose another
      </button>
      <p className="text-sm font-bold mb-4" style={{ color: "var(--color-gold-dark)" }}>
        {item.sub}
      </p>

      {result ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-extrabold mb-6">Well done!</h2>
          <div className="mb-8">
            <ResultsPanel wpm={result.wpm} accuracy={result.accuracy} stars={starsFor(result.accuracy, result.wpm)} />
          </div>
          <button
            onClick={onExit}
            className="px-8 py-3 rounded-full font-bold text-white"
            style={{ background: "var(--color-nur)" }}
          >
            Choose another
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <StatsBar errors={liveErrors} progressPct={progressPct} />
          </div>
          {wrongLanguageSuspected && <LanguageWarningBanner onNeedHelp={onNeedKeyboardHelp} />}
          <div className="mb-6">
            <TypingBox target={item.ar} typed={typed} statuses={charStatuses} onChange={onChange} />
          </div>
          <div
            className="rounded-xl p-4 text-sm leading-relaxed"
            style={{ background: "var(--color-parchment-dim)", color: "var(--color-ink)" }}
          >
            {translationBlock}
          </div>
        </>
      )}
    </div>
  );
}
