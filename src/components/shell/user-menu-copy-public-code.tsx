"use client";

import { useCallback, useState } from "react";

type UserMenuCopyPublicCodeProps = {
  publicCode: string | null;
};

export function UserMenuCopyPublicCode({ publicCode }: UserMenuCopyPublicCodeProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    if (!publicCode) return;
    try {
      await navigator.clipboard.writeText(publicCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [publicCode]);

  if (!publicCode) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 border-b border-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] pb-3 pt-1">
      <p className="min-w-0 flex-1 text-sm leading-snug">
        <span className="text-[var(--neu-text-muted)]">Copiar ID: </span>
        <span className="break-all font-mono text-[length:0.8125rem] text-[var(--neu-text)]">{publicCode}</span>
      </p>
      <button
        type="button"
        className="neu-focus shrink-0 rounded-[var(--neu-radius-sm)] p-2 text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] hover:text-[var(--neu-text)] active:scale-[0.98]"
        onClick={() => void copy()}
        aria-label={copied ? "Copiado al portapapeles" : "Copiar ID al portapapeles"}
        title={copied ? "Copiado" : "Copiar al portapapeles"}
      >
        {copied ? <CheckIcon /> : <ClipboardIcon />}
      </button>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" strokeLinecap="round" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
