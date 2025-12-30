"use server"

import { supabase } from "@/lib/supabase"

/**
 * Mengambil statistik demografi dasar untuk Tab Snapshot.
 * Diperbarui agar membaca variabel status kerja yang lebih akurat.
 */
export async function getNationalStats() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('disability_type, career_status, role, is_verified')

    if (error) throw error

    const talents = profiles.filter(p => p.role === 'talent')
    
    // Menghitung distribusi ragam disabilitas secara riil
    const disabilityDist = talents.reduce((acc: any, curr) => {
      const type = curr.disability_type || "Tidak Teridentifikasi"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return {
      totalTalents: talents.length,
      // Sekarang menghitung total company langsung dari role
      totalCompanies: profiles.filter(p => p.role === 'company').length,
      disabilityDistribution: disabilityDist,
      employmentRate: {
        // Sinkronisasi dengan value Career Status di data-static.ts
        employed: talents.filter(t => 
          t.career_status === 'Karyawan Swasta' || 
          t.career_status === 'ASN / PNS' || 
          t.career_status === 'Wirausaha'
        ).length,
        seeking: talents.filter(t => t.career_status === 'Mencari Kerja').length
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
 * Diperbarui untuk mendukung variabel beasiswa dan alat bantu terbaru.
 */
export async function getTransitionInsights() {
  try {
    const { data, error } = await supabase
      .from('research_transition_analysis')
      .select('*')

    if (error) throw error

    // Analisis Korelasi Riset BRIN: Hubungan Pendidikan dan Karir
    const inklusiWork = data.filter(d => d.education_model === 'Inklusi' && d.career_status !== 'Mencari Kerja').length
    const slbWork = data.filter(d => d.education_model === 'SLB' && d.career_status !== 'Mencari Kerja').length

    // Menghitung ketersediaan alat bantu (variabel baru: used_assistive_tools)
    const assistiveUser = data.filter(d => d.used_assistive_tools && d.used_assistive_tools.length > 0).length

    return {
      raw: data,
      narrative: `Dari total dataset riset, lulusan model Inklusi yang sudah terserap kerja berjumlah ${inklusiWork} orang, sementara lulusan SLB berjumlah ${slbWork} orang. Sebanyak ${assistiveUser} talenta tercatat aktif menggunakan alat bantu adaptif.`
    }
  } catch (error) {
    console.error("Error fetching transition insights:", error)
    return { raw: [], narrative: "Gagal memproses narasi riset." }
  }
}

/**
 * Mengambil log input manual.
 * Penting untuk fitur "Audit Manual" sesuai instruksi Mas Dimas.
 */
export async function getManualInputAudit() {
  try {
    const { data, error } = await supabase
      .from('manual_input_logs')
      .select('*')
      .order('occurrence_count', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return []
  }
}

/**
 * Mengambil data longitudinal tren karir.
 */
export async function getLongitudinalTrends() {
  try {
    const { data, error } = await supabase
      .from('career_status_history')
      .select(`
        *,
        profiles (
          full_name,
          disability_type
        )
      `)
      .order('changed_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error fetching career history:", error)
    return []
  }
}
