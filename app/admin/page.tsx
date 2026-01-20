import { headers } from "next/headers";
import AdminDashboard from "./_components/admin-dashboard";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email") || "Admin Riset";
  const userName = headersList.get("cf-access-authenticated-user-name") || "Administrator";

  /**
   * 2. DATA FETCHING (SERVER SIDE)
   * PERBAIKAN: Hapus pengambilan data dari tabel admin_whitelist
   */
  const [stats, auditLogs] = await Promise.all([
    getNationalStats(),
    getManualInputAudit()
  ]);

  const authorizedUser = {
    full_name: userName,
    email: userEmail,
  };

  /**
   * 3. RENDER DASHBOARD
   * PERBAIKAN: Hapus prop serverWhitelist agar tidak error saat build
   */
  return (
    <main className="min-h-screen bg-slate-50">
      <AdminDashboard 
        user={authorizedUser} 
        serverStats={stats} 
        serverAudit={auditLogs ?? []}
      />
    </main>
  );
}