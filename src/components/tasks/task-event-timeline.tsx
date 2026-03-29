import type { BackendTaskEventDto } from "@/lib/api/backend-client";

function eventTypeLabel(type: BackendTaskEventDto["type"]): string {
  switch (type) {
    case "task_created":
      return "Tarea creada";
    case "task_updated":
      return "Tarea actualizada";
    case "task_assigned":
      return "Personas asignadas";
    case "task_unassigned":
      return "Asignación quitada";
    case "task_completed":
      return "Tarea completada";
    case "task_reopened":
      return "Tarea reabierta";
    case "task_deleted":
      return "Tarea eliminada";
    default:
      return type;
  }
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

type TaskEventTimelineProps = {
  events: BackendTaskEventDto[];
};

export function TaskEventTimeline({ events }: TaskEventTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-[var(--neu-text-muted)]">Sin actividad registrada.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((ev) => (
        <li
          key={ev.id}
          className="neu-inset rounded-[var(--neu-radius-sm)] px-4 py-3 text-sm text-[var(--neu-text)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium">{eventTypeLabel(ev.type)}</span>
            <time className="text-xs tabular-nums text-[var(--neu-text-muted)]" dateTime={ev.createdAt}>
              {formatWhen(ev.createdAt)}
            </time>
          </div>
          <p className="mt-1 text-[var(--neu-text-muted)]">
            <span className="font-medium text-[var(--neu-text)]">{ev.actor.name}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
