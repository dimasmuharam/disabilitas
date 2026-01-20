import { createAdminClient } from "@/lib/supabase";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin";

// Kita gunakan 'force-dynamic' agar server selalu mengecek cookie terbaru, bukan hasil cache
export const dynamic = 'force-dynamic';
export const runtime = "edge";

export default async function AdminDedicatedPage() {
  // 1. Inisialisasi dengan akses cookie yang lebih eksplisit
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // 2. Gunakan getUser() alih-alih getSession()
  // getUser() lebih aman karena melakukan validasi ulang ke server Supabase, 
  // sedangkan getSession() terkadang hanya membaca cookie yang mungkin sudah expired.
  const { data: { user }, error } = await supabase.auth.getUser();

  // Jika tidak ada user, atau ada error auth, tendang ke /masuk
  if (error || !user) {
    console.log("Auth Error/No User, redirecting...");
    redirect("/masuk");
  }

  // 3. Cek Role (Ambil dari metadata yang tadi kita update via SQL)
  const role = user.app_metadata?.role || user.user_metadata?.role;
  
  if (role !== 'admin' && role !== 'super_admin') {
    console.log("Not Admin, redirecting to dashboard...");
    redirect("/dashboard"); 
  }

  // 4. Tarik data (Gunakan try-catch agar jika satu gagal, halaman tidak blank)
  let stats = null;
  let auditLogs = [];

  try {
    // Kita panggil secara paralel tapi aman
    const [resStats, resAudit] = await Promise.all([
      getNationalStats(),
      getManualInputAudit()
    ]);
    stats = resStats;
    auditLogs = resAudit;
  } catch (e) {
    console.error("Fetch Server Data Error:", e);
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Kirim data user dan hasil pre-fetch ke komponen Client */}
      <AdminDashboard 
        user={user} 
        serverStats={stats} 
        serverAudit={auditLogs} 
      />
    </main>
  );
}