import { headers } from "next/headers";
import AdminDashboard from "./_components/admin-dashboard";
// Update import: gunakan getRawResearchData
import { getRawResearchData, getManualInputAudit } from "@/lib/actions/admin";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE
   * Data ini diambil dari header Cloudflare Access Zero Trust
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email") || "Admin Riset";
  const userName = headersList.get("cf-access-authenticated-user-name") || "Administrator";

  /**
   * 2. DATA FETCHING (SERVER SIDE)
   * Kita mengambil data profil mentah (profiles) dan log audit manual.
   */
  const [profiles, auditLogs] = await Promise.all([
    getRawResearchData(),
    getManualInputAudit()
  ]);

  const authorizedUser = {
    full_name: userName,
    email: userEmail,
  };

  /**
   * 3. RENDER DASHBOARD
   * serverStats sekarang berisi array mentah dari profiles yang akan 
   * diolah oleh komponen NationalAnalytics secara modular.
   */
  return (
    <main className="min-h-screen bg-slate-50">
      <AdminDashboard 
        user={authorizedUser} 
        serverStats={profiles} // Mengirim raw data ke dashboard
        serverAudit={auditLogs ?? []}
      />
    </main>
  );
}