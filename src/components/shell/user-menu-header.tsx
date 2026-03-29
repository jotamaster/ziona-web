"use client";

import { useEffect, useState } from "react";

type UserMenuHeaderProps = {
  name: string;
  email?: string | null;
  imageUrl?: string | null;
  onClose: () => void;
};

export function UserMenuHeader({ name, email, imageUrl, onClose }: UserMenuHeaderProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const showPhoto = Boolean(imageUrl) && !imageFailed;

  return (
    <div className="flex items-start gap-3 border-b border-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] pb-4">
      <div className="neu-inset flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL externa de proveedor OAuth
          <img
            src={imageUrl!}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="text-lg font-semibold text-[var(--neu-accent)]" aria-hidden>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="truncate font-semibold text-[var(--neu-text)]">{name}</p>
        {email ? (
          <p className="truncate text-sm text-[var(--neu-text-muted)]">{email}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="neu-focus -mr-1 -mt-1 shrink-0 rounded-[var(--neu-radius-sm)] p-2 text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] hover:text-[var(--neu-text)] active:scale-[0.98]"
        aria-label="Cerrar menú"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
