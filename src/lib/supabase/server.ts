import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Erstellt einen Supabase-Client für serverseitige Operationen.
 * Nutzt Cookies für die Session-Verwaltung über @supabase/ssr.
 * Muss in Server Components, Route Handlers oder Server Actions aufgerufen werden.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll kann in Server Components fehlschlagen (read-only).
          // Das ist erwartet — Cookies werden dann über Middleware gesetzt.
        }
      },
    },
  });
}
