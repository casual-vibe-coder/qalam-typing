import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CharStatus } from "../hooks/useTypingSession";
import { toArabicIndicDigits } from "../lib/arabic";

interface Props {
  target: string;
  typed: string;
  statuses: CharStatus[];
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

const HAS_HIGHLIGHT_API =
  typeof CSS !== "undefined" && "highlights" in CSS && typeof Highlight !== "undefined";

/** Group ranges of the same status into [start, end) spans over the char indices. */
function statusRuns(statuses: CharStatus[]): { start: number; end: number; status: CharStatus }[] {
  const runs: { start: number; end: number; status: CharStatus }[] = [];
  for (let i = 0; i < statuses.length; i++) {
    const last = runs[runs.length - 1];
    if (last && last.status === statuses[i]) {
      last.end = i + 1;
    } else {
      runs.push({ start: i, end: i + 1, status: statuses[i] });
    }
  }
  return runs;
}

interface Segment {
  text: string;
  status: CharStatus;
}

/** Legacy per-span renderer, kept only as a fallback for browsers without the
 * CSS Custom Highlight API. Splitting Arabic text across sibling <span>s
 * breaks cursive joining at every status boundary — i.e. at whichever
 * character you're currently on — which reads as a stray gap "between every
 * letter" as you type. The Highlight API path below avoids this entirely by
 * keeping the whole string as one text node and painting colors on top of
 * it, so prefer that path whenever it's available. */
function buildSegments(target: string, statuses: CharStatus[]): Segment[] {
  return statusRuns(statuses).map(({ start, end, status }) => ({
    text: target.slice(start, end),
    status,
  }));
}

function colorFor(status: CharStatus): string {
  switch (status) {
    case "correct":
      return "var(--color-nur)";
    case "incorrect":
      return "var(--color-clay)";
    case "current":
      return "var(--color-ink)";
    default:
      return "#c7cad3";
  }
}

export function TypingBox({ target, typed, statuses, onChange, autoFocus = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);
  const [isFocused, setIsFocused] = useState(autoFocus);
  const displayText = useMemo(() => toArabicIndicDigits(target), [target]);
  const segments = useMemo(() => (HAS_HIGHLIGHT_API ? [] : buildSegments(target, statuses)), [target, statuses]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [target, autoFocus]);

  // Paint per-character status as CSS highlights over a single, unbroken text
  // node instead of splitting the DOM into per-status <span>s. Highlights are
  // a paint-time overlay — they never touch the underlying text run, so
  // Arabic letters keep joining correctly across every status boundary, no
  // matter which character you're currently on.
  useLayoutEffect(() => {
    if (!HAS_HIGHLIGHT_API) return;
    const node = textRef.current?.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const byStatus: Record<string, Range[]> = { correct: [], incorrect: [], current: [] };
    for (const { start, end, status } of statusRuns(statuses)) {
      if (status === "pending") continue;
      const range = new Range();
      range.setStart(node, start);
      range.setEnd(node, end);
      byStatus[status].push(range);
    }

    CSS.highlights.set("qalam-correct", new Highlight(...byStatus.correct));
    CSS.highlights.set("qalam-incorrect", new Highlight(...byStatus.incorrect));
    CSS.highlights.set("qalam-current", new Highlight(...byStatus.current));

    return () => {
      CSS.highlights.delete("qalam-correct");
      CSS.highlights.delete("qalam-incorrect");
      CSS.highlights.delete("qalam-current");
    };
  }, [displayText, statuses]);

  return (
    <div className="relative w-full" onClick={() => inputRef.current?.focus()}>
      <div
        ref={textRef}
        dir="rtl"
        className="font-arabic text-3xl md:text-4xl leading-relaxed bg-white border-2 rounded-2xl px-6 py-8 cursor-text break-words"
        style={{ borderColor: isFocused ? "var(--color-parchment-dim)" : "var(--color-gold)", color: "#c7cad3" }}
      >
        {HAS_HIGHLIGHT_API
          ? displayText
          : segments.map((seg, i) => (
              <span
                key={i}
                style={{
                  color: colorFor(seg.status),
                  background: seg.status === "incorrect" ? "rgba(220,53,69,0.12)" : "transparent",
                  borderBottom: seg.status === "current" ? "3px solid var(--color-gold)" : "3px solid transparent",
                }}
              >
                {toArabicIndicDigits(seg.text)}
              </span>
            ))}
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
          // forces it to commit. Skip pushing state updates while composing
          // so the browser's own buffer is left alone; onCompositionEnd
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
