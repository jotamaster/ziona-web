import type { BackendInvitationListItem } from "@/lib/api/backend-client";

export function invitationStatusLabel(status: BackendInvitationListItem["status"]): string {
  const map: Record<BackendInvitationListItem["status"], string> = {
    pending: "Pendiente",
    accepted: "Aceptada",
    rejected: "Rechazada",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return map[status] ?? status;
}

export function homeRoleLabel(role: "owner" | "member"): string {
  return role === "owner" ? "Dueño" : "Miembro";
}
