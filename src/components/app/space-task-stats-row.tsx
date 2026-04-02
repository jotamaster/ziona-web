"use client";

import type { ReactNode } from "react";

import type { BackendTaskDto } from "@/lib/api/backend-client";
import { NeuSurface } from "@/components/ui/neu-surface";

function countByStatus(tasks: BackendTaskDto[]) {
  let completed = 0;
  let pending = 0;
  let expired = 0;
  for (const t of tasks) {
    if (t.computedStatus === "completed") completed += 1;
    else if (t.computedStatus === "pending") pending += 1;
    else if (t.computedStatus === "expired") expired += 1;
  }
  return { total: tasks.length, completed, pending, expired };
}

function IconList({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 3.7L2.6 18.3a1.5 1.5 0 001.3 2.2h16.2a1.5 1.5 0 001.3-2.2L13.7 3.7a1.5 1.5 0 00-2.6 0z" />
    </svg>
  );
}

type IconTone = "default" | "success" | "info" | "danger";

const iconToneClass: Record<IconTone, string> = {
  default: "text-[var(--neu-accent)]",
  success: "text-emerald-600 dark:text-emerald-400",
  info: "text-sky-600 dark:text-sky-400",
  danger: "text-red-600 dark:text-red-400",
};

type StatCardProps = {
  icon: ReactNode;
  value: number | string;
  labelShort: string;
  labelLong: string;
  ariaLabel: string;
  iconTone?: IconTone;
};

function StatCard({ icon, value, labelShort, labelLong, ariaLabel, iconTone = "default" }: StatCardProps) {
  return (
    <NeuSurface
      variant="raised"
      className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-2 sm:gap-1 sm:px-2 sm:py-2.5"
      role="group"
      aria-label={ariaLabel}
    >
      <span
        className={`${iconToneClass[iconTone]} [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6`}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold tabular-nums text-[var(--neu-text)] sm:text-2xl">{value}</span>
      <span className="max-w-full truncate text-center text-[10px] font-medium leading-tight text-[var(--neu-text-muted)] sm:hidden">
        {labelShort}
      </span>
      <span className="hidden max-w-full truncate text-center text-xs font-medium text-[var(--neu-text-muted)] sm:inline">
        {labelLong}
      </span>
    </NeuSurface>
  );
}

type SpaceTaskStatsRowProps = {
  tasks: BackendTaskDto[] | null;
  loading: boolean;
  error: string | null;
};

export function SpaceTaskStatsRow({ tasks, loading, error }: SpaceTaskStatsRowProps) {
  const counts = tasks ? countByStatus(tasks) : null;
  const showPlaceholder = loading && !error;
  const showCounts = counts != null && !error;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      <StatCard
        icon={<IconList />}
        value={showPlaceholder ? "–" : showCounts ? counts.total : "–"}
        labelShort="Tot."
        labelLong="Total"
        ariaLabel={`Tareas totales: ${showCounts ? counts.total : "cargando"}`}
      />
      <StatCard
        icon={<IconCheck />}
        iconTone="success"
        value={showPlaceholder ? "–" : showCounts ? counts.completed : "–"}
        labelShort="Hech."
        labelLong="Completadas"
        ariaLabel={`Tareas completadas: ${showCounts ? counts.completed : "cargando"}`}
      />
      <StatCard
        icon={<IconClock />}
        iconTone="info"
        value={showPlaceholder ? "–" : showCounts ? counts.pending : "–"}
        labelShort="Pend."
        labelLong="Pendientes"
        ariaLabel={`Tareas pendientes: ${showCounts ? counts.pending : "cargando"}`}
      />
      <StatCard
        icon={<IconAlert />}
        iconTone="danger"
        value={showPlaceholder ? "–" : showCounts ? counts.expired : "–"}
        labelShort="Venc."
        labelLong="Vencidas"
        ariaLabel={`Tareas vencidas: ${showCounts ? counts.expired : "cargando"}`}
      />
    </div>
  );
}
