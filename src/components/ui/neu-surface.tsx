import type { HTMLAttributes, ReactNode } from "react";

type NeuSurfaceVariant = "raised" | "inset" | "flat";

type NeuSurfaceProps = {
  variant?: NeuSurfaceVariant;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const variantClass: Record<NeuSurfaceVariant, string> = {
  raised: "neu-raised",
  inset: "neu-inset",
  flat: "rounded-[var(--neu-radius-md)] bg-[var(--neu-bg)]",
};

export function NeuSurface({ variant = "raised", className = "", children, ...rest }: NeuSurfaceProps) {
  return (
    <div className={`${variantClass[variant]} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
