interface Props {
  wpm?: number;
  accuracy?: number;
  errors: number;
  progressPct: number;
}

export function StatsBar({ wpm, accuracy, errors, progressPct }: Props) {
  return (
    <div className="flex items-center gap-6 justify-center flex-wrap">
      {wpm !== undefined && <Stat label="WPM" value={wpm} />}
      {accuracy !== undefined && <Stat label="Accuracy" value={`${accuracy}%`} />}
      <Stat label="Errors" value={errors} />
      <div className="w-40 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--color-parchment-dim)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progressPct}%`, background: "var(--color-nur)" }}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-extrabold" style={{ color: "var(--color-ink)" }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide" style={{ color: "var(--color-ink)", opacity: 0.5 }}>
        {label}
      </div>
    </div>
  );
}
