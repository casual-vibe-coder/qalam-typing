import { useEffect, useMemo, useRef, useState } from "react";
import type { CharStatus } from "../hooks/useTypingSession";
import { toArabicIndicDigits } from "../lib/arabic";

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
  const isComposingRef = useRef(false);
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
                  : "#c7cad3";
          return (
            <span
              key={i}
              style={{
                color,
                background: seg.status === "incorrect" ? "rgba(220,53,69,0.12)" : "transparent",
                borderBottom: seg.status === "current" ? "3px solid var(--color-gold)" : "3px solid transparent",
              }}
            >
              {/* Reading-only: shown as Arabic-Indic digits even though the underlying
                  target/typed stay Western digits — that's genuinely what every key in
                  this layout produces (see data/keyboard.ts), so comparison must match it. */}
              {toArabicIndicDigits(seg.text)}
            </span>
          );
        })}
      </div>
      {!isFocused && (
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="absolute inset-0 w-full h-full flex items-center justify-center gap-2 rounded-2xl font-bold text-sm animate-pulse"
          style={{ background: "rgba(11,14,20,0.55)", color: "#fff" }}
        >
          👆 Tap here to start typing
        </button>
      )}
      <input
        ref={inputRef}
        type="text"
        dir="rtl"
        value={typed}
        onChange={(e) => {
          // Some Arabic keyboard layouts (notably ones that compose hamza
          // seats via dead-key sequences) hold keystrokes in the browser's
          // native IME composition buffer. Because this input is fully
          // controlled, re-rendering with `value={typed}` mid-composition
          // resets the DOM node and cancels that native preview — the
          // composition then never resolves until something (a space)
          // forces it to commit, which looks like "needs a space after
          // every letter". Skip pushing state updates while composing so
          // the browser's own buffer is left alone; onCompositionEnd
          // flushes the real value once it settles.
          if (isComposingRef.current) return;
          onChange(e.target.value);
        }}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={(e) => {
          isComposingRef.current = false;
          onChange(e.currentTarget.value);
        }}
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
