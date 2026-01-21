import { headers } from "next/headers";
import AdminDashboard from "./_components/admin-dashboard";
import { getRawResearchData, getManualInputAudit } from "@/lib/actions/admin";
import { Metadata } from "next";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Metadata khusus untuk area Admin agar tidak terindeks SEO
export const metadata: Metadata = {
  title: "Admin Command Center",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE ACCESS
   * Mengambil identitas dari header yang disuntikkan oleh Cloudflare Zero Trust.
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email");
  const userName = headersList.get("cf-access-authenticated-user-name");

  /**
   * 2. DATA FETCHING (SERVER SIDE)
   * Fetching data paralel untuk performa maksimal pada runtime edge.
   */
  const [profiles, auditLogs] = await Promise.all([
    getRawResearchData(),
    getManualInputAudit()
  ]);

  // Object user untuk dikirim ke Client Component
  const authorizedUser = {
    full_name: userName || "Administrator",
    email: userEmail || "Internal Access",
    isExternal: !!userEmail // True jika masuk via Cloudflare
  };

  /**
   * 3. RENDER DASHBOARD
   * Tidak perlu pembungkus <main> tambahan karena sudah ditangani oleh layout.tsx
   */
  return (
    <div className="p-4 md:p-8 lg:p-12">
      <AdminDashboard 
        user={authorizedUser} 
        serverStats={profiles} // Raw data profiles untuk National Analytics
        serverAudit={auditLogs ?? []}
      />
    </div>
  );
}