import { headers } from "next/headers";
import AdminDashboard from "./_components/admin-dashboard";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";
import { createClient } from "@supabase/supabase-js";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * INISIALISASI SUPABASE ADMIN
 */
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE
   * Kita tetap ambil email dan nama dari Cloudflare untuk ditampilkan di Dashboard.
   * Tapi kita tidak lagi melakukan pengecekan (filter) ke tabel whitelist.
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email") || "Admin Riset";
  const userName = headersList.get("cf-access-authenticated-user-name") || "User BRIN";

  /**
   * 2. DATA FETCHING (SERVER SIDE)
   * Menarik data riset secara paralel.
   */
  const [stats, auditLogs, whitelistResult] = await Promise.all([
    getNationalStats(),
    getManualInputAudit(),
    // Tetap ambil data whitelist hanya untuk ditampilkan di tab "Access Control" 
    // jika Mas masih ingin melihat daftar admin yang pernah didaftarkan.
    supabaseAdmin.from("admin_whitelist").select("*").order("created_at", { ascending: false })
  ]);

  const authorizedUser = {
    full_name: userName,
    email: userEmail,
    access_level: 'admin' // Semua yang lolos Cloudflare dianggap Admin
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