"use server"

export const runtime = 'edge';

import { createAdminClient } from "@/lib/supabase"

/**
 * AMBIL DATA SELURUH EKOSISTEM (The Great Union V3)
 * Menggabungkan data dari Auth (Master) dengan data metadata dari 5 tabel DB.
 */
export async function getAllSystemUsers() {
  try {
    const admin = createAdminClient();

    // 1. Ambil data dari semua sumber secara paralel
    const [
      { data: authUsers, error: authError },
      { data: talents },
      { data: companies },
      { data: partners },
      { data: campuses },
      { data: government }
    ] = await Promise.all([
      admin.auth.admin.listUsers(),
      admin.from("profiles").select("id, full_name, email, city, created_at, is_verified"),
      admin.from("companies").select("id, name, email, location, created_at, is_verified"),
      admin.from("partners").select("id, name, email, location, created_at, is_verified"),
      admin.from("campuses").select("id, name, email, location, created_at, is_verified"),
      admin.from("government").select("id, name, email, location, created_at, is_verified")
    ]);

    if (authError) throw authError;

    // 2. Buat Map dari Database untuk mempercepat pencarian (Lookup Table)
    // Kita gabungkan semua tabel ke dalam satu Map berdasarkan ID
    const dbMap = new Map();
    
    talents?.forEach(u => dbMap.set(u.id, { ...u, role: 'talent' }));
    companies?.forEach(u => dbMap.set(u.id, { ...u, role: 'company', full_name: u.name, city: u.location }));
    partners?.forEach(u => dbMap.set(u.id, { ...u, role: 'partner', full_name: u.name, city: u.location }));
    campuses?.forEach(u => dbMap.set(u.id, { ...u, role: 'campus', full_name: u.name, city: u.location }));
    government?.forEach(u => dbMap.set(u.id, { ...u, role: 'government', full_name: u.name, city: u.location }));

    // 3. Loop utama berdasarkan Auth (Karena Auth adalah kebenaran tunggal user yang ada)
    const unified = authUsers.users.map(au => {
      const dbData = dbMap.get(au.id);
      
      return {
        id: au.id,
        email: au.email,
        // Prioritas Nama: Data Tabel DB > User Metadata Auth > Email
        full_name: dbData?.full_name || au.raw_user_meta_data?.full_name || au.raw_user_meta_data?.name || au.email?.split('@')[0],
        // Prioritas Role: Data Tabel DB > User Metadata Auth > Default Talent
        role: dbData?.role || au.raw_user_meta_data?.role || 'talent',
        city: dbData?.city || au.raw_user_meta_data?.city || "Lokasi Nihil",
        is_verified: dbData?.is_verified || false,
        email_confirmed_at: au.email_confirmed_at || null,
        last_sign_in_at: au.last_sign_in_at || null,
        created_at: au.created_at
      };
    });

    return unified.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (err: any) {
    console.error("Fetch Error Unified Users:", err.message);
    return [];
  }
}

/**
 * AMBIL DATA RISET MENTAH (Untuk Dashboard Analytics)
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
 * LOG AUDIT UNTUK MANUAL INPUT
 */
export async function getManualInputAudit() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("manual_input_logs")
      .select("*")
      .eq("is_reviewed", false);
    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

/**
 * MANAJEMEN AUTH USER (AKSI SAKTI ADMIN)
 * Terintegrasi dengan UserManagement UI
 */
export async function manageUserAuth(action: string, userId: string, extra?: any) {
  try {
    const admin = createAdminClient();

    switch (action) {
      case "FORCE_CONFIRM":
      case "VERIFY_EMAIL":
        const { error: verError } = await admin.auth.admin.updateUserById(userId, {
          email_confirm: true
        });
        return { error: verError };

      case "SUSPEND":
      case "BAN_USER":
        const { error: banError } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: '87600h' // Suspend 10 tahun
        });
        return { error: banError };

      case "DELETE_USER":
        const { error: delError } = await admin.auth.admin.deleteUser(userId);
        return { error: delError };

      case "RESET_PASSWORD":
        const { error: resError } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email: extra // Menggunakan email sebagai identitas
        });
        return { error: resError };

      case "RESEND_CONFIRMATION":
        const { error: sendError } = await admin.auth.resend({
          type: 'signup',
          email: extra,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          }
        });
        return { error: sendError };

      default:
        return { error: "Action not found" };
    }
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * UPDATE MASAL ATAU TUNGGAL UNTUK TABEL DATABASE
 */
export async function manageAdminUser(action: string, table: string, payload: any) {
  try {
    const admin = createAdminClient();
    
    if (action === "DELETE") {
      return await admin.from(table).delete().eq("id", payload.id);
    }
    
    if (action === "UPDATE") {
      const { id, ...data } = payload;
      return await admin.from(table).update(data).eq("id", id);
    }

    if (action === "BULK_UPDATE") {
      const { ids, ...data } = payload;
      return await admin.from(table).update(data).in("id", ids);
    }

    if (action === "BULK_DELETE") {
      return await admin.from(table).delete().in("id", payload);
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}