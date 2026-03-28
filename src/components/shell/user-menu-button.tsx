"use client";

type UserMenuButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
  ariaControlsId: string;
};

export function UserMenuButton({ isOpen, onToggle, ariaControlsId }: UserMenuButtonProps) {
  return (
    <button
      type="button"
      className="neu-focus neu-raised flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-[var(--neu-radius-sm)] transition hover:brightness-[1.02] active:scale-[0.98]"
      aria-expanded={isOpen}
      aria-controls={ariaControlsId}
      aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      onClick={onToggle}
    >
      <span className="sr-only">Menú</span>
      {isOpen ? (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-[var(--neu-text)]"
          />
        </svg>
      ) : (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M4 7H20M4 12H20M4 17H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-[var(--neu-text)]"
          />
        </svg>
      )}
    </button>
  );
}
