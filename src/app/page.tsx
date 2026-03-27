import Link from "next/link";
import { getServerSession } from "next-auth";

import { AuthActions } from "@/components/auth-actions";
import { authOptions } from "@/lib/auth/auth-options";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = Boolean(session);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-semibold">Ziona Web Auth Sandbox</h1>
      <p className="text-sm text-gray-600">
        Prueba de autenticacion con Google (Auth.js) + exchange con Nest.
      </p>

      <AuthActions isAuthenticated={isAuthenticated} />

      <section className="rounded-md border border-gray-200 p-4">
        <h2 className="mb-3 text-lg font-medium">Estado de sesion</h2>
        {isAuthenticated ? (
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong> {session?.backendUser?.email ?? session?.user?.email}
            </p>
            <p>
              <strong>Usuario backend:</strong>{" "}
              {session?.backendUser ? `${session.backendUser.name} (${session.backendUser.id})` : "No"}
            </p>
            <p>
              <strong>Token backend disponible:</strong>{" "}
              {session?.hasApiAccessToken ? "Si" : "No"}
            </p>
            <Link className="text-blue-700 underline" href="/api/backend/me">
              Probar GET /auth/me (a traves de Next API)
            </Link>
          </div>
        ) : (
          <p className="text-sm">No hay sesion activa.</p>
        )}
      </section>
    </main>
  );
}
