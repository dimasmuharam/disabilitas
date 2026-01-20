"use server"

import { createAdminClient } from "@/lib/supabase"

// 1. FUNGSI UTAMA YANG KITA KERJAKAN (Statistik Nasional)
export async function getNationalStats() {
  try {
    const admin = createAdminClient();
    const { data: profiles, error } = await admin
      .from("profiles")
      .select(`
        disability_type, 
        career_status, 
        education_level, 
        education_model,
        scholarship_type,
        education_barrier,
        used_assistive_tools,
        preferred_accommodations,
        has_laptop,
        has_smartphone,
        internet_quality
      `)

    if (error) return { totalTalents: 0, error: error.message };
    if (!profiles || profiles.length === 0) return { totalTalents: 0, empty: true };

    return {
      totalTalents: profiles.length,
      disabilityDist: profiles.reduce((acc: any, p: any) => {
        const type = p.disability_type || 'Lainnya';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      employmentRate: {
        employed: profiles.filter((p: any) => p.career_status === 'Bekerja').length,
        seeking: profiles.filter((p: any) => p.career_status === 'Mencari Kerja').length,
      }
    };
  } catch (err: any) {
    return { totalTalents: 0, error: err.message };
  }
}

// 2. FUNGSI-FUNGSI PENDUKUNG (Agar Build Tidak Error)
// Kita buat fungsi kosong dulu supaya sistem bisa jalan
export async function getTransitionInsights() { return null; }
export async function getManualInputAudit() { return null; }
export async function setupAdminLock() { return null; }
export async function manageAdminUser() { return null; }