"use client";

import type { BackendSpaceMemberDto } from "@/lib/api/backend-client";
import { NeuSurface } from "@/components/ui/neu-surface";
import { MemberAvatar } from "@/components/ui/member-avatar";

function roleLabel(role: BackendSpaceMemberDto["role"]): string {
  return role === "owner" ? "Admin" : "Miembro";
}

type SpaceMembersStripProps = {
  members: BackendSpaceMemberDto[] | null;
  loading: boolean;
  error: string | null;
};

export function SpaceMembersStrip({ members, loading, error }: SpaceMembersStripProps) {
  return (
    <NeuSurface variant="raised" className="text-xxs p-2 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <h2 className="text-xs font-semibold tracking-tight text-[var(--neu-text)] sm:text-sm pl-1">Miembros</h2>
        {loading ? (
          <span className="text-xxs text-[var(--neu-text-muted)] sm:text-xs">Cargando…</span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-xxs text-[var(--neu-text-muted)] sm:text-xs" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && members && members.length === 0 ? (
        <p className="mt-3 text-xxs text-[var(--neu-text-muted)] sm:text-xs">No hay miembros para mostrar.</p>
      ) : null}

      {!loading && members && members.length > 0 ? (
        <ul
          className="mt-1 flex min-h-[3rem] flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Miembros del espacio"
        >
          {members.map((m) => (
            <li
              key={m.userId}
              className="neu-inset flex min-w-0 shrink-0 items-center gap-2 rounded-[var(--neu-radius-sm)] py-2 pl-2 pr-3"
              title={`${m.name} · ${roleLabel(m.role)}`}
            >
              <MemberAvatar name={m.name} imageUrl={m.imageUrl} />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="max-w-[8rem] truncate text-xxs font-medium text-[var(--neu-text)] sm:max-w-[12rem] sm:text-xs">
                  {m.name}
                </span>
                <span className="hidden text-xxs text-[var(--neu-text-muted)] sm:inline sm:text-[11px]">
                  {roleLabel(m.role)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </NeuSurface>
  );
}
