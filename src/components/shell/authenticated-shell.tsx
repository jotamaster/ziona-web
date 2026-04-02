"use client";

import { AppTopBar } from "@/components/shell/app-top-bar";
import { ActiveSpaceHeaderBlock } from "@/components/shell/active-space-header-block";
import type { ShellUser } from "@/components/shell/types";
import { UserMenu } from "@/components/shell/user-menu";

type AuthenticatedShellProps = {
  user: ShellUser;
  children: React.ReactNode;
};

export function AuthenticatedShell({ user, children }: AuthenticatedShellProps) {
  return (
    <div className="min-h-screen bg-[var(--neu-bg)]">
      <AppTopBar
        leftContent={
          <div className="flex min-w-0 items-center gap-1 sm:gap-0.5">
            <ActiveSpaceHeaderBlock />
          </div>
        }
        rightSlot={<UserMenu user={user} />}
      />
      <main className="mx-auto w-full max-w-3xl px-4 pb-12 pt-[calc(4rem+1.5rem)] sm:px-6">{children}</main>
    </div>
  );
}
