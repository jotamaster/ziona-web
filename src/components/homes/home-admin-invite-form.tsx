"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createInvitationAction } from "@/lib/invitations/actions";

type HomeAdminInviteFormProps = {
  homeId: string;
};

export function HomeAdminInviteForm({ homeId }: HomeAdminInviteFormProps) {
  const router = useRouter();
  const inputId = useId();
  const [publicCode, setPublicCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createInvitationAction(homeId, publicCode);
      if (result.ok) {
        setPublicCode("");
        router.refresh();
        return;
      }
      setError(result.message);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--neu-text-muted)]">
          Código público de la persona a invitar
        </label>
        <input
          id={inputId}
          type="text"
          name="publicCode"
          autoComplete="off"
          maxLength={64}
          value={publicCode}
          onChange={(e) => setPublicCode(e.target.value)}
          placeholder="Ej. ABC123"
          className="neu-inset w-full rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-base text-[var(--neu-text)] outline-none placeholder:text-[var(--neu-text-muted)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
          disabled={pending}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-err` : undefined}
        />
        {error ? (
          <p id={`${inputId}-err`} className="mt-2 text-sm text-[var(--neu-text-muted)]" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-60"
        disabled={pending}
        aria-busy={pending}
      >
        {pending ? "Enviando…" : "Enviar invitación"}
      </button>
    </form>
  );
}
