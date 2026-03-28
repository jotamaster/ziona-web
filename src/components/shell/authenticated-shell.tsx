import { AppTopBar } from "@/components/shell/app-top-bar";
import { ActiveHomeTitle } from "@/components/shell/active-home-title";
import type { ShellUser } from "@/components/shell/types";
import { UserMenu } from "@/components/shell/user-menu";
import type { Home } from "@/lib/homes/types";

type AuthenticatedShellProps = {
  user: ShellUser;
  activeHome: Home | null;
  children: React.ReactNode;
};

export function AuthenticatedShell({ user, activeHome, children }: AuthenticatedShellProps) {
  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <AppTopBar
        leftContent={<ActiveHomeTitle activeHome={activeHome} />}
        rightSlot={<UserMenu user={user} />}
      />
      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-[calc(4rem+1.5rem)] sm:px-6">{children}</main>
    </div>
  );
}
