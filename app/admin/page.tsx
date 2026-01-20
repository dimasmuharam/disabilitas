import { createAdminClient } from "@/lib/supabase";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

export const runtime = "edge";

export default async function AdminDedicatedPage() {
  const supabase = createServerComponentClient({ cookies });
  
  // 1. Cek Sesi
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/masuk");

  // 2. Cek Role (Proteksi Ganda)
  const role = session.user.app_metadata?.role || session.user.user_metadata?.role;
  if (role !== 'admin' && role !== 'super_admin') {
    redirect("/dashboard"); 
  }

  // 3. Tarik data di level Server (Pre-fetching)
  // Ini yang membuat NVDA nanti tidak perlu mendengar "Menyusun Dasbor"
  const [stats, auditLogs] = await Promise.all([
    getNationalStats(),
    getManualInputAudit()
  ]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboard 
        user={session.user} 
        serverStats={stats} 
        serverAudit={auditLogs} 
      />
    </main>
  );
}