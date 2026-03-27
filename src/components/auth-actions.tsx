"use client";

import { signIn, signOut } from "next-auth/react";

type AuthActionsProps = {
  isAuthenticated: boolean;
};

export function AuthActions({ isAuthenticated }: AuthActionsProps) {
  if (isAuthenticated) {
    return (
      <button
        type="button"
        className="rounded-md bg-black px-4 py-2 text-white"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Cerrar sesion
      </button>
    );
  }

  return (
    <button
      type="button"
      className="rounded-md bg-blue-600 px-4 py-2 text-white"
      onClick={() => signIn("google")}
    >
      Entrar con Google
    </button>
  );
}
