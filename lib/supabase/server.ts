import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Log error if environment variables are missing (helps debug Cloudflare Pages deployment)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables missing:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      env: typeof process !== "undefined" ? "process exists" : "no process",
    });
    throw new Error("Missing Supabase environment variables");
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ini normal jika dipanggil dari Server Component
          }
        },
      },
    }
  );
}
