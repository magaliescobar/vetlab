import { auth } from "@/auth";

/** Renderiza children solo si la sesión activa tiene rol admin. */
export async function AdminOnly({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") return null;
  return <>{children}</>;
}
