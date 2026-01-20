import { createAdminClient } from "@/lib/supabase";

export const runtime = "edge"; // Memastikan berjalan di Cloudflare Workers

export default async function DebugPage() {
  let status = "Mengecek...";
  let detail = "";
  let jumlahData = 0;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
      status = "GAGAL: Kunci Master (Service Role Key) tidak terbaca.";
      detail = "Pastikan Secret sudah dimasukkan di Cloudflare Settings.";
    } else {
      const admin = createAdminClient();
      const { count, error } = await admin
        .from("profiles")
        .select("*", { count: 'exact', head: true });

      if (error) {
        status = "GAGAL: Terhubung ke Cloudflare, tapi ditolak Supabase.";
        detail = error.message;
      } else {
        status = "BERHASIL! Koneksi Sempurna.";
        jumlahData = count || 0;
        detail = `Sistem berhasil melihat ${jumlahData} responden di tabel profiles.`;
      }
    }
  } catch (err: any) {
    status = "ERROR SISTEM";
    detail = err.message;
  }

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Laporan Diagnosa Koneksi</h1>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Detail:</strong> {detail}</p>
      <hr />
      <p>Jika Status BERHASIL tapi Dashboard masih loading, berarti masalahnya ada di Cache browser atau pengiriman data ke komponen UI.</p>
    </div>
  );
}