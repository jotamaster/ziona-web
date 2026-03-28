"use client";

import { useId, useState } from "react";

import type { ShellUser } from "@/components/shell/types";
import { UserMenuButton } from "@/components/shell/user-menu-button";
import { UserMenuPanel } from "@/components/shell/user-menu-panel";

type UserMenuProps = {
  user: ShellUser;
};

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = `user-menu-${useId().replace(/:/g, "")}`;

  return (
    <div className="relative">
      <UserMenuButton
        isOpen={open}
        onToggle={() => setOpen((v) => !v)}
        ariaControlsId={panelId}
      />
      <UserMenuPanel open={open} onClose={() => setOpen(false)} panelId={panelId} user={user} />
    </div>
  );
}
