import type { Home } from "@/lib/homes/types";

type ActiveHomeTitleProps = {
  activeHome: Home | null;
  emptyLabel?: string;
};

export function ActiveHomeTitle({
  activeHome,
  emptyLabel = "Sin hogar activo",
}: ActiveHomeTitleProps) {
  const text = activeHome?.name ?? emptyLabel;

  return (
    <p className="truncate text-base font-semibold tracking-tight text-[var(--neu-text)]" title={text}>
      {text}
    </p>
  );
}
