"use server"

import { createAdminClient } from "@/lib/supabase"

/**
 * AMBIL DATA SELURUH EKOSISTEM (The Great Union V2)
 * Menggabungkan data dari 5 tabel database DAN data status dari Supabase Auth.
 */
export async function getAllSystemUsers() {
  try {
    const admin = createAdminClient();

    // 1. Ambil data dari 5 tabel database & Daftar User dari Auth secara paralel
    const [
      { data: authUsers, error: authError },
      { data: talents },
      { data: companies },
      { data: partners },
      { data: campuses },
      { data: government }
    ] = await Promise.all([
      admin.auth.admin.listUsers(), // Ambil data konfirmasi email & last login
      admin.from("profiles").select("id, full_name, email, city, created_at, is_verified"),
      admin.from("companies").select("id, name, email, location, created_at, is_verified"),
      admin.from("partners").select("id, name, email, location, created_at, is_verified"),
      admin.from("campuses").select("id, name, email, location, created_at, is_verified"),
      admin.from("government").select("id, name, email, location, created_at, is_verified")
    ]);

    if (authError) throw authError;

    // 2. Mapping data database ke format standar
    const dbUsers = [
      ...(talents?.map(u => ({ ...u, role: 'talent' })) || []),
      ...(companies?.map(u => ({ ...u, role: 'company', full_name: u.name, city: u.location })) || []),
      ...(partners?.map(u => ({ ...u, role: 'partner', full_name: u.name, city: u.location })) || []),
      ...(campuses?.map(u => ({ ...u, role: 'campus', full_name: u.name, city: u.location })) || []),
      ...(government?.map(u => ({ ...u, role: 'government', full_name: u.name, city: u.location })) || []),
    ];

    // 3. Inject status dari Auth (email_confirmed_at) ke tiap user database
    const unified = dbUsers.map(user => {
      const authData = authUsers.users.find(au => au.id === user.id);
      return {
        ...user,
        email_confirmed_at: authData?.email_confirmed_at || null,
        last_sign_in_at: authData?.last_sign_in_at || null
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
 * MANAJEMEN AUTH USER (AKSI SAKTI)
 */
export async function manageUserAuth(action: string, userId: string, extra?: any) {
  try {
    const admin = createAdminClient();

    switch (action) {
      case "RESET_PASSWORD":
        // Generate recovery link (extra = email)
        const { error: resError } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email: extra 
        });
        return { error: resError };

      case "BAN_USER":
        // Suspend user selama 10 tahun
        const { error: banError } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: '87600h'
        });
        return { error: banError };

      case "DELETE_USER":
        // Hapus permanen dari Auth
        const { error: delError } = await admin.auth.admin.deleteUser(userId);
        return { error: delError };

      case "VERIFY_EMAIL":
        // Paksa verifikasi email tanpa klik link
        const { error: verError } = await admin.auth.admin.updateUserById(userId, {
          email_confirm: true
        });
        return { error: verError };

      case "RESEND_CONFIRMATION":
        // Kirim ulang email konfirmasi (extra = email)
        // Note: Gunakan method resend dari auth client
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
 * LOG AUDIT & MANAJEMEN TABEL BIASA
 */
export async function getManualInputAudit() {
  const admin = createAdminClient();
  const { data } = await admin.from("manual_input_logs").select("*").eq("is_reviewed", false);
  return data || [];
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