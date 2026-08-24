import { ALL_KEYS, FINGER_COLORS, FINGER_LABELS } from "../data/keyboard";
import { GLYPH_INFO } from "../data/letterNames";
import type { GlyphIntro } from "../data/curriculum";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { FingerGuide } from "./FingerGuide";

interface Props {
  newGlyphs: GlyphIntro[];
  learned: Set<string>;
  onStart: () => void;
}

export function LetterIntroCard({ newGlyphs, learned, onStart }: Props) {
  const items = newGlyphs
    .map((intro) => {
      const key = ALL_KEYS.find((k) => k.id === intro.keyId);
      if (!key) return null;
      const glyph = intro.shift ? key.shift : key.base;
      if (!glyph) return null;
      const info = GLYPH_INFO[glyph];
      return { glyph, key, shift: intro.shift, info };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const isBigBatch = items.length > 3;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h3 className="text-lg font-bold mb-1" style={{ color: "var(--color-ink)" }}>
        {items.length === 1 ? "New letter" : "New letters"}
      </h3>
      <p className="text-sm opacity-60 mb-6">Learn each one, then we'll practice with real words.</p>

      <div className={isBigBatch ? "grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8" : "flex flex-col gap-4 mb-8"}>
        {items.map(({ glyph, key, shift, info }) => (
          <div
            key={glyph}
            className={isBigBatch ? "rounded-xl border p-3 bg-white" : "rounded-2xl border p-5 bg-white flex items-center gap-5 text-left"}
            style={{ borderColor: "var(--color-parchment-dim)" }}
          >
            <div
              className="font-arabic font-bold shrink-0"
              style={{ fontSize: isBigBatch ? 32 : 48, color: "var(--color-nur)" }}
            >
              {glyph}
            </div>
            <div>
              {info && (
                <>
                  <div className={isBigBatch ? "font-bold text-sm" : "font-bold text-lg"} style={{ color: "var(--color-ink)" }}>
                    {info.name}
                  </div>
                  {!isBigBatch && <div className="text-sm opacity-70 mb-2">Sounds like {info.sound}</div>}
                </>
              )}
              <div
                className={isBigBatch ? "text-[11px] mt-1" : "text-sm inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-full"}
                style={
                  isBigBatch
                    ? { color: FINGER_COLORS[key.finger] }
                    : { background: FINGER_COLORS[key.finger] + "1a", color: FINGER_COLORS[key.finger], fontWeight: 700 }
                }
              >
                {isBigBatch
                  ? `"${key.id}" key`
                  : `Press the "${key.id}" key${shift ? " + Shift" : ""} — ${FINGER_LABELS[key.finger]}`}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border p-5 bg-white mb-8" style={{ borderColor: "var(--color-parchment-dim)" }}>
        <p className="text-xs uppercase tracking-wide opacity-50 font-bold mb-4">Find it on the keyboard</p>
        <FingerGuide highlightGlyphs={items.map((i) => i.glyph)} />
        <VirtualKeyboard learned={learned} highlightGlyphs={items.map((i) => i.glyph)} />
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 rounded-full font-bold text-white transition-transform hover:scale-105"
        style={{ background: "var(--color-nur)" }}
      >
        Start practicing →
      </button>
    </div>
  );
}
