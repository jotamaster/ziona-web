import { CancelSentInvitationButton, AcceptRejectReceivedButtons } from "@/components/invitations/invitation-action-buttons";
import { NeuSurface } from "@/components/ui/neu-surface";
import type { BackendInvitationListItem } from "@/lib/api/backend-client";
import { getInvitationsReceived, getInvitationsSent } from "@/lib/invitations/get-invitations";
import { invitationStatusLabel } from "@/lib/invitations/invitation-labels";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function SentRow({ item }: { item: BackendInvitationListItem }) {
  return (
    <li className="neu-inset flex flex-col gap-3 rounded-[var(--neu-radius-sm)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--neu-text)]">{item.home.name}</p>
        {item.invitedUser ? (
          <p className="mt-1 text-sm text-[var(--neu-text-muted)]">
            Invitado: {item.invitedUser.name}{" "}
            <span className="font-mono text-[length:0.75rem]">({item.invitedUser.publicCode})</span>
          </p>
        ) : null}
        <p className="mt-1 text-xs text-[var(--neu-text-muted)]">
          {invitationStatusLabel(item.status)} · Enviada {formatWhen(item.createdAt)}
          {item.respondedAt ? ` · Respondida ${formatWhen(item.respondedAt)}` : null}
        </p>
      </div>
      {item.status === "pending" ? <CancelSentInvitationButton invitationId={item.id} /> : null}
    </li>
  );
}

function ReceivedRow({ item }: { item: BackendInvitationListItem }) {
  return (
    <li className="neu-inset flex flex-col gap-3 rounded-[var(--neu-radius-sm)] px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--neu-text)]">{item.home.name}</p>
        {item.invitedBy ? (
          <p className="mt-1 text-sm text-[var(--neu-text-muted)]">
            De: {item.invitedBy.name}{" "}
            <span className="font-mono text-[length:0.75rem]">({item.invitedBy.publicCode})</span>
          </p>
        ) : null}
        <p className="mt-1 text-xs text-[var(--neu-text-muted)]">
          {invitationStatusLabel(item.status)} · Recibida {formatWhen(item.createdAt)}
          {item.respondedAt ? ` · Respondida ${formatWhen(item.respondedAt)}` : null}
        </p>
      </div>
      {item.status === "pending" ? <AcceptRejectReceivedButtons invitationId={item.id} /> : null}
    </li>
  );
}

export default async function InvitationsPage() {
  const [sent, received] = await Promise.all([getInvitationsSent(), getInvitationsReceived()]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">Invitaciones</h1>
        <p className="mt-2 text-pretty text-sm text-[var(--neu-text-muted)]">
          Invitaciones que enviaste y las que recibiste. Las pendientes puedes cancelarlas o responderlas aquí.
        </p>
      </header>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">Enviadas</h2>
        {sent.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--neu-text-muted)]">No has enviado invitaciones aún.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {sent.map((item) => (
              <SentRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </NeuSurface>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">Recibidas</h2>
        {received.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--neu-text-muted)]">No tienes invitaciones recibidas.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {received.map((item) => (
              <ReceivedRow key={item.id} item={item} />
            ))}
          </ul>
        )}
      </NeuSurface>
    </div>
  );
}
