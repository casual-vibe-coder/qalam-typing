import { useEffect, useMemo, useRef, useState } from "react";
import type { CharStatus } from "../hooks/useTypingSession";

interface Props {
  target: string;
  typed: string;
  statuses: CharStatus[];
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

interface Segment {
  text: string;
  status: CharStatus;
}

// Arabic is cursive — letters join to their neighbors. Wrapping every
// character in its own <span> (one DOM node per glyph) breaks that joining
// in most browsers, rendering each letter in isolated form with visible
// gaps instead of connected script. Grouping consecutive same-status
// characters into a single span keeps each run's text as one contiguous
// text node, so shaping stays correct; only the (rare) status boundary
// itself can show a break, which is normal and expected.
function buildSegments(target: string, statuses: CharStatus[]): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < target.length; i++) {
    const status = statuses[i] ?? "pending";
    const last = segments[segments.length - 1];
    if (last && last.status === status) {
      last.text += target[i];
    } else {
      segments.push({ text: target[i], status });
    }
  }
  return segments;
}

export function TypingBox({ target, typed, statuses, onChange, autoFocus = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const segments = useMemo(() => buildSegments(target, statuses), [target, statuses]);
  const [isFocused, setIsFocused] = useState(autoFocus);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [target, autoFocus]);

  return (
    <div className="relative w-full" onClick={() => inputRef.current?.focus()}>
      <div
        dir="rtl"
        className="font-arabic text-3xl md:text-4xl leading-relaxed bg-white border-2 rounded-2xl px-6 py-8 cursor-text break-words"
        style={{ borderColor: isFocused ? "var(--color-parchment-dim)" : "var(--color-gold)" }}
      >
        {segments.map((seg, i) => {
          const color =
            seg.status === "correct"
              ? "var(--color-nur)"
              : seg.status === "incorrect"
                ? "var(--color-clay)"
                : seg.status === "current"
                  ? "var(--color-ink)"
                  : "#c9c2ae";
          return (
            <span
              key={i}
              style={{
                color,
                background: seg.status === "incorrect" ? "rgba(182,84,58,0.12)" : "transparent",
                borderBottom: seg.status === "current" ? "3px solid var(--color-gold)" : "3px solid transparent",
              }}
            >
              {seg.text}
            </span>
          );
        })}
      </div>
      {!isFocused && (
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 rounded-2xl font-bold text-sm animate-pulse"
          style={{ background: "rgba(23,37,31,0.55)", color: "#fff" }}
        >
          👆 Tap here to start typing
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        dir="rtl"
        value={typed}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text"
        aria-label="Type the Arabic text shown above"
      />
    </div>
  );
}
