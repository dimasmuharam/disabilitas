"use server"

import { createClient } from "@/lib/supabase/client/server";
import { revalidatePath } from "next/cache";

/**
 * Mengirimkan penilaian inklusi anonim dari talenta.
 * Mencakup 4 indikator utama riset kepuasan kerja inklusif.
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
  const supabase = createClient();
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
        throw new Error("Anda sudah memberikan penilaian untuk posisi ini.");
      }
      throw error
    }
    
    // Refresh halaman lowongan dan dashboard agar skor terbaru muncul
    revalidatePath("/lowongan");
    revalidatePath("/dashboard");
    
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Error posting rating:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Mengecek apakah talenta sudah memberikan rating untuk lowongan tertentu.
 */
export async function checkIfAlreadyRated(talentId: string, jobId: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("inclusion_ratings")
      .select("id")
      .eq("talent_id", talentId)
      .eq("job_id", jobId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error: any) {
    console.error("Error checking rating status:", error.message);
    return false;
  }
}

/**
 * Mengambil rata-rata rating (agregat) untuk profil publik perusahaan.
 */
export async function getCompanyRatingAggregate(companyId: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("inclusion_ratings")
      .select("score_accessibility, score_culture, score_management, score_onboarding")
      .eq("company_id", companyId)

    if (error) throw error
    if (!data || data.length === 0) return null

    const count = data.length;
    const sum = (key: string) => data.reduce((acc, curr: any) => acc + (curr[key] || 0), 0);

    const avgAccessibility = sum("score_accessibility") / count;
    const avgCulture = sum("score_culture") / count;
    const avgManagement = sum("score_management") / count;
    const avgOnboarding = sum("score_onboarding") / count;

    return {
      count,
      accessibility: avgAccessibility,
      culture: avgCulture,
      management: avgManagement,
      onboarding: avgOnboarding,
      totalAvg: (avgAccessibility + avgCulture + avgManagement + avgOnboarding) / 4
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
  const supabase = createClient();
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
    console.error("Error fetching reviews:", error.message)
    return { data: [], error: error.message }
  }
}
