"use client";

type UserMenuHeaderProps = {
  name: string;
  email?: string | null;
  imageUrl?: string | null;
};

export function UserMenuHeader({ name, email, imageUrl }: UserMenuHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] pb-4">
      <div className="neu-inset flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa de proveedor OAuth
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-[var(--neu-accent)]" aria-hidden>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-[var(--neu-text)]">{name}</p>
        {email ? (
          <p className="truncate text-sm text-[var(--neu-text-muted)]">{email}</p>
        ) : null}
      </div>
    </div>
  );
}
