interface Props {
  onNeedHelp: () => void;
}

export function LanguageWarningBanner({ onNeedHelp }: Props) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
      style={{ background: "rgba(182,84,58,0.1)", color: "var(--color-clay)" }}
    >
      <span className="text-lg">🌐</span>
      <span className="flex-1">
        That doesn't look like Arabic — your keyboard's input language might still be set to English.
      </span>
      <button onClick={onNeedHelp} className="font-bold underline shrink-0">
        How do I switch it?
      </button>
    </div>
  );
}
