import { overallScore } from "../lib/scoring";

// Gauge-style results panel, styled after a "Learn to Type" community's
// results screen an instructor sent as inspiration: gradient slider gauges
// per metric with a marker dot, plus a star badge — rather than plain
// number-stat blocks.
interface Props {
  wpm: number;
  accuracy: number;
  stars: 1 | 2 | 3;
}

export function ResultsPanel({ wpm, accuracy, stars }: Props) {
  const overall = overallScore(accuracy, wpm);

  return (
    <div
      className="max-w-sm mx-auto rounded-2xl border bg-white p-5 text-left"
      style={{ borderColor: "var(--color-parchment-dim)" }}
    >
      <div className="text-center text-3xl mb-4">
        {"⭐".repeat(stars)}
        {"☆".repeat(3 - stars)}
      </div>
      <GaugeRow label="Overall rating" value={overall} displayValue={String(overall)} min={0} max={100} />
      <GaugeRow label="Speed" value={wpm} displayValue={`${wpm} WPM`} min={0} max={60} />
      <GaugeRow label="Accuracy" value={accuracy} displayValue={`${accuracy}%`} min={0} max={100} />
    </div>
  );
}

function GaugeRow({
  label,
  value,
  displayValue,
  min,
  max,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-end mb-1.5">
        <span className="text-xs font-bold" style={{ color: "var(--color-nur)" }}>
          {label} {displayValue}
        </span>
      </div>
      <div className="relative h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, var(--color-gold-light), var(--color-nur))" }}>
        <div
          className="absolute top-1/2 rounded-full border-2 border-white"
          style={{
            left: `${pct}%`,
            transform: "translate(-50%, -50%)",
            width: 13,
            height: 13,
            background: "var(--color-nur-dark)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] opacity-50 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
