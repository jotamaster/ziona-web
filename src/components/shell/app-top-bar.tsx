type AppTopBarProps = {
  leftContent: React.ReactNode;
  rightSlot: React.ReactNode;
  className?: string;
};

export function AppTopBar({ leftContent, rightSlot, className = "" }: AppTopBarProps) {
  return (
    <header
      className={`neu-topbar fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between gap-3 px-4 sm:px-6 ${className}`.trim()}
    >
      <div className="min-w-0 flex-1">{leftContent}</div>
      <div className="flex shrink-0 items-center">{rightSlot}</div>
    </header>
  );
}
