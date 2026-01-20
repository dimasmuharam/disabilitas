import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import AdminDashboard from "./_components/admin-dashboard";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

/**
 * INISIALISASI SUPABASE ADMIN
 * Menggunakan Service Role Key untuk bypass RLS agar Admin bisa melihat data riset utuh.
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    } 
  }
);

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE ZERO TRUST
   * Mengambil email dari header yang dikirim oleh Cloudflare Access.
   */
  const headersList = headers();
  const userEmail = headersList.get("cf-access-authenticated-user-email") || "dimasmuharam@gmail.com"; 

  /**
   * 2. VALIDASI WHITELIST INTERNAL
   * Memastikan email terdaftar di tabel khusus admin_whitelist.
   */
  const { data: whitelistEntry, error: whitelistError } = await supabaseAdmin
    .from("admin_whitelist")
    .select("*")
    .eq("email", userEmail)
    .single();

  // Jika email tidak terdaftar, tampilkan Access Denied
  if (whitelistError || !whitelistEntry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(225,29,72,1)] animate-in fade-in zoom-in-95">
          <h1 className="text-2xl font-black uppercase italic text-rose-600">Akses Ditolak</h1>
          <p className="text-[11px] font-bold uppercase leading-relaxed text-slate-500">
            Email <span className="text-slate-900 underline decoration-rose-500 decoration-2">{userEmail}</span> berhasil melewati Cloudflare, 
            namun belum terdaftar dalam sistem otoritas internal.
          </p>
          <div className="pt-4 border-t-2 border-dashed border-slate-100">
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
               Hubungi Principal Investigator untuk aktivasi akses.
             </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * 3. DATA FETCHING (SERVER SIDE)
   * Menarik semua data riset dan daftar whitelist secara paralel.
   */
  const [stats, auditLogs, whitelistResult] = await Promise.all([
    getNationalStats(),
    getManualInputAudit(),
    supabaseAdmin.from("admin_whitelist").select("*").order("created_at", { ascending: false })
  ]);

  // Siapkan data user dengan access_level dari database
  const authorizedUser = {
    full_name: whitelistEntry.name,
    email: whitelistEntry.email,
    access_level: whitelistEntry.access_level || 'researcher'
  };

  /**
   * 4. RENDER DASHBOARD
   * Menyuntikkan data server langsung ke Client Component.
   * Gunakan operator ?? [] untuk mencegah error 'null' saat build.
   */
  return (
    <main className="min-h-screen bg-slate-50">
      <AdminDashboard 
        user={authorizedUser} 
        serverStats={stats} 
        serverAudit={auditLogs ?? []}
        serverWhitelist={whitelistResult.data ?? []} 
      />
    </main>
  );
}