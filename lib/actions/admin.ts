"use server"

import { createAdminClient } from "@/lib/supabase"

/**
 * AMBIL DATA RISET MENTAH (RAW DATA)
 * Fungsi ini mengambil seluruh baris dari tabel profiles.
 * Logika perhitungan persentase dan distribusi dilakukan di sisi klien (komponen).
 */
export async function getRawResearchData() {
  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return profiles || [];
  } catch (err: any) {
    console.error("Fetch Error Profiles:", err.message);
    return [];
  }
}

/**
 * AMBIL LOG AUDIT INPUT MANUAL
 * Mengambil entri yang belum di-review untuk standarisasi data.
 */
export async function getManualInputAudit() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("manual_input_logs")
      .select("*")
      .eq("is_reviewed", false)
      .order("occurrence_count", { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Fetch Error Audit Logs:", err.message);
    return [];
  }
}

/**
 * MANAJEMEN DATA ADMIN (UNIVERSAL)
 * Fungsi tunggal untuk menangani penghapusan, pembaruan, dan pembaruan massal.
 * Action: "DELETE" | "UPDATE" | "BULK_UPDATE"
 */
export async function manageAdminUser(action: string, table: string, payload: any) {
  try {
    const admin = createAdminClient();
    
    // 1. Hapus Data Tunggal
    if (action === "DELETE") {
      const { error } = await admin.from(table).delete().eq("id", payload.id);
      return { error };
    }

    // 2. Update Data Tunggal (Contoh: Verifikasi)
    if (action === "UPDATE") {
      const { id, ...updateData } = payload;
      const { error } = await admin.from(table).update(updateData).eq("id", id);
      return { error };
    }

    // 3. Update Massal (Contoh: Verifikasi Massal)
    if (action === "BULK_UPDATE") {
      const { ids, ...updateData } = payload;
      const { error } = await admin.from(table).update(updateData).in("id", ids);
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    console.error("Management Action Error:", err.message);
    return { error: err.message };
  }
}