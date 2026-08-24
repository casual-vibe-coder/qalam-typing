import { FINGER_COLORS, FINGER_LABELS, keyForGlyph, type Finger } from "../data/keyboard";

// A schematic pair of "hands" — not a photo, just 8 colored capsules matching
// the same per-finger colors used on the virtual keyboard — that raises and
// labels whichever finger is responsible for the current/next key, so a
// learner sees which finger to move before they press it, not just which key.
const LEFT_FINGERS: Finger[] = ["l-pinky", "l-ring", "l-middle", "l-index"];
const RIGHT_FINGERS: Finger[] = ["r-index", "r-middle", "r-ring", "r-pinky"];

interface Props {
  /** Single active glyph — the next character to type, during a drill. */
  targetChar?: string | null;
  /** Multiple glyphs highlighted at once — used on letter-intro pages. */
  highlightGlyphs?: string[];
}

export function FingerGuide({ targetChar, highlightGlyphs }: Props) {
  const active = new Set<Finger>();
  if (targetChar) {
    const finger = keyForGlyph(targetChar)?.key.finger;
    if (finger) active.add(finger);
  }
  for (const g of highlightGlyphs ?? []) {
    const finger = keyForGlyph(g)?.key.finger;
    if (finger) active.add(finger);
  }

  return (
    <div className="flex items-end justify-center gap-8 mb-3 select-none" dir="ltr">
      <div className="flex items-end gap-1.5">
        {LEFT_FINGERS.map((f) => (
          <FingerCapsule key={f} finger={f} isActive={active.has(f)} />
        ))}
      </div>
      <div className="flex items-end gap-1.5">
        {RIGHT_FINGERS.map((f) => (
          <FingerCapsule key={f} finger={f} isActive={active.has(f)} />
        ))}
      </div>
    </div>
  );
}

function FingerCapsule({ finger, isActive }: { finger: Finger; isActive: boolean }) {
  const color = FINGER_COLORS[finger];
  return (
    <div
      className="flex flex-col items-center transition-transform duration-150"
      style={{ transform: isActive ? "translateY(-6px)" : "none" }}
    >
      <div
        className="text-[9px] font-bold mb-0.5 whitespace-nowrap transition-opacity"
        style={{ color, opacity: isActive ? 1 : 0 }}
      >
        {FINGER_LABELS[finger]}
      </div>
      <div
        className="rounded-full transition-all duration-150"
        style={{
          width: isActive ? 16 : 11,
          height: isActive ? 36 : 24,
          background: isActive ? color : color + "3a",
          boxShadow: isActive ? `0 0 0 3px ${color}33` : "none",
        }}
      />
    </div>
  );
}
