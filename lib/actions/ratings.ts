import { supabase } from "@/lib/supabase"

/**
 * Mengirimkan penilaian inklusi anonim dari talenta.
 * Mencakup 4 indikator utama riset kepuasan kerja inklusif.
 */
export async function postInclusionRating(ratingData: {
  talentId: string,
  companyId: string,
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
        score_accessibility: ratingData.accessibility,
        score_culture: ratingData.culture,
        score_management: ratingData.management,
        score_onboarding: ratingData.onboarding,
        comment_anonymous: ratingData.comment,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Menangani duplikasi rating (Unique Constraint: talent_id + company_id)
      if (error.code === "23505") throw new Error("Anda sudah memberikan penilaian untuk perusahaan ini.")
      throw error
    }
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Error posting rating:", error.message)
    return { success: false, error: error.message }
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
 * Membantu Super Admin memantau kualitas interaksi antara talenta dan perusahaan.
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
