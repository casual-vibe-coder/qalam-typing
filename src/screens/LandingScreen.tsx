interface Props {
  onStart: () => void;
  onSetupKeyboard: () => void;
}

export function LandingScreen({ onStart, onSetupKeyboard }: Props) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <div className="text-6xl mb-4">قلم</div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight" style={{ color: "var(--color-ink)" }}>
        Learn Arabic touch typing
        <br />
        <span style={{ color: "var(--color-gold-dark)" }}>with the words you'll actually use</span>
      </h1>
      <p className="text-lg opacity-70 max-w-xl mx-auto mb-10">
        Free, gamified lessons that build real touch-typing muscle memory — using high-frequency
        Fusha vocabulary and real Hadith &amp; Qur'an text, not random letter drills.
      </p>

      <button
        onClick={onStart}
        className="px-10 py-4 rounded-full font-bold text-lg text-white transition-transform hover:scale-105 shadow-lg"
        style={{ background: "var(--color-nur)" }}
      >
        Start typing — free
      </button>
      <div>
        <button onClick={onSetupKeyboard} className="mt-4 text-sm underline opacity-60 hover:opacity-100 block mx-auto">
          Don't have an Arabic keyboard on your device yet? →
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left">
        <Feature
          emoji="⌨️"
          title="Real muscle memory"
          body="Same finger-position pedagogy every touch-typing course uses — home row first, building outward."
        />
        <Feature
          emoji="📊"
          title="Frequency-tailored"
          body="Every practice word is real, common Fusha vocabulary — filtered to letters you've already learned."
        />
        <Feature
          emoji="📖"
          title="Sunnah &amp; Qur'an"
          body="Type real, verified hadith and short surahs, with the translation right below."
        />
      </div>
    </div>
  );
}

function Feature({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "var(--color-parchment-dim)" }}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="font-bold mb-1" style={{ color: "var(--color-ink)" }}>
        {title}
      </div>
      <div className="text-sm opacity-70">{body}</div>
    </div>
  );
}
