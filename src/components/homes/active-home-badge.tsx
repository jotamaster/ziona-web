type ActiveHomeBadgeProps = {
  className?: string;
};

export function ActiveHomeBadge({ className = "" }: ActiveHomeBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-[color-mix(in_srgb,var(--neu-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--neu-accent)_12%,transparent)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--neu-accent)] ${className}`.trim()}
    >
      Activo
    </span>
  );
}
