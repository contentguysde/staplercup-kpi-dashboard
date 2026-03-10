import { createSupabaseServerClient } from "./server";

/** Benutzer-Typ mit Rolle */
export interface AuthUser {
  id: string;
  email: string;
  role: "admin" | "user" | null;
}

/**
 * Liest die Rolle eines Benutzers aus der user_roles Tabelle.
 * Gibt null zurück wenn keine Rolle zugewiesen ist.
 */
export async function getUserRole(
  userId: string
): Promise<"admin" | "user" | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Fehler beim Laden der Benutzerrolle:", error.message);
    return null;
  }

  return (data?.role as "admin" | "user") ?? null;
}

/**
 * Holt den aktuell eingeloggten Benutzer inkl. Rolle.
 * Gibt null zurück wenn kein Benutzer eingeloggt ist.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role = await getUserRole(user.id);

  return {
    id: user.id,
    email: user.email ?? "",
    role,
  };
}
