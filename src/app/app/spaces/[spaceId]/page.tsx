import Link from "next/link";
import { notFound } from "next/navigation";

import { SpaceAdminInviteForm } from "@/components/spaces/space-admin-invite-form";
import { NeuSurface } from "@/components/ui/neu-surface";
import { getSpaceMembers } from "@/lib/spaces/get-space-members";
import { getSpaces } from "@/lib/spaces/get-spaces";
import { homeRoleLabel } from "@/lib/invitations/invitation-labels";
import { ROUTES } from "@/lib/routes";

type SpaceAdminPageProps = {
  params: Promise<{ spaceId: string }>;
};

export default async function SpaceAdminPage({ params }: SpaceAdminPageProps) {
  const { spaceId } = await params;
  const spaces = await getSpaces();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space) {
    notFound();
  }

  let members;
  try {
    members = await getSpaceMembers(spaceId);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 404 || status === 403) {
      notFound();
    }
    throw e;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={ROUTES.spaces}
          className="text-sm text-[var(--neu-text-muted)] transition hover:text-[var(--neu-text)]"
        >
          ← Volver a espacios
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-[var(--neu-text)]">
          Administrar espacio
        </h1>
        <p className="mt-1 text-pretty text-sm text-[var(--neu-text-muted)]">{space.name}</p>
      </div>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">Miembros</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {members.map((m) => (
            <li
              key={m.userId}
              className="neu-inset flex flex-col gap-1 rounded-[var(--neu-radius-sm)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--neu-text)]">{m.name}</p>
                <p className="font-mono text-[length:0.8125rem] text-[var(--neu-text-muted)]">{m.publicCode}</p>
              </div>
              <span className="shrink-0 text-[var(--neu-text-muted)]">{homeRoleLabel(m.role)}</span>
            </li>
          ))}
        </ul>
      </NeuSurface>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">Invitar por código público</h2>
        <p className="mt-1 text-pretty text-sm text-[var(--neu-text-muted)]">
          La otra persona debe darte su código público (visible en su menú de usuario). Recibirá una invitación
          pendiente.
        </p>
        <div className="mt-4">
          <SpaceAdminInviteForm spaceId={spaceId} />
        </div>
      </NeuSurface>
    </div>
  );
}
