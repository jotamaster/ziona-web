"use client";

import { useEffect, useState } from "react";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type MemberAvatarProps = {
  name: string;
  imageUrl: string | null;
  /** Tamaño del círculo (Tailwind), p. ej. `h-7 w-7` o `h-8 w-8 sm:h-9 sm:w-9`. */
  dimensionsClassName?: string;
  className?: string;
};

export function MemberAvatar({
  name,
  imageUrl,
  dimensionsClassName = "h-8 w-8 sm:h-9 sm:w-9",
  className = "",
}: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const showPhoto = Boolean(imageUrl?.trim()) && !failed;

  return (
    <span
      className={`relative flex shrink-0 overflow-hidden rounded-full border border-white/30 bg-[var(--neu-bg-subtle)] dark:border-white/10 ${dimensionsClassName} ${className}`.trim()}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL del perfil (p. ej. Google)
        <img
          src={imageUrl!}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center text-xxs font-semibold text-[var(--neu-accent)]"
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
    </span>
  );
}
