export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando">
      <div className="neu-raised h-9 max-w-xs animate-pulse rounded-[var(--neu-radius-md)] bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)]" />
      <div className="neu-raised h-40 w-full animate-pulse rounded-[var(--neu-radius-lg)] bg-[color-mix(in_srgb,var(--neu-text)_5%,transparent)]" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="neu-raised h-24 animate-pulse rounded-[var(--neu-radius-md)] bg-[color-mix(in_srgb,var(--neu-text)_5%,transparent)]" />
        <div className="neu-raised h-24 animate-pulse rounded-[var(--neu-radius-md)] bg-[color-mix(in_srgb,var(--neu-text)_5%,transparent)]" />
      </div>
    </div>
  );
}
