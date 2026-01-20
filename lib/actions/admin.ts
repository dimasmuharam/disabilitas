"use server"

import { createAdminClient } from "@/lib/supabase"

// Kita pastikan helper ini bisa berjalan di Edge Runtime
export const runtime = "edge";

/**
 * 1. ANALISIS NASIONAL (NATIONAL ANALYTICS)
 * Dioptimalkan untuk memproses data 11 responden (atau ribuan nantinya) secara cepat.
 */
export async function getNationalStats() {
  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select("*");

    if (error) return { totalTalents: 0, error: error.message };
    if (!profiles || profiles.length === 0) return { totalTalents: 0, empty: true };

    const total = profiles.length;

    // Helper Distribusi Kolom Tunggal
    const countDist = (key: string) => profiles.reduce((acc: any, p: any) => {
      const val = p[key] || 'Tidak Terisi';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    // Helper Distribusi Kolom Array (Hambatan & Alat Bantu)
    const countArrayDist = (key: string) => profiles.reduce((acc: any, p: any) => {
      const arr = p[key] || [];
      if (Array.isArray(arr)) {
        arr.forEach((item: string) => {
          acc[item] = (acc[item] || 0) + 1;
        });
      }
      return acc;
    }, {});

    return {
      totalTalents: total,
      disabilityDist: countDist('disability_type'),
      employmentRate: {
        employed: profiles.filter(p => 
          ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur', 'Freelancer / Tenaga Lepas'].includes(p.career_status)
        ).length,
        seeking: profiles.filter(p => 
          ['Job Seeker', 'Fresh Graduate', 'Belum Bekerja'].includes(p.career_status)
        ).length,
      },
      barrierDist: countArrayDist('education_barrier'),
      toolsDist: countArrayDist('used_assistive_tools'),
      accDist: countArrayDist('preferred_accommodations'),
      eduModelDist: countDist('education_model'),
      scholarshipDist: countDist('scholarship_type'),
      digitalAssets: {
        laptop: profiles.filter(p => p.has_laptop === true).length,
        smartphone: profiles.filter(p => p.has_smartphone === true).length,
        internetFiberPct: Math.round((profiles.filter(p => p.internet_quality === 'fiber').length / total) * 100) || 0
      }
    };
  } catch (err: any) {
    return { totalTalents: 0, error: err.message };
  }
}

/**
 * 2. DATA AUDIT (AUDIT HUB)
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
  } catch (err) {
    return [];
  }
}

/**
 * 3. MANAJEMEN USER & VERIFIKASI (UPDATE & DELETE)
 * Fungsi ini krusial untuk fitur 'Verifikasi' dan 'Hapus' di dashboard.
 */
export async function manageAdminUser(action: "UPDATE" | "DELETE", table: string, payload: any) {
  try {
    const admin = createAdminClient();
    const { id, ...updateData } = payload;

    if (action === "DELETE") {
      const { error } = await admin.from(table).delete().eq("id", id);
      return { error };
    }

    if (action === "UPDATE") {
      const { error } = await admin.from(table).update(updateData).eq("id", id);
      return { error };
    }

    return { error: "Action not recognized" };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * 4. GHOST FUNCTIONS (Maintenance)
 */
export async function getTransitionInsights() { return []; }

export async function setupAdminLock(profileId: string, type: string, value: string) {
  try {
    const admin = createAdminClient();
    const updateData: any = {};
    if (type === "agency") updateData.admin_agency_lock = value;
    if (type === "partner") updateData.admin_partner_lock = value;

    const { error } = await admin.from("profiles").update(updateData).eq("id", profileId);
    return { error };
  } catch (err: any) {
    return { error: err.message };
  }
}