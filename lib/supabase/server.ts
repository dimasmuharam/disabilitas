import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  // Cloudflare Pages runtime fallback: try process.env first, then globalThis
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback for Cloudflare Workers runtime context
  if (!supabaseUrl && typeof globalThis !== 'undefined') {
    supabaseUrl = (globalThis as any).NEXT_PUBLIC_SUPABASE_URL;
  }
  if (!supabaseAnonKey && typeof globalThis !== 'undefined') {
    supabaseAnonKey = (globalThis as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  // Log error if environment variables are missing (helps debug Cloudflare Pages deployment)
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables missing:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      processEnv: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
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
