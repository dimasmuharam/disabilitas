import { createAdminClient } from "@/lib/supabase";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = "edge";

export default async function AdminDedicatedPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Ambil session dengan cara yang paling kompatibel
  const { data: { session } } = await supabase.auth.getSession();

  // JIKA TIDAK ADA SESI, JANGAN LANGSUNG REDIRECT DULU
  // Kita ingin pastikan apakah ini masalah cookie atau memang belum login
  if (!session) {
    console.error("DEBUG: Sesi tidak ditemukan di Server Side");
    redirect("/masuk");
  }

  const user = session.user;
  const role = user.app_metadata?.role || user.user_metadata?.role;
  
  // Jika dia bukan admin, lempar ke dashboard utama
  if (role !== 'admin' && role !== 'super_admin') {
     redirect("/dashboard");
  }

  const stats = await getNationalStats();
  const auditLogs = await getManualInputAudit();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboard 
        user={user} 
        serverStats={stats} 
        serverAudit={auditLogs} 
      />
    </main>
  );
}