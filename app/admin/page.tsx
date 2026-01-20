import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminDashboard from "./_components/admin-dashboard";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

// Inisialisasi Admin Client (Bypass RLS)
// Kita gunakan Service Role Key agar data riset BRIN bisa ditarik secara utuh
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE ZERO TRUST
   * Cloudflare mengirimkan email user yang berhasil login melalui header.
   * Jika sedang di localhost (development), kita gunakan email fallback.
   */
  const headersList = require("next/headers").headers();
  const userEmail = headersList.get("cf-access-authenticated-user-email") || "dimasmuharam@gmail.com"; 

  /**
   * 2. VALIDASI WHITELIST INTERNAL
   * Cek apakah email ini terdaftar di tabel whitelist dan level aksesnya.
   */
  const { data: whitelistEntry, error: whitelistError } = await supabaseAdmin
    .from("admin_whitelist")
    .select("*")
    .eq("email", userEmail)
    .single();

  // Jika email tidak terdaftar di whitelist, cegah akses meskipun lolos Cloudflare
  if (whitelistError || !whitelistEntry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(225,29,72,1)]">
          <h1 className="text-2xl font-black uppercase italic text-rose-600">Akses Ditolak</h1>
          <p className="text-xs font-bold uppercase leading-relaxed text-slate-500">
            Email <span className="text-slate-900">{userEmail}</span> berhasil melewati Cloudflare, 
            namun belum terdaftar dalam Whitelist Internal Riset BRIN.
          </p>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Silakan hubungi Principal Investigator untuk pendaftaran otoritas.
          </p>
        </div>
      </div>
    );
  }

  /**
   * 3. DATA FETCHING (SERVER SIDE)
   * Karena email valid, kita tarik semua data yang dibutuhkan dashboard.
   */
  const [stats, auditLogs, { data: allWhitelist }] = await Promise.all([
    getNationalStats(),
    getManualInputAudit(),
    supabaseAdmin.from("admin_whitelist").select("*").order("created_at", { ascending: false })
  ]);

  // Siapkan objek user untuk UI Dashboard
  const authorizedUser = {
    full_name: whitelistEntry.name,
    email: whitelistEntry.email,
    access_level: whitelistEntry.access_level // 'admin', 'staff', atau 'researcher'
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboard 
        user={authorizedUser} 
        serverStats={stats} 
        serverAudit={auditLogs}
        serverWhitelist={allWhitelist} // Kirim data whitelist ke dashboard
      />
    </main>
  );
}