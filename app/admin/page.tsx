import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import AdminDashboard from "./_components/admin-dashboard";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

// Wajib untuk Cloudflare Pages agar bisa memproses data dinamis di Edge
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * INISIALISASI SUPABASE ADMIN
 * Menggunakan Service Role Key untuk akses data riset BRIN tanpa hambatan RLS.
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

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI OTOMATIS
   * Menangkap email dari Cloudflare Access Header.
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email");

  /**
   * 2. PROTEKSI IDENTITAS
   * Jika Cloudflare tidak mengirimkan email (Header kosong), 
   * kita tampilkan pesan instruksi alih-alih membiarkan aplikasi crash.
   */
  if (!userEmail) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <h1 className="text-xl font-black uppercase italic text-amber-600 underline">Identity Not Found</h1>
          <p className="text-[11px] font-bold uppercase leading-relaxed text-slate-500">
            Sistem tidak dapat mendeteksi email login Anda dari Cloudflare.
          </p>
          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-[9px] font-medium text-slate-400 leading-relaxed text-left">
              <span className="font-black text-slate-900 text-[10px]">SOLUSI:</span><br />
              1. Pastikan <span className="text-blue-600">Identity Headers</span> di Dashboard Cloudflare sudah aktif.<br />
              2. Jika baru saja diubah, coba muat ulang halaman atau gunakan mode <span className="italic">Incognito</span>.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full mt-4 bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            Coba Segarkan Halaman
          </button>
        </div>
      </div>
    );
  }

  /**
   * 3. VALIDASI WHITELIST INTERNAL
   * Cek apakah email hasil login (GitHub/Email) terdaftar di database admin_whitelist.
   */
  const { data: whitelistEntry, error: whitelistError } = await supabaseAdmin
    .from("admin_whitelist")
    .select("*")
    .eq("email", userEmail)
    .single();

  // Jika email tidak terdaftar di whitelist database
  if (whitelistError || !whitelistEntry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md space-y-4 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(225,29,72,1)]">
          <h1 className="text-2xl font-black uppercase italic text-rose-600">Akses Ditolak</h1>
          <p className="text-[11px] font-bold uppercase leading-relaxed text-slate-500">
            Email <span className="text-slate-900 underline decoration-rose-500 decoration-2">{userEmail}</span> berhasil melewati Cloudflare, 
            namun tidak terdaftar di database Admin Riset.
          </p>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pt-4 border-t border-slate-100">
            Hubungi Admin untuk pendaftaran email ini.
          </p>
        </div>
      </div>
    );
  }

  /**
   * 4. DATA FETCHING (SERVER SIDE)
   * Hanya dijalankan jika user terverifikasi.
   */
  const [stats, auditLogs, whitelistResult] = await Promise.all([
    getNationalStats(),
    getManualInputAudit(),
    supabaseAdmin.from("admin_whitelist").select("*").order("created_at", { ascending: false })
  ]);

  const authorizedUser = {
    full_name: whitelistEntry.name,
    email: whitelistEntry.email,
    access_level: whitelistEntry.access_level || 'researcher'
  };

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