import { KEYBOARD_ROWS, FINGER_COLORS, keyForGlyph } from "../data/keyboard";

interface Props {
  learned: Set<string>;
  targetChar?: string | null;
  /** Multiple glyphs highlighted at once (e.g. every new letter on an intro page), instead of one active target. */
  highlightGlyphs?: string[];
}

export function VirtualKeyboard({ learned, targetChar, highlightGlyphs }: Props) {
  const activeKeyId = targetChar ? keyForGlyph(targetChar)?.key.id : null;
  const activeShifted = targetChar ? keyForGlyph(targetChar)?.shifted : false;
  const highlightKeyIds = new Set((highlightGlyphs ?? []).map((g) => keyForGlyph(g)?.key.id).filter(Boolean));

  return (
    <div className="select-none">
      {KEYBOARD_ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-1.5 mb-1.5" dir="ltr">
          {row.map((key) => {
            const baseKnown = key.base ? learned.has(key.base) : false;
            const shiftKnown = key.shift ? learned.has(key.shift) : false;
            const isActive = key.id === activeKeyId || highlightKeyIds.has(key.id);
            const color = FINGER_COLORS[key.finger];
            return (
              <div
                key={key.id}
                className="relative w-11 h-12 rounded-lg border flex flex-col items-center justify-center text-sm transition-all"
                style={{
                  borderColor: isActive ? color : "var(--color-parchment-dim)",
                  background: isActive ? color + "22" : baseKnown ? "#fff" : "var(--color-parchment-dim)",
                  boxShadow: isActive ? `0 0 0 2px ${color}` : "none",
                  opacity: baseKnown || shiftKnown || isActive ? 1 : 0.45,
                }}
              >
                {/* The physical key label — this is an English keyboard with no Arabic
                    stickers, so this is the only way to know which key to actually press. */}
                <span
                  className="absolute top-0.5 left-1 text-[8px] font-bold uppercase leading-none"
                  style={{ color: isActive ? color : "var(--color-ink)", opacity: isActive ? 0.9 : 0.45 }}
                >
                  {key.id}
                </span>
                {key.shift && (
                  <span
                    className="text-[10px] leading-none"
                    style={{
                      color: activeShifted && isActive ? color : "var(--color-ink)",
                      opacity: shiftKnown ? 0.8 : 0.35,
                      fontWeight: activeShifted && isActive ? 800 : 400,
                    }}
                  >
                    {key.shift}
                  </span>
                )}
                <span
                  className="font-arabic text-base leading-none mt-0.5"
                  style={{
                    color: !activeShifted && isActive ? color : "var(--color-ink)",
                    opacity: baseKnown ? 1 : 0.35,
                    fontWeight: !activeShifted && isActive ? 800 : 500,
                  }}
                >
                  {key.base}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
