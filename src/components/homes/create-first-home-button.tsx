"use client";

type CreateFirstHomeButtonProps = {
  className?: string;
};

export function CreateFirstHomeButton({ className = "" }: CreateFirstHomeButtonProps) {
  return (
    <button
      type="button"
      className={`neu-focus neu-raised w-full max-w-sm rounded-[var(--neu-radius-md)] px-6 py-3.5 text-center text-base font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] ${className}`.trim()}
      onClick={() => {
        /* Conectar API de creación de hogar */
      }}
    >
      Crear tu primer hogar
    </button>
  );
}
