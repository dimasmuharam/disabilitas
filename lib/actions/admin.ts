"use server"

import { createAdminClient } from "@/lib/supabase"

/**
 * MENGAMBIL STATISTIK NASIONAL
 */
export async function getNationalStats() {
  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin.from("profiles").select("*");
    
    if (error) return { totalTalents: 0, error: error.message };
    if (!profiles || profiles.length === 0) return { totalTalents: 0, empty: true };

    const total = profiles.length;

    // Helper untuk distribusi variabel tunggal
    const countDist = (key: string) => profiles.reduce((acc: any, p: any) => {
      const val = p[key] || 'Tidak Terisi';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    // Helper untuk distribusi variabel array (Multi-select)
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
        employed: profiles.filter(p => ['Pegawai Swasta', 'Pegawai BUMN / BUMD', 'ASN (PNS / PPPK)', 'Wiraswasta / Entrepreneur', 'Freelancer / Tenaga Lepas'].includes(p.career_status)).length,
        seeking: profiles.filter(p => ['Job Seeker', 'Fresh Graduate', 'Belum Bekerja'].includes(p.career_status)).length,
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
 * MENGAMBIL LOG AUDIT INPUT MANUAL
 */
export async function getManualInputAudit() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("manual_input_logs")
      .select("*")
      .eq("is_reviewed", false)
      .order("occurrence_count", { ascending: false });
    return data || [];
  } catch (err) {
    return [];
  }
}

/**
 * MANAJEMEN DATA (DELETE, UPDATE, BULK)
 * PERBAIKAN: Menggunakan 'action: string' agar TypeScript menerima BULK_UPDATE
 */
export async function manageAdminUser(action: string, table: string, payload: any) {
  try {
    const admin = createAdminClient();
    
    // Hapus satu data
    if (action === "DELETE") {
      const { error } = await admin.from(table).delete().eq("id", payload.id);
      return { error };
    }

    // Update satu data (Verifikasi tunggal)
    if (action === "UPDATE") {
      const { id, ...updateData } = payload;
      const { error } = await admin.from(table).update(updateData).eq("id", id);
      return { error };
    }

    // UPDATE MASSAL (Fitur Baru untuk Verifikasi Massal)
    if (action === "BULK_UPDATE") {
      const { ids, ...updateData } = payload;
      const { error } = await admin.from(table).update(updateData).in("id", ids);
      return { error };
    }

    return { error: null };
  } catch (err: any) {
    return { error: err.message };
  }
}