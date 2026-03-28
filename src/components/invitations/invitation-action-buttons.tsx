"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  acceptInvitationAction,
  cancelInvitationAction,
  rejectInvitationAction,
} from "@/lib/invitations/actions";

export function CancelSentInvitationButton({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        className="neu-focus rounded-[var(--neu-radius-sm)] px-3 py-1.5 text-sm font-medium text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] hover:text-[var(--neu-text)] disabled:opacity-60"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await cancelInvitationAction(invitationId);
            if (!result.ok) {
              setError(result.message);
              return;
            }
            router.refresh();
          });
        }}
      >
        {pending ? "…" : "Cancelar"}
      </button>
      {error ? (
        <p className="max-w-[12rem] text-right text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AcceptRejectReceivedButtons({ invitationId }: { invitationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: typeof acceptInvitationAction) => {
    setError(null);
    startTransition(async () => {
      const result = await fn(invitationId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-3 py-1.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] disabled:opacity-60"
          disabled={pending}
          onClick={() => run(acceptInvitationAction)}
        >
          Aceptar
        </button>
        <button
          type="button"
          className="neu-focus rounded-[var(--neu-radius-sm)] px-3 py-1.5 text-sm font-medium text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] disabled:opacity-60"
          disabled={pending}
          onClick={() => run(rejectInvitationAction)}
        >
          Rechazar
        </button>
      </div>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs text-red-700 dark:text-red-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
