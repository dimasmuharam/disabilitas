"use server"

import { supabase } from "@/lib/supabase"

/**
 * PUSAT DATA NASIONAL (RESEARCH AGGREGATOR)
 * Mengambil statistik demografi dasar & agregasi semua variabel riset.
 */
export async function getNationalStats() {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        disability_type, career_status, role, education_level, 
        education_model, scholarship_type, education_barrier,
        used_assistive_tools, preferred_accommodations,
        has_laptop, has_smartphone, internet_quality
      `)
      .eq("role", "talent")

    if (error) throw error

    // 1. Fungsi Helper untuk menghitung distribusi (Single Value)
    const countDist = (arr: any[], key: string) => {
      return arr.reduce((acc: any, curr) => {
        const val = curr[key] || "Tidak Terisi"
        acc[val] = (acc[val] || 0) + 1
        return acc
      }, {})
    }

    // 2. Fungsi Helper untuk menghitung distribusi (Array/List Value seperti Alat Bantu)
    const countArrayDist = (arr: any[], key: string) => {
      const dist: any = {}
      arr.forEach(item => {
        const values = item[key] || []
        if (Array.isArray(values)) {
          values.forEach((v: string) => {
            dist[v] = (dist[v] || 0) + 1
          })
        } else if (values) { // Fallback jika data bukan array tapi string
          dist[values] = (dist[values] || 0) + 1
        }
      })
      return dist
    }

    return {
      totalTalents: profiles.length,
      // Agregasi Karakteristik Utama
      disabilityDist: countDist(profiles, "disability_type"),
      careerDist: countDist(profiles, "career_status"),
      // Agregasi Riset Pendidikan (BRIN Variable)
      eduModelDist: countDist(profiles, "education_model"),
      scholarshipDist: countDist(profiles, "scholarship_type"),
      barrierDist: countDist(profiles, "education_barrier"),
      // Agregasi Variabel Aksesibilitas (Multi-selection)
      toolsDist: countArrayDist(profiles, "used_assistive_tools"),
      accDist: countArrayDist(profiles, "preferred_accommodations"),
      // Agregasi Infrastruktur Digital
      digitalAssets: {
        laptop: profiles.filter(p => p.has_laptop).length,
        smartphone: profiles.filter(p => p.has_smartphone).length,
        internet: countDist(profiles, "internet_quality")
      },
      employmentRate: {
        employed: profiles.filter(t => 
          t.career_status === "Pegawai Swasta" || 
          t.career_status === "Pegawai BUMN" || 
          t.career_status === "ASN (PNS / PPPK)" ||
          t.career_status === "Wiraswasta / Entrepreneur"
        ).length,
        seeking: profiles.filter(t => t.career_status === "Job Seeker" || t.career_status === "Belum Bekerja").length
      }
    }
  } catch (error) {
    console.error("Error fetching national stats:", error)
    return null
  }
}

/**
 * ANALISA TRANSISI & DATA LONGITUDINAL
 * Mengambil narasi riset dan tren pergerakan karir dari waktu ke waktu.
 */
export async function getTransitionInsights() {
  try {
    // Ambil data view analisis transisi
    const { data: transitionData, error: tError } = await supabase
      .from("research_transition_analysis")
      .select("*")

    if (tError) throw tError

    // Ambil data riwayat karir (Data Longitudinal)
    const { data: historyData, error: hError } = await supabase
      .from("career_status_history")
      .select("*")
      .order("changed_at", { ascending: false })

    if (hError) throw hError

    // Analisis Sederhana untuk Narasi
    const inklusiWork = transitionData.filter(d => d.education_model === "Sekolah Reguler / inklusi" && d.career_status !== "Job Seeker").length
    const slbWork = transitionData.filter(d => d.education_model === "Sekolah Luar Biasa (SLB)" && d.career_status !== "Job Seeker").length

    return {
      raw: transitionData,
      historyTrend: historyData,
      narrative: `Dataset riset mencatat ${inklusiWork} lulusan model Inklusi dan ${slbWork} lulusan SLB berhasil terserap kerja. Terdapat ${historyData.length} catatan pergerakan karir longitudinal yang terekam dalam sistem.`
    }
  } catch (error) {
    console.error("Error transition insights:", error)
    return { raw: [], historyTrend: [], narrative: "Gagal memproses data longitudinal." }
  }
}

/**
 * AUDIT DATA MANUAL
 * Menarik data dari tabel manual_input_logs yang belum ditinjau (is_reviewed = false).
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
 * MANAJEMEN AKUN ADMIN
 * Aksi global untuk menambah, mengedit, atau menghapus user.
 */
export async function manageAdminUser(action: "EDIT" | "DELETE", table: "profiles" | "companies", payload: any) {
  try {
    if (action === "DELETE") {
      const { error } = await supabase.from(table).delete().eq("id", payload.id)
      if (error) throw error
    } else if (action === "EDIT") {
      const { error } = await supabase.from(table).update(payload).eq("id", payload.id)
      if (error) throw error
    }
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * OTORITAS LOCK (GOV & PARTNER)
 * Menentukan akses dashboard khusus untuk instansi pemerintah atau mitra kampus.
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
