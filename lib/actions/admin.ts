"use server"

import { supabase } from "@/lib/supabase"

/**
 * PUSAT DATA NASIONAL
 * Mengambil statistik demografi dasar & korelasi ragam disabilitas.
 */
export async function getNationalStats() {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("disability_type, career_status, role, city, education_level")

    if (error) throw error

    const talents = profiles.filter(p => p.role === "talent")
    
    // Agregasi Ragam Disabilitas (Data Mahal)
    const disabilityDist = talents.reduce((acc: any, curr) => {
      const type = curr.disability_type || "Tidak Terisi"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    // Agregasi Pendidikan vs Disabilitas (Korelasi)
    const eduDist = talents.reduce((acc: any, curr) => {
      const edu = curr.education_level || "N/A"
      acc[edu] = (acc[edu] || 0) + 1
      return acc
    }, {})

    return {
      totalTalents: talents.length,
      totalCompanies: profiles.filter(p => p.role === "company").length,
      disabilityDistribution: disabilityDist,
      educationDistribution: eduDist,
      employmentRate: {
        employed: talents.filter(t => 
          t.career_status === "Pegawai Swasta" || 
          t.career_status === "Pegawai BUMN" || 
          t.career_status === "ASN (PNS / PPPK)" ||
          t.career_status === "Wiraswasta / Entrepreneur"
        ).length,
        seeking: talents.filter(t => t.career_status === "Job Seeker" || t.career_status === "Belum Bekerja").length
      }
    }
  } catch (error) {
    console.error("Error fetching national stats:", error)
    return null
  }
}

/**
 * ANALISA RISET LONGITUDINAL & TRANSISI
 * Menggunakan view research_transition_analysis & career_status_history.
 */
export async function getTransitionInsights() {
  try {
    // Ambil data transisi dasar
    const { data: transitionData, error: tError } = await supabase
      .from("research_transition_analysis")
      .select("*")

    if (tError) throw tError

    // Ambil data trend waktu (Longitudinal) dari tabel history
    const { data: historyData, error: hError } = await supabase
      .from("career_status_history")
      .select("*")
      .order("changed_at", { ascending: true })

    if (hError) throw hError

    // Analisis Sederhana: Kecepatan Transisi
    const inklusiWork = transitionData.filter(d => d.education_model === "Sekolah Reguler / inklusi" && d.career_status !== "Job Seeker").length
    const slbWork = transitionData.filter(d => d.education_model === "Sekolah Luar Biasa (SLB)" && d.career_status !== "Job Seeker").length

    return {
      raw: transitionData,
      historyTrend: historyData,
      narrative: `Hasil riset menunjukkan ${inklusiWork} lulusan Inklusi dan ${slbWork} lulusan SLB telah terserap kerja. Trend longitudinal mencatat ${historyData.length} pergerakan status karir secara nasional.`
    }
  } catch (error) {
    console.error("Error transition insights:", error)
    return { raw: [], historyTrend: [], narrative: "Gagal analisis." }
  }
}

/**
 * AUDIT DATA MANUAL (THE CLEANUP)
 * Mengambil log dari tabel manual_input_logs untuk standardisasi.
 */
export async function getManualInputAudit() {
  try {
    const { data, error } = await supabase
      .from("manual_input_logs")
      .select("*")
      .eq("is_reviewed", false)
      .order("occurrence_count", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error audit logs:", error)
    return []
  }
}

/**
 * FITUR MERGE DATA (SUPER ADMIN)
 * Menggabungkan input manual user ke data resmi dan menandai sudah diperiksa.
 */
export async function mergeManualInput(logId: string, officialValue: string, fieldName: string) {
    try {
        // 1. Update log audit
        await supabase
            .from("manual_input_logs")
            .update({ is_reviewed: true })
            .eq("id", logId)

        // 2. Idealnya di sini ada logika update profil user yang bersangkutan 
        // tapi ini memerlukan list user_ids yang melakukan input tersebut.
        return { success: true }
    } catch (e) { return { success: false } }
}

/**
 * MANAJEMEN AKUN (Pusat Kontrol)
 * Menambah, Mengedit, Menghapus User/Partner/Gov.
 */
export async function manageAdminUser(action: "ADD" | "EDIT" | "DELETE", table: "profiles" | "companies", payload: any) {
  try {
    if (action === "DELETE") {
      const { error } = await supabase.from(table).delete().eq("id", payload.id)
      if (error) throw error
    } else if (action === "EDIT") {
      const { error } = await supabase.from(table).update(payload).eq("id", payload.id)
      if (error) throw error
    } else if (action === "ADD") {
      const { error } = await supabase.from(table).insert(payload)
      if (error) throw error
    }
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * MANAJEMEN LOCK OTORITAS (Gov & Partner)
 */
export async function setupAdminLock(profileId: string, lockType: "agency" | "partner", lockValue: string) {
  try {
    const updateData = lockType === "agency" 
      ? { admin_agency_lock: lockValue } 
      : { admin_partner_lock: lockValue };

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profileId)
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
