import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Buat respons awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Inisialisasi Supabase Client khusus Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh sesi login (Sangat Penting agar tidak 'stuck' atau 'logout' otomatis)
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Proteksi Rute (Opsional tapi Direkomendasikan)
  // Jika user mencoba masuk ke dashboard tapi belum login, arahkan ke halaman masuk
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/masuk', request.url));
  }

  return response;
}

// Atur halaman mana saja yang dipantau oleh middleware
export const config = {
  matcher: [
    /*
     * Pantau semua rute kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
