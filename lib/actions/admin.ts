"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * PUSAT DATA NASIONAL (RESEARCH AGGREGATOR)
 * Mengambil statistik demografi dasar & agregasi semua variabel riset.
 */
export async function getNationalStats() {
  const supabase = createClient();
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

    // 2. Fungsi Helper untuk menghitung distribusi (Array/List Value)
    const countArrayDist = (arr: any[], key: string) => {
      const dist: any = {}
      arr.forEach(item => {
        let values = item[key] || []
        
        // Handling jika data tersimpan sebagai string koma (fallback) atau array murni
        if (typeof values === 'string') {
          values = values.split(", ").filter(Boolean);
        }

        if (Array.isArray(values)) {
          values.forEach((v: string) => {
            const trimmed = v.trim();
            dist[trimmed] = (dist[trimmed] || 0) + 1
          })
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
      // education_barrier sekarang dihitung sebagai array dist karena bisa multi-select
      barrierDist: countArrayDist(profiles, "education_barrier"),
      toolsDist: countArrayDist(profiles, "used_assistive_tools"),
      accDist: countArrayDist(profiles, "preferred_accommodations"),
      digitalAssets: {
        laptop: profiles.filter(p => p.has_laptop).length,
        smartphone: profiles.filter(p => p.has_smartphone).length,
        internet: countDist(profiles, "internet_quality")
      },
      employmentRate: {
        employed: profiles.filter(t => 
          t.career_status === "Pegawai Swasta" || 
          t.career_status === "Pegawai BUMN / BUMD" || 
          t.career_status === "ASN (PNS / PPPK)" ||
          t.career_status === "Wiraswasta / Entrepreneur" ||
          t.career_status === "Freelancer / Tenaga Lepas"
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
 */
export async function getTransitionInsights() {
  const supabase = createClient();
  try {
    const { data: transitionData, error: tError } = await supabase
      .from("profiles") // Menggunakan tabel profiles langsung jika view belum siap
      .select("education_model, career_status")

    if (tError) throw tError

    const { data: historyData, error: hError } = await supabase
      .from("career_status_history")
      .select("*")
      .order("changed_at", { ascending: false })

    if (hError) throw hError

    const inklusiWork = transitionData.filter(d => d.education_model === "Sekolah Reguler / inklusi" && !["Job Seeker", "Belum Bekerja"].includes(d.career_status)).length
    const slbWork = transitionData.filter(d => d.education_model === "Sekolah Luar Biasa (SLB)" && !["Job Seeker", "Belum Bekerja"].includes(d.career_status)).length

    return {
      raw: transitionData,
      historyTrend: historyData,
      narrative: `Dataset riset mencatat ${inklusiWork} lulusan model Inklusi dan ${slbWork} lulusan SLB berhasil terserap kerja. Terdapat ${historyData.length} catatan pergerakan karir longitudinal.`
    }
  } catch (error) {
    console.error("Error transition insights:", error)
    return { raw: [], historyTrend: [], narrative: "Gagal memproses data longitudinal." }
  }
}

/**
 * AUDIT DATA MANUAL
 */
export async function getManualInputAudit() {
  const supabase = createClient();
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
 */
export async function manageAdminUser(action: "EDIT" | "DELETE", table: "profiles" | "companies", payload: any) {
  const supabase = createClient();
  try {
    if (action === "DELETE") {
      const { error } = await supabase.from(table).delete().eq("id", payload.id)
      if (error) throw error
    } else if (action === "EDIT") {
      const { error } = await supabase.from(table).update(payload).eq("id", payload.id)
      if (error) throw error
    }
    
    revalidatePath("/dashboard");
    return { success: true, error: null }
  } catch (error: any) {
    console.error("Admin Management Error:", error.message)
    return { success: false, error: error.message }
  }
}

/**
 * OTORITAS LOCK (GOV & PARTNER)
 */
export async function setupAdminLock(profileId: string, lockType: "agency" | "partner", lockValue: string) {
  const supabase = createClient();
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
    
    revalidatePath("/dashboard");
    return { data, error: null }
  } catch (error: any) {
    console.error("Admin Lock Error:", error.message)
    return { data: null, error: error.message }
  }
}
