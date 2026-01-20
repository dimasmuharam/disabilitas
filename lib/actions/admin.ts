"use server"

import { createAdminClient } from "@/lib/supabase"

/**
 * 1. ANALISIS NASIONAL (NATIONAL ANALYTICS)
 * Mengolah data dari tabel 'profiles' berdasarkan skema asli Supabase
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

    // Helper untuk menghitung distribusi kolom TEXT (Contoh: disability_type)
    const countDist = (key: string) => profiles.reduce((acc: any, p: any) => {
      const val = p[key] || 'Tidak Terisi';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    // Helper untuk menghitung distribusi kolom ARRAY (Contoh: education_barrier, used_assistive_tools)
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
      
      // Distribusi Ragam Disabilitas
      disabilityDist: countDist('disability_type'),

      // Status Karir (Disesuaikan dengan CHECK constraint di skema)
      employmentRate: {
        employed: profiles.filter(p => 
          ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur', 'Freelancer / Tenaga Lepas'].includes(p.career_status)
        ).length,
        seeking: profiles.filter(p => 
          ['Job Seeker', 'Fresh Graduate', 'Belum Bekerja'].includes(p.career_status)
        ).length,
      },

      // Variabel Pendidikan & Hambatan (Tipe ARRAY di skema)
      barrierDist: countArrayDist('education_barrier'),
      toolsDist: countArrayDist('used_assistive_tools'),
      accDist: countArrayDist('preferred_accommodations'),
      
      // Variabel Tambahan
      eduModelDist: countDist('education_model'),
      scholarshipDist: countDist('scholarship_type'),

      // Kesiapan Digital
      digitalAssets: {
        laptop: profiles.filter(p => p.has_laptop === true).length,
        smartphone: profiles.filter(p => p.has_smartphone === true).length,
        // Cek kualitas internet 'fiber' sesuai skema
        internetFiberPct: Math.round((profiles.filter(p => p.internet_quality === 'fiber').length / total) * 100) || 0
      }
    };
  } catch (err: any) {
    console.error("Critical Error in getNationalStats:", err.message);
    return { totalTalents: 0, error: err.message };
  }
}

/**
 * 2. DATA AUDIT (AUDIT HUB)
 * Mengambil data dari tabel asli 'manual_input_logs'
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
    console.error("Error fetching audit logs:", err);
    return [];
  }
}

/**
 * 3. GHOST FUNCTIONS (Untuk Menjaga Kelancaran Build)
 * Fungsi ini disiapkan agar admin-dashboard.tsx tidak error saat build
 */

export async function getTransitionInsights(...args: any[]) {
  // Mas bisa menghubungkan ini ke tabel career_status_history jika diperlukan nanti
  return []; 
}

export async function setupAdminLock(profileId: string, type: string, value: string) {
  try {
    const admin = createAdminClient();
    const updateData: any = {};
    if (type === "agency") updateData.admin_agency_lock = value;
    if (type === "partner") updateData.admin_partner_lock = value;

    const { error } = await admin
      .from("profiles")
      .update(updateData)
      .eq("id", profileId);

    return { error };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function manageAdminUser(action: string, table: string, data: any) {
  try {
    const admin = createAdminClient();
    if (action === "DELETE" && table === "profiles") {
      const { error } = await admin
        .from("profiles")
        .delete()
        .eq("id", data.id);
      return { error };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}