import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import AdminDashboard from "./_components/admin-dashboard";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

export const runtime = 'edge';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { persistSession: false } 
  }
);

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI DINAMIS
   * Kita ambil email dari header Cloudflare. 
   * Jika kosong, kita tidak pakai fallback email manual agar tidak ada salah paham.
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email");

  /**
   * 2. VALIDASI WHITELIST
   */
  const { data: whitelistEntry, error: whitelistError } = await supabaseAdmin
    .from("admin_whitelist")
    .select("*")
    .eq("email", userEmail || "")
    .single();

  // JIKA AKSES DITOLAK (Email tidak ada di DB atau Header Cloudflare Kosong)
  if (whitelistError || !whitelistEntry) {
    // Kita kumpulkan semua header untuk Mas inspeksi (Audit Mode)
    const allHeaders: Record<string, string> = {};
    headersList.forEach((value, key) => {
      if (key.includes("cf-access") || key.includes("user")) {
        allHeaders[key] = value;
      }
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
        <div className="max-w-2xl w-full space-y-6 rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(225,29,72,1)]">
          <h1 className="text-3xl font-black uppercase italic text-rose-600 italic tracking-tighter">Access Denied</h1>
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">
              Identitas terdeteksi: <span className="text-rose-600">{userEmail || "TIDAK TERDETEKSI"}</span>
            </p>
            <p className="text-[10px] uppercase font-black text-slate-400 leading-relaxed">
              Penyebab: Email ini tidak ditemukan dalam tabel <code className="bg-slate-100 px-1">admin_whitelist</code> atau Cloudflare belum mengirimkan identitas GitHub Anda.
            </p>
          </div>

          {/* BOX DEBUG UNTUK MAS DIMAS */}
          <div className="rounded-2xl bg-slate-900 p-6 text-left shadow-inner">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-blue-400">Header Debug Info (Cek Email Disini):</p>
            <pre className="overflow-auto text-[10px] text-slate-300 font-mono">
              {JSON.stringify({
                detected_email: userEmail,
                cloudflare_headers: allHeaders,
                tip: "Pastikan email di 'detected_email' sama persis dengan yang ada di database Supabase."
              }, null, 2)}
            </pre>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-slate-900 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all"
          >
            Refresh & Re-Authenticate
          </button>
        </div>
      </div>
    );
  }

  /**
   * 3. DATA FETCHING (Hanya jalan jika Whitelist OK)
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