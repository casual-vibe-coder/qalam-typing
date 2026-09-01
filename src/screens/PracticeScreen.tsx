import { useEffect, useMemo, useState } from "react";
import { HADITHS, HADITH_COLLECTIONS, type HadithEntry } from "../data/hadiths";
import { SURAHS } from "../data/quran";
import { TypingBox } from "../components/TypingBox";
import { StatsBar } from "../components/StatsBar";
import { LanguageWarningBanner } from "../components/LanguageWarningBanner";
import { ResultsPanel } from "../components/ResultsPanel";
import { starsFor } from "../lib/scoring";
import { stripHarakat, stripInvisibleMarks, toTypableArabic } from "../lib/arabic";
import { useTypingSession, type TypingSessionResult } from "../hooks/useTypingSession";

type Mode = "hadith" | "quran";
type QuranSubMode = "surah" | "page";
type PracticeKind = "hadith" | "quran-page" | "quran-surah";
const LAST_QURAN_PAGE = 604;

interface Item {
  kind: PracticeKind;
  ar: string;
  // Authentic Uthmani mushaf spelling, same length as `ar` character-for-
  // character (see toTypableArabic) — only set for Qur'an-by-page items,
  // where `ar` itself is the normalized/actually-typable string.
  renderAr?: string;
  translations: string[];
  sub: string;
}

interface Props {
  onExit: () => void;
  onNeedKeyboardHelp: () => void;
  onCharsTyped: (count: number) => void;
  onPracticeComplete: (info: { kind: PracticeKind; memoryMode: boolean }) => void;
}

