"use server"

import { createAdminClient } from "@/lib/supabase"

/**
 * AMBIL DATA SELURUH EKOSISTEM (The Great Union V3 - Final Fix)
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

    const dbMap = new Map();
    
    talents?.forEach(u => dbMap.set(u.id, { ...u, role: 'talent' }));
    companies?.forEach(u => dbMap.set(u.id, { ...u, role: 'company', full_name: u.name, city: u.location }));
    partners?.forEach(u => dbMap.set(u.id, { ...u, role: 'partner', full_name: u.name, city: u.location }));
    campuses?.forEach(u => dbMap.set(u.id, { ...u, role: 'campus', full_name: u.name, city: u.location }));
    government?.forEach(u => dbMap.set(u.id, { ...u, role: 'government', full_name: u.name, city: u.location }));

    const unified = authUsers.users.map(au => {
      const dbData = dbMap.get(au.id);
      const meta = au.user_metadata; 
      
      return {
        id: au.id,
        email: au.email,
        full_name: dbData?.full_name || meta?.full_name || meta?.name || au.email?.split('@')[0],
        role: dbData?.role || meta?.role || 'talent',
        city: dbData?.city || meta?.city || meta?.location || "Lokasi Nihil",
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
 * AMBIL DATA RISET MENTAH (The Research Engine V4 - TRUE Longitudinal Edition)
 * Mengambil Profil, Log Hiring, dan Analisis Perjalanan Karir dari View.
 */
export async function getRawResearchData() {
  try {
    const admin = createAdminClient();

    const [resProfiles, resLogs, resCareerHistory] = await Promise.all([
      admin.from("profiles").select("*"),
      admin.from("application_logs").select(`
        id,
        log_time:created_at,
        old_status,
        new_status,
        hrd_notes_snapshot,
        profiles:applicant_id (
          full_name,
          disability_type,
          education_level,
          university,
          education_model,
          major
        ),
        jobs:job_id ( title ),
        companies:company_id ( name )
      `).order('created_at', { ascending: false }),
      admin.from("research_longitudinal_career").select("*").order('changed_at', { ascending: false })
    ]);

    if (resProfiles.error) throw resProfiles.error;
    if (resLogs.error) throw resLogs.error;
    if (resCareerHistory.error) throw resCareerHistory.error;

    const researchLogs = resLogs.data?.map((log: any) => ({
      id: log.id,
      log_time: log.log_time,
      old_status: log.old_status,
      new_status: log.new_status,
      hrd_notes_snapshot: log.hrd_notes_snapshot,
      talent_name: log.profiles?.full_name,
      disability_type: log.profiles?.disability_type,
      education_level: log.profiles?.education_level,
      university: log.profiles?.university,
      education_model: log.profiles?.education_model,
      major: log.profiles?.major,
      job_title: log.jobs?.title,
      company_name: log.companies?.name
    })) || [];

    const careerTimeline = resCareerHistory.data || [];

    return {
      profiles: resProfiles.data || [],
      researchLogs: researchLogs,
      careerTimeline: careerTimeline 
    };

  } catch (err: any) {
    console.error("Research Data Error:", err.message);
    return { profiles: [], researchLogs: [], careerTimeline: [] };
  }
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
 * VERIFIKASI HUB: Ambil Antrean Verifikasi Lembaga (New Feature)
 * Mengambil data dari verification_requests yang berstatus pending.
 */
export async function getVerificationQueue() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("verification_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err: any) {
    console.error("Verification Queue Error:", err.message);
    return [];
  }
}

/**
 * PROSES VERIFIKASI LEMBAGA (Approve/Reject)
 * Fungsi universal untuk mengubah status di tabel request dan tabel institusi target.
 */
export async function processVerification(requestId: string, targetId: string, targetType: string, isApprove: boolean, notes?: string) {
  try {
    const admin = createAdminClient();
    const newStatus = isApprove ? 'verified' : 'rejected';
    
    // 1. Update Tabel Antrean Request
    const { error: requestError } = await admin
      .from("verification_requests")
      .update({ 
        status: newStatus, 
        admin_notes: notes,
        processed_at: new Date().toISOString()
      })
      .eq("id", requestId);

    if (requestError) throw requestError;

    // 2. Update Tabel Institusi (Trigger sync_verification_status akan otomatis memproses is_verified)
    const tableMap: Record<string, string> = {
      'company': 'companies',
      'partner': 'partners',
      'campus': 'campuses',
      'government': 'government'
    };

    const targetTable = tableMap[targetType];
    if (!targetTable) throw new Error("Target type institusi tidak valid");

    const { error: entityError } = await admin
      .from(targetTable)
      .update({ 
        verification_status: newStatus,
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", targetId);

    if (entityError) throw entityError;

    return { success: true };
  } catch (err: any) {
    console.error("Processing Verification Error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * MANAJEMEN AUTH USER (AKSI ADMIN)
 */
export async function manageUserAuth(action: string, userId: string, extra?: any) {
  try {
    const admin = createAdminClient();

    switch (action) {
      case "FORCE_CONFIRM":
        const { error: confirmError } = await admin.auth.admin.updateUserById(userId, {
          email_confirm: true
        });
        return { error: confirmError };

      case "BAN_USER":
      case "SUSPEND":
        const { error: banError } = await admin.auth.admin.updateUserById(userId, {
          ban_duration: '87600h' 
        });
        return { error: banError };

      case "DELETE_USER":
        const { error: delError } = await admin.auth.admin.deleteUser(userId);
        return { error: delError };

      case "RESET_PASSWORD":
        const { error: resError } = await admin.auth.admin.generateLink({
          type: 'recovery',
          email: extra 
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
 * MANAJEMEN TABEL DATABASE BIASA
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