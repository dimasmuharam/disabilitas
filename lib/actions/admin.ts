"use server"

import { createAdminClient } from "@/lib/supabase"

export async function getNationalStats() {
  try {
    const admin = createAdminClient();

    // Menarik data profil untuk statistik nasional
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

    if (error) {
      console.error("Gagal menarik data:", error.message);
      return { totalTalents: 0, error: error.message };
    }

    if (!profiles || profiles.length === 0) {
      return { totalTalents: 0, empty: true };
    }

    // --- PROSES DATA (Logic yang Mas sudah buat) ---
    
    // Contoh penghitungan sederhana untuk memastikan data mengalir
    const stats = {
      totalTalents: profiles.length,
      disabilityDist: profiles.reduce((acc: any, p: any) => {
        const type = p.disability_type || 'Lainnya';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      employmentRate: {
        employed: profiles.filter((p: any) => p.career_status === 'Bekerja').length,
        seeking: profiles.filter((p: any) => p.career_status === 'Mencari Kerja').length,
      },
      // ... Mas bisa tambahkan logika distribusi lainnya di sini ...
    };

    return stats;

  } catch (err: any) {
    console.error("System Error:", err.message);
    return { totalTalents: 0, error: "Terjadi kesalahan sistem internal." };
  }
}