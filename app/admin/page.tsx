import { createAdminClient } from "@/lib/supabase";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

export const dynamic = 'force-dynamic';
export const runtime = "edge";

export default async function AdminDedicatedPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Kita ambil session tapi JANGAN redirect di sini dulu
  const { data: { session } } = await supabase.auth.getSession();

  // Tarik data saja dulu
  const stats = await getNationalStats();
  const auditLogs = await getManualInputAudit();

  // Jika tidak ada session, kita kirim user null ke AdminDashboard
  // Nanti AdminDashboard yang akan menangani redirect di sisi Client (Browser)
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboard 
        user={session?.user || null} 
        serverStats={stats} 
        serverAudit={auditLogs} 
      />
    </main>
  );
}