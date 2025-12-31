"use server"

import { supabase } from "@/lib/supabase"

/**
 * Mengambil statistik demografi dasar untuk Tab Snapshot.
 * Diperbarui agar sinkron dengan konstanta CAREER_STATUSES di data-static.ts
 */
export async function getNationalStats() {
  try {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("disability_type, career_status, role, is_verified")

    if (error) throw error

    const talents = profiles.filter(p => p.role === "talent")
    
    // Menghitung distribusi ragam disabilitas secara riil
    const disabilityDist = talents.reduce((acc: any, curr) => {
      const type = curr.disability_type || "Tidak Teridentifikasi"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return {
      totalTalents: talents.length,
      totalCompanies: profiles.filter(p => p.role === "company").length,
      disabilityDistribution: disabilityDist,
      employmentRate: {
        // SINKRONISASI: Menggunakan value dari data-static.ts terbaru
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
    return { 
        totalTalents: 0, 
        totalCompanies: 0, 
        disabilityDistribution: {}, 
        employmentRate: { employed: 0, seeking: 0 } 
    }
  }
}

/**
 * Menarik data dari View research_transition_analysis.
 * Menghasilkan narasi riset otomatis untuk laporan BRIN.
 */
export async function getTransitionInsights() {
  try {
    const { data, error } = await supabase
      .from("research_transition_analysis")
      .select("*")

    if (error) throw error

    // Analisis Korelasi Riset: Hubungan Model Pendidikan dan Kesuksesan Karir
    const inklusiWork = data.filter(d => d.education_model === "Sekolah Reguler / inklusi" && d.career_status !== "Job Seeker").length
    const slbWork = data.filter(d => d.education_model === "Sekolah Luar Biasa (SLB)" && d.career_status !== "Job Seeker").length

    // Menghitung penggunaan teknologi asistif (variabel kemandirian)
    const assistiveUser = data.filter(d => d.used_assistive_tools && d.used_assistive_tools.length > 0).length

    return {
      raw: data,
      narrative: `Dari total dataset riset, lulusan model Inklusi yang sudah terserap kerja berjumlah ${inklusiWork} orang, sementara lulusan SLB berjumlah ${slbWork} orang. Sebanyak ${assistiveUser} talenta tercatat aktif menggunakan teknologi asistif.`
    }
  } catch (error) {
    console.error("Error fetching transition insights:", error)
    return { raw: [], narrative: "Gagal memproses narasi riset." }
  }
}

/**
 * Mengambil log input manual (Fitur Audit Mas Dimas).
 * Jika tabel manual_input_logs belum ada, fungsi ini akan melakukan agregasi mandiri dari tabel profiles.
 */
export async function getManualInputAudit() {
  try {
    // Strategi Cadangan: Jika tabel log belum ada, kita agregasi langsung dari profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("university, partner_institution")

    if (error) throw error

    const counts: any = {}
    profiles.forEach(p => {
      if (p.university) counts[p.university] = (counts[p.university] || 0) + 1
      if (p.partner_institution) counts[p.partner_institution] = (counts[p.partner_institution] || 0) + 1
    })

    return Object.entries(counts)
      .map(([name, count]) => ({ institution_name: name, occurrence_count: count }))
      .sort((a: any, b: any) => b.occurrence_count - a.occurrence_count)

  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }
}

/**
 * FUNGSI BARU: Manajemen Invitation (Role Government & Partner)
 * Membantu Super Admin membuat metadata 'Lock' untuk akun instansi/kampus.
 */
export async function setupAdminLock(profileId: string, lockType: "agency" | "partner", lockValue: string) {
  const updateData = lockType === "agency" 
    ? { admin_agency_lock: lockValue } 
    : { admin_partner_lock: lockValue };

  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", profileId)
    .select()

  return { data, error }
}
