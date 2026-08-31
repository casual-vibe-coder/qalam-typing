interface Props {
  onBack: () => void;
}

const GUIDES = [
  {
    os: "Mac",
    emoji: "💻",
    warning:
      "macOS offers THREE Arabic options — \"Arabic\", \"Arabic - PC\", and \"Arabic - QWERTY\". Only \"Arabic - PC\" matches this course. The plain \"Arabic\" option rearranges the whole bottom row and every vowel mark, so lessons will look completely wrong if you pick it.",
    steps: [
      "Open System Settings → Keyboard → Input Sources (or \"Keyboard, Text Input\" on older macOS).",
      "Click the + button, search \"Arabic\", and add the option named exactly \"Arabic - PC\" — not \"Arabic\" or \"Arabic - QWERTY\".",
      "A flag/language icon appears in your menu bar — click it (or press Globe 🌐 / Ctrl+Space) to switch to \"Arabic - PC\" before typing.",
    ],
  },
  {
    os: "Windows",
    emoji: "🪟",
    steps: [
      "Open Settings → Time & Language → Language & Region.",
      "Click \"Add a language\", search \"Arabic\", and install it — Windows only offers one variant, \"Arabic (101)\", which is what this course is built on.",
      "Press Windows key + Space to switch between your languages while typing.",
    ],
  },
  {
    os: "iPhone / iPad",
    emoji: "📱",
    warning:
      "The on-screen Arabic keyboard doesn't have a physical Shift key, so it can't teach real touch-typing finger positions or vowel-mark shortcuts. For these lessons, connect a physical Bluetooth/USB keyboard and set it to \"Arabic - PC\" in Settings → General → Keyboard → Hardware Keyboard.",
    steps: [
      "Open Settings → General → Keyboard → Keyboards → Add New Keyboard.",
      "Choose Arabic — this is fine for messaging, but for lessons here you'll want a physical keyboard (see note above).",
      "While typing, tap-and-hold the globe 🌐 key (or tap it repeatedly) to switch to Arabic.",
    ],
  },
  {
    os: "Android",
    emoji: "🤖",
    warning:
      "Same as iPhone: the on-screen keyboard has no physical Shift key, so vowel marks and finger-position drills won't work the same way. Connect a physical keyboard set to an Arabic (101)-compatible layout for these lessons.",
    steps: [
      "Open Settings → System → Languages & input → On-screen keyboard → your keyboard app (e.g. Gboard) → Languages.",
      "Tap \"Add keyboard\" and choose Arabic.",
      "Tap the globe/language icon on your keyboard to switch to Arabic while typing.",
    ],
  },
];

export function KeyboardSetupScreen({ onBack }: Props) {
  return (
    <div className="max-w-2xl mx-auto py-10 px-6 pb-24">
      <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 mb-4">
        ← Back
      </button>
      <h1 className="text-2xl font-extrabold mb-2" style={{ color: "var(--color-ink)" }}>
        Get an Arabic keyboard on your device
      </h1>
      <p className="opacity-70 mb-4">
        You don't need to buy anything or memorize a new physical layout — your existing keyboard doesn't have
        Arabic letters printed on it, but your device can remap what each key types in software. Once it's
        added, switching between English and Arabic is one click or keyboard shortcut, and you can switch
        back any time.
      </p>

      <div
        className="rounded-xl p-4 text-sm mb-8"
        style={{ background: "rgba(220,53,69,0.1)", color: "var(--color-clay)" }}
      >
        <strong>Important:</strong> some operating systems offer more than one "Arabic" keyboard, and they
        put letters and vowel marks on completely different keys from each other. This course is built on the
        standard <strong>Arabic (101) / "Arabic - PC"</strong> layout — the same one Windows uses and one of
        the options on Mac. If you pick a different Arabic variant, the on-screen guide in each lesson won't
        match what your keys actually type.
      </div>

      <div className="flex flex-col gap-5">
        {GUIDES.map((g) => (
          <div key={g.os} className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--color-parchment-dim)" }}>
            <div className="font-extrabold text-lg mb-3 flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
              <span>{g.emoji}</span> {g.os}
            </div>
            {g.warning && (
              <div
                className="rounded-lg p-3 text-xs mb-3"
                style={{ background: "rgba(220,53,69,0.1)", color: "var(--color-clay)" }}
              >
                ⚠️ {g.warning}
              </div>
            )}
            <ol className="list-decimal list-inside space-y-1.5 text-sm opacity-80">
              {g.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <div
        className="mt-8 rounded-xl p-4 text-sm"
        style={{ background: "var(--color-parchment-dim)", color: "var(--color-ink)" }}
      >
        <strong>Tip:</strong> once Arabic is added, the physical keys don't move — they just now type a
        different letter. That's exactly what the on-screen keyboard in each lesson shows you: which physical
        key to press for the Arabic letter on screen.
      </div>
    </div>
  );
}