export function PracticeScreen({ onExit, onNeedKeyboardHelp, onCharsTyped, onPracticeComplete }: Props) {
  const [mode, setMode] = useState<Mode>("hadith");
  const [quranSubMode, setQuranSubMode] = useState<QuranSubMode>("surah");
  const [selected, setSelected] = useState<Item | null>(null);
  const [collection, setCollection] = useState<HadithEntry["collection"]>("selected");

  if (selected) {
    return (
      <PracticeSession
        item={selected}
        onExit={() => setSelected(null)}
        onNeedKeyboardHelp={onNeedKeyboardHelp}
        onCharsTyped={onCharsTyped}
        onPracticeComplete={onPracticeComplete}
      />
    );
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
          <div className="flex gap-2 mb-1">
            {HADITH_COLLECTIONS.map((c) => (
              <TabButton key={c.id} active={collection === c.id} onClick={() => setCollection(c.id)} label={c.name} />
            ))}
          </div>
          <p className="text-xs opacity-60 -mt-1 mb-2">
            {HADITH_COLLECTIONS.find((c) => c.id === collection)?.description}
          </p>
          {HADITHS.filter((h) => h.collection === collection).map((h, i) => (
            <button
              key={i}
              onClick={() =>
                setSelected({ kind: "hadith", ar: h.ar, translations: [h.en], sub: `${h.narrator} — ${h.reference}` })
              }
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
          <div className="flex gap-2 mb-1">
            <TabButton active={quranSubMode === "surah"} onClick={() => setQuranSubMode("surah")} label="By surah" />
            <TabButton active={quranSubMode === "page"} onClick={() => setQuranSubMode("page")} label="By mushaf page" />
          </div>
          {quranSubMode === "surah" ? (
            <>
              <p className="text-xs opacity-60 -mt-1 mb-2">A few short, well-known surahs to start with.</p>
              {SURAHS.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelected({
                      kind: "quran-surah",
                      // A single space between ayahs, not three literal space
                      // characters — comparison here is strict per keystroke,
                      // so three spaces meant three separate spacebar presses
                      // to clear one ayah boundary. Getting even one of those
                      // wrong (very easy — nothing visually distinguishes
                      // "1 space typed" from "3 spaces needed") silently
                      // misaligned every character after it, since a mismatched
                      // space has no glyph to paint red — exactly the "9 errors
                      // but I don't see any" report. renderAr keeps the
                      // newline-per-ayah look on screen without requiring it
                      // to be typed as three separate keystrokes.
                      ar: s.ayahs.map((a) => a.ar).join(" "),
                      renderAr: s.ayahs.map((a) => a.ar).join("\n"),
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
            </>
          ) : (
            <QuranPageBrowser
              onNeedKeyboardHelp={onNeedKeyboardHelp}
              onCharsTyped={onCharsTyped}
              onPracticeComplete={onPracticeComplete}
            />
          )}
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

interface QuranPageData {
  ar: string;
  translations: string[];
  surahLabel: string;
}

async function fetchQuranPage(pageNum: number): Promise<QuranPageData> {
  const [arRes, enRes] = await Promise.all([
    fetch(`https://api.alquran.cloud/v1/page/${pageNum}/quran-uthmani`).then((r) => r.json()),
    fetch(`https://api.alquran.cloud/v1/page/${pageNum}/en.sahih`).then((r) => r.json()),
  ]);
  if (arRes?.code !== 200 || enRes?.code !== 200) throw new Error("Couldn't load that page");
  const ayahs: { text: string; surah: { englishName: string } }[] = arRes.data.ayahs;
  const surahNames = [...new Set(ayahs.map((a) => a.surah.englishName))].join(", ");
  return {
    ar: stripInvisibleMarks(ayahs.map((a) => a.text).join(" ")),
    translations: (enRes.data.ayahs as { text: string }[]).map((a) => a.text),
    surahLabel: surahNames,
  };
}

/** Picks then flows through real Mushaf pages — fetched live (the full 604-page
 * Uthmani text is far too large to bundle statically like the curated surahs
 * above). "Next page" jumps straight into the next page's typing session
 * instead of returning to this picker, so a long typing/memorization run
 * doesn't get interrupted every single page. */
function QuranPageBrowser({
  onNeedKeyboardHelp,
  onCharsTyped,
  onPracticeComplete,
}: {
  onNeedKeyboardHelp: () => void;
  onCharsTyped: (count: number) => void;
  onPracticeComplete: (info: { kind: PracticeKind; memoryMode: boolean }) => void;
}) {
  const [pageNum, setPageNum] = useState(1);
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<{ pageNum: number; item: Item } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchQuranPage(pageNum)
      .then((d) => {
        if (!cancelled) setPageData(d);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load this page — check your connection and try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pageNum]);

  const startPage = () => {
    if (!pageData) return;
    const item: Item = {
      kind: "quran-page",
      ar: toTypableArabic(pageData.ar),
      renderAr: pageData.ar,
      translations: pageData.translations,
      sub: `Mushaf page ${pageNum} of ${LAST_QURAN_PAGE} — ${pageData.surahLabel}`,
    };
    setSession({ pageNum, item });
  };

  if (session) {
    return (
      <PracticeSession
        key={session.pageNum}
        item={session.item}
        onExit={() => setSession(null)}
        onNeedKeyboardHelp={onNeedKeyboardHelp}
        onCharsTyped={onCharsTyped}
        onPracticeComplete={onPracticeComplete}
        chooseAnotherLabel="Back to page picker"
        onNext={
          session.pageNum < LAST_QURAN_PAGE
            ? () => {
                const next = session.pageNum + 1;
                setPageNum(next);
                setSession(null);
              }
            : undefined
        }
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-3">
        <button
          onClick={() => setPageNum((p) => Math.max(1, p - 1))}
          disabled={pageNum <= 1}
          className="px-3 py-1.5 rounded-full text-sm font-bold disabled:opacity-30"
          style={{ background: "var(--color-parchment-dim)", color: "var(--color-ink)" }}
        >
          ← Prev
        </button>
        <input
          type="number"
          min={1}
          max={LAST_QURAN_PAGE}
          value={pageNum}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= 1 && v <= LAST_QURAN_PAGE) setPageNum(v);
          }}
          className="w-16 text-center border rounded-lg py-1 text-sm font-bold"
          style={{ borderColor: "var(--color-parchment-dim)" }}
        />
        <span className="text-sm opacity-60">of {LAST_QURAN_PAGE}</span>
        <button
          onClick={() => setPageNum((p) => Math.min(LAST_QURAN_PAGE, p + 1))}
          disabled={pageNum >= LAST_QURAN_PAGE}
          className="px-3 py-1.5 rounded-full text-sm font-bold disabled:opacity-30"
          style={{ background: "var(--color-parchment-dim)", color: "var(--color-ink)" }}
        >
          Next →
        </button>
      </div>
      {loading && <p className="text-sm opacity-60 text-center">Loading page…</p>}
      {error && (
        <p className="text-sm text-center" style={{ color: "var(--color-clay)" }}>
          {error}
        </p>
      )}
      {pageData && !loading && (
        <button
          onClick={startPage}
          className="text-left rounded-xl border p-4 hover:shadow-md transition-shadow bg-white w-full"
          style={{ borderColor: "var(--color-parchment-dim)" }}
        >
          <div className="font-arabic text-lg mb-2 leading-relaxed" dir="rtl" style={{ color: "var(--color-ink)" }}>
            {pageData.ar}
          </div>
          <div className="text-xs opacity-60">
            Page {pageNum} of {LAST_QURAN_PAGE} — {pageData.surahLabel}
          </div>
        </button>
      )}
    </div>
  );
}

function PracticeSession({
  item,
  onExit,
  onNeedKeyboardHelp,
  onCharsTyped,
  onPracticeComplete,
  onNext,
  chooseAnotherLabel = "Choose another",
}: {
  item: Item;
  onExit: () => void;
  onNeedKeyboardHelp: () => void;
  onCharsTyped: (count: number) => void;
  onPracticeComplete: (info: { kind: PracticeKind; memoryMode: boolean }) => void;
  // When set, the results screen offers "Next page →" alongside the usual
  // exit — used by the Qur'an page browser to flow straight into the next
  // page instead of bouncing back to the picker every time.
  onNext?: () => void;
  chooseAnotherLabel?: string;
}) {
  const [result, setResult] = useState<TypingSessionResult | null>(null);
  // Full tashkeel (every short vowel + shaddah + sukoon) is genuinely hard
  // to type accurately, and this comparison is strict per character — skip
  // even one diacritic keystroke and every character after it is now
  // compared one position out of alignment, which cascades into almost the
  // entire rest of the text reading as "wrong" despite looking right. Most
  // everyday Arabic typing skips tashkeel entirely, so default to that.
  const [tashkeel, setTashkeel] = useState(false);
  const target = useMemo(() => (tashkeel ? item.ar : stripHarakat(item.ar)), [item, tashkeel]);
  // Only diverges from `target` when full tashkeel is on AND this item came
  // from the Qur'an page browser (renderAr set) — that's the one case where
  // `target` (normalized, actually-typable) and the authentic Uthmani mushaf
  // spelling differ, and both are guaranteed the same length so the
  // highlight-range math in TypingBox still lines up. With tashkeel off,
  // showing anything other than `target` isn't safe to guarantee same-length,
  // so it's skipped — no diacritics means no visual claim to make anyway.
  const renderTarget = tashkeel && item.renderAr ? item.renderAr : undefined;
  // Memory mode: the "lawh" method — write it out with nothing to copy from,
  // then check against the real text, instead of always typing over a guide.
  const [memoryMode, setMemoryMode] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { typed, onChange, reset, fixFirstMistake, charStatuses, progressPct, liveErrors, wrongLanguageSuspected } =
    useTypingSession(target, (r) => {
      onCharsTyped(r.chars);
      onPracticeComplete({ kind: item.kind, memoryMode });
      setResult(r);
    });

  const translationBlock = useMemo(
    () => item.translations.map((t, i) => <p key={i} className="mb-2 last:mb-0">{t}</p>),
    [item]
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-6 pb-24">
      <button onClick={onExit} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← {chooseAnotherLabel}
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
          <div className="flex items-center justify-center gap-3">
            {onNext && (
              <button
                onClick={onNext}
                className="px-8 py-3 rounded-full font-bold text-white transition-transform hover:scale-105"
                style={{ background: "var(--color-nur)" }}
              >
                Next page →
              </button>
            )}
            <button
              onClick={onExit}
              className="px-8 py-3 rounded-full font-bold"
              style={{
                background: onNext ? "var(--color-parchment-dim)" : "var(--color-nur)",
                color: onNext ? "var(--color-ink)" : "#fff",
              }}
            >
              {chooseAnotherLabel}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={() => {
                setTashkeel((t) => !t);
                reset();
                setRevealed(false);
              }}
              title="Toggle whether short vowels / shaddah / sukoon are required"
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: tashkeel ? "var(--color-nur)" : "var(--color-parchment-dim)",
                color: tashkeel ? "#fff" : "var(--color-ink)",
              }}
            >
              {tashkeel ? "✓ " : ""}With tashkeel
            </button>
            <button
              onClick={() => {
                setMemoryMode((m) => !m);
                reset();
                setRevealed(false);
              }}
              title="Write it out with nothing to copy from, then check it against the real text — the lawh/slate method"
              className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: memoryMode ? "var(--color-nur)" : "var(--color-parchment-dim)",
                color: memoryMode ? "#fff" : "var(--color-ink)",
              }}
            >
              {memoryMode ? "✓ " : ""}✍️ From memory
            </button>
          </div>
          {memoryMode && !revealed ? (
            <div className="flex items-center justify-center gap-4 mb-4">
              <StatsBar errors={0} progressPct={progressPct} />
              <button
                onClick={() => setRevealed(true)}
                disabled={typed.length === 0}
                title="Reveal the real text and see how you did"
                className="text-xs font-bold shrink-0 opacity-80 hover:opacity-100 underline disabled:opacity-30"
                style={{ color: "var(--color-nur)" }}
              >
                ✅ Check my writing
              </button>
              <button
                onClick={() => {
                  reset();
                  setRevealed(false);
                }}
                title="Clear what you've typed and start over"
                className="text-xs font-bold shrink-0 opacity-60 hover:opacity-100 underline"
                style={{ color: "var(--color-ink)" }}
              >
                ↺ Start over
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 mb-4">
              <StatsBar errors={liveErrors} progressPct={progressPct} />
              <button
                onClick={() => {
                  reset();
                  setRevealed(false);
                }}
                title="Clear what you've typed and start over"
                className="text-xs font-bold shrink-0 opacity-60 hover:opacity-100 underline"
                style={{ color: "var(--color-ink)" }}
              >
                ↺ Start over
              </button>
            </div>
          )}
          {(!memoryMode || revealed) && liveErrors > 0 && typed.length >= target.length && (
            <p className="text-center text-xs mb-4" style={{ color: "var(--color-clay)" }}>
              There's a mistake hiding in what you've typed.{" "}
              <button onClick={fixFirstMistake} className="font-bold underline">
                Erase back to it
              </button>{" "}
              and retype from there, or hit "Start over".
            </p>
          )}
          {wrongLanguageSuspected && <LanguageWarningBanner onNeedHelp={onNeedKeyboardHelp} />}
          <div className="mb-6">
            <TypingBox
              target={target}
              typed={typed}
              statuses={charStatuses}
              onChange={onChange}
              hideText={memoryMode && !revealed}
              renderText={renderTarget}
            />
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
