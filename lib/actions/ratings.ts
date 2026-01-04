import { supabase } from "@/lib/supabase"

/**
 * Mengirimkan penilaian inklusi anonim dari talenta.
 * Mencakup 4 indikator utama riset kepuasan kerja inklusif.
 * Dihubungkan dengan jobId untuk melacak pengalaman spesifik per lowongan.
 */
export async function postInclusionRating(ratingData: {
  talentId: string,
  companyId: string,
  jobId: string, 
  accessibility: number,
  culture: number,
  management: number,
  onboarding: number,
  comment?: string
}) {
  try {
    const { data, error } = await supabase
      .from("inclusion_ratings")
      .insert({
        talent_id: ratingData.talentId,
        company_id: ratingData.companyId,
        job_id: ratingData.jobId,
        score_accessibility: ratingData.accessibility,
        score_culture: ratingData.culture,
        score_management: ratingData.management,
        score_onboarding: ratingData.onboarding,
        comment_anonymous: ratingData.comment,
        is_published: true,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Menangani duplikasi rating (Unique Constraint: talent_id + job_id)
      if (error.code === "23505") {
        throw new Error("Anda sudah memberikan penilaian untuk lamaran pada posisi ini.");
      }
      throw error
    }
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Error posting rating:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Mengecek apakah talenta sudah memberikan rating untuk lowongan tertentu.
 * Penting untuk mengatur logika tampilan tombol di Dashboard Talenta.
 */
export async function checkIfAlreadyRated(talentId: string, jobId: string) {
  try {
    const { data, error } = await supabase
      .from("inclusion_ratings")
      .select("id")
      .eq("talent_id", talentId)
      .eq("job_id", jobId)
      .maybeSingle();

    if (error) throw error;
    return !!data; // Mengembalikan true jika data ditemukan, false jika tidak.
  } catch (error: any) {
    console.error("Error checking rating status:", error.message);
    return false;
  }
}

/**
 * Mengambil rata-rata rating (agregat) untuk profil publik perusahaan.
 * Digunakan untuk menampilkan 'Inclusion Score' di halaman lowongan kerja.
 */
export async function getCompanyRatingAggregate(companyId: string) {
  try {
    const { data, error } = await supabase
      .from("inclusion_ratings")
      .select("score_accessibility, score_culture, score_management, score_onboarding")
      .eq("company_id", companyId)

    if (error) throw error
    if (!data || data.length === 0) return null

    const count = data.length
    const sum = (key: string) => data.reduce((acc, curr: any) => acc + curr[key], 0)

    return {
      count,
      accessibility: sum("score_accessibility") / count,
      culture: sum("score_culture") / count,
      management: sum("score_management") / count,
      onboarding: sum("score_onboarding") / count,
      totalAvg: (sum("score_accessibility") + sum("score_culture") + sum("score_management") + sum("score_onboarding")) / (4 * count)
    }
  } catch (error: any) {
    console.error("Error aggregating ratings:", error.message)
    return null
  }
}

/**
 * FUNGSI ADMIN: Mengambil ulasan terbaru untuk audit konten.
 */
export async function getLatestInclusionReviews(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("inclusion_ratings")
      .select(`
        *,
        companies ( name ),
        profiles ( full_name )
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}
