import { headers } from "next/headers";
import AdminDashboard from "./_components/admin-dashboard";
import { getManualInputAudit } from "@/lib/actions/admin";
import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Command Center | Disabilitas.com",
  robots: "noindex, nofollow",
};

export default async function AdminPage() {
  const headersList = headers();
  
  /**
   * 1. IDENTIFIKASI VIA CLOUDFLARE ACCESS
   */
  const userEmail = headersList.get("cf-access-authenticated-user-email");
  const userName = headersList.get("cf-access-authenticated-user-name");

  /**
   * 2. INITIALIZE SUPABASE ADMIN (Service Role)
   * Kita butuh Service Role untuk menarik daftar user dari auth.users
   */
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  /**
   * 3. DATA FETCHING (Auth Users & Audit Logs)
   * Kita tarik semua data user dari tabel Auth agar filter 5 role (Talent, Company, dll) 
   * di komponen UserManagement bekerja 100%.
   */
  const [{ data: authUsersData }, auditLogs] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    getManualInputAudit()
  ]);

  const allAuthUsers = authUsersData?.users || [];

  // Objek user administrator (Cloudflare Auth)
  const authorizedUser = {
    full_name: userName || "Administrator",
    email: userEmail || "Internal Access",
    isExternal: !!userEmail
  };

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <AdminDashboard 
        user={authorizedUser} 
        serverStats={allAuthUsers} // Sekarang mengirim list utuh dari auth.users
        serverAudit={auditLogs ?? []}
      />
    </div>
  );
}