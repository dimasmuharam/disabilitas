"use server"

// Kita import supabaseAdmin (Kunci Master) untuk bypass RLS
import { supabaseAdmin } from "@/lib/supabase"

/**
 * PUSAT DATA NASIONAL (RESEARCH AGGREGATOR)
 * Menggunakan supabaseAdmin untuk memastikan data 10 responden Mas terbaca sepenuhnya.
 */
export async function getNationalStats() {
  try {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        disability_type, career_status, education_level, 
        education_model, scholarship_type, education_barrier,
        used_assistive_tools, preferred_accommodations,
        has_laptop, has_smartphone, internet_quality
      `)

    if (error) throw error
    if (!profiles || profiles.length === 0) return null

    // 1. Helper Distribusi Nilai Tunggal
    const countDist = (arr: any[], key: string) => {
      return arr.reduce((acc: any, curr) => {
        const val = curr[key] || "Tidak Terisi"
        acc[val] = (acc[val] || 0) + 1
        return acc
      }, {})
    }

    // 2. Helper Distribusi Nilai Array (Multi-select)
    const countArrayDist = (arr: any[], key: string) => {
      const dist: any = {}
      arr.forEach(item => {
        const values = item[key] || []
        if (Array.isArray(values)) {
          values.forEach((v: string) => {
            dist[v] = (dist[v] || 0) + 1
          })
        } else if (values && typeof values === 'string') {
          dist[values] = (dist[values] || 0) + 1
        }
      })
      return dist
    }

    return {
      totalTalents: profiles.length,
      disabilityDist: countDist(profiles, "disability_type"),
      careerDist: countDist(profiles, "career_status"),
      eduModelDist: countDist(profiles, "education_model"),
      scholarshipDist: countDist(profiles, "scholarship_type"),
      barrierDist: countDist(profiles, "education_barrier"),
      toolsDist: countArrayDist(profiles, "used_assistive_tools"),
      accDist: countArrayDist(profiles, "preferred_accommodations"),
      digitalAssets: {
        laptop: profiles.filter(p => p.has_laptop).length,
        smartphone: profiles.filter(p => p.has_smartphone).length,
        internet: countDist(profiles, "internet_quality"),
        internetFiberPct: Math.round((profiles.filter(p => p.internet_quality === 'fiber').length / profiles.length) * 100) || 0
      },
      employmentRate: {
        employed: profiles.filter(t => 
          ["Pegawai Swasta", "Pegawai BUMN / BUMD", "ASN (PNS / PPPK)", "Wiraswasta / Entrepreneur"].includes(t.career_status)
        ).length,
        seeking: profiles.filter(t => t.career_status === "Job Seeker" || t.career_status === "Belum Bekerja").length
      }
    }
  } catch (error) {
    console.error("[NATIONAL_STATS_ERROR]:", error)
    return null
  }
}

/**
 * ANALISA TRANSISI & DATA LONGITUDINAL
 */
export async function getTransitionInsights() {
  try {
    const { data: transitionData, error: tError } = await supabaseAdmin
      .from("research_transition_analysis")
      .select("*")

    if (tError) {
      const { data: fallbackData } = await supabaseAdmin.from("profiles").select("education_model, career_status")
      const inklusiWork = fallbackData?.filter(d => d.education_model?.includes("inklusi") && d.career_status !== "Job Seeker").length || 0
      return {
        narrative: `Data transisi sedang dikalkulasi manual. Tercatat ${inklusiWork} responden inklusi telah terserap kerja.`
      }
    }

    const inklusiWork = transitionData?.filter(d => d.education_model?.includes("inklusi") && d.career_status !== "Belum Terserap").length || 0
    const slbWork = transitionData?.filter(d => d.education_model?.includes("SLB") && d.career_status !== "Belum Terserap").length || 0

    return {
      raw: transitionData,
      narrative: `Dataset riset mencatat ${inklusiWork} lulusan model Inklusi dan ${slbWork} lulusan SLB berhasil terserap kerja secara nasional.`
    }
  } catch (error) {
    return { narrative: "Sistem sedang mengagregasi data transisi..." }
  }
}

/**
 * AUDIT DATA MANUAL
 */
export async function getManualInputAudit() {
  try {
    const { data, error } = await supabaseAdmin
      .from("manual_input_logs")
      .select("*")
      .eq("is_reviewed", false)
      .order("occurrence_count", { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]:", error)
    return []
  }
}

/**
 * MANAJEMEN USER (ADMIN ACTIONS)
 */
export async function manageAdminUser(action: "EDIT" | "DELETE", table: "profiles" | "companies", payload: any) {
  try {
    if (action === "DELETE") {
      const { error } = await supabaseAdmin.from(table).delete().eq("id", payload.id)
      if (error) throw error
    } else if (action === "EDIT") {
      const { error } = await supabaseAdmin.from(table).update(payload).eq("id", payload.id)
      if (error) throw error
    }
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * SETUP ADMIN LOCK
 */
export async function setupAdminLock(profileId: string, lockType: "agency" | "partner", lockValue: string) {
  try {
    const updateData = lockType === "agency" 
      ? { admin_agency_lock: lockValue } 
      : { admin_partner_lock: lockValue };

    const { data, error } = await supabaseAdmin
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