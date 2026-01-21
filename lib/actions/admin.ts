"use server"

import { createAdminClient } from "@/lib/supabase"

/**
 * AMBIL DATA SELURUH EKOSISTEM (The Great Union)
 * Menggabungkan data singkat dari 5 tabel berbeda untuk User Management.
 */
export async function getAllSystemUsers() {
  try {
    const admin = createAdminClient();

    // Jalankan 5 kueri sekaligus secara paralel
    const [
      { data: talents },
      { data: companies },
      { data: partners },
      { data: campuses },
      { data: government }
    ] = await Promise.all([
      admin.from("profiles").select("id, full_name, email, city, created_at"),
      admin.from("companies").select("id, name, email, location, created_at"),
      admin.from("partners").select("id, name, email, location, created_at"),
      admin.from("campuses").select("id, name, email, location, created_at"),
      admin.from("government").select("id, name, email, location, created_at")
    ]);

    // Gabungkan dengan label Role
    const unified = [
      ...(talents?.map(u => ({ ...u, role: 'talent' })) || []),
      ...(companies?.map(u => ({ ...u, role: 'company', full_name: u.name, city: u.location })) || []),
      ...(partners?.map(u => ({ ...u, role: 'partner', full_name: u.name, city: u.location })) || []),
      ...(campuses?.map(u => ({ ...u, role: 'campus', full_name: u.name, city: u.location })) || []),
      ...(government?.map(u => ({ ...u, role: 'government', full_name: u.name, city: u.location })) || []),
    ];

    // Urutkan berdasarkan yang terbaru bergabung
    return unified.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err: any) {
    console.error("Fetch Error Unified Users:", err.message);
    return [];
  }
}

/**
 * AMBIL DATA RISET MENTAH (Tetap fokus ke Profiles)
 */
export async function getRawResearchData() {
  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin.from("profiles").select("*");
    if (error) throw error;
    return profiles || [];
  } catch (err: any) { return []; }
}

/**
 * MANAJEMEN AUTH USER (AKSI SAKTI)
 * Menangani Reset Password, Banned, dan Delete di level Auth Supabase
 */
export async function manageUserAuth(action: string, userId: string, extra?: any) {
  try {
    const admin = createAdminClient();

    if (action === "RESET_PASSWORD") {
      // Mengirim email reset password langsung dari sistem admin
      const { error } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: extra // email dikirim via payload extra
      });
      return { error };
    }

    if (action === "BAN_USER") {
      // Membekukan akses user
      const { error } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: '87600h' // Banned selama 10 tahun
      });
      return { error };
    }

    if (action === "DELETE_USER") {
      // Hapus permanen dari Auth (Data tabel akan terhapus otomatis jika ada Cascade Delete)
      const { error } = await admin.auth.admin.deleteUser(userId);
      return { error };
    }

    if (action === "VERIFY_EMAIL") {
      // Konfirmasi email manual tanpa user harus klik link
      const { error } = await admin.auth.admin.updateUserById(userId, {
        email_confirm: true
      });
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * LOG AUDIT & MANAJEMEN TABEL BIASA (Tetap Ada)
 */
export async function getManualInputAudit() {
  const admin = createAdminClient();
  const { data } = await admin.from("manual_input_logs").select("*").eq("is_reviewed", false);
  return data || [];
}

export async function manageAdminUser(action: string, table: string, payload: any) {
  const admin = createAdminClient();
  if (action === "DELETE") return await admin.from(table).delete().eq("id", payload.id);
  if (action === "UPDATE") return await admin.from(table).update(payload).eq("id", payload.id);
  return { error: null };
}