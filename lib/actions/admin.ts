import { supabase } from "@/lib/supabase"

/**
 * Mengambil statistik demografi dasar untuk Tab Snapshot.
 * Mencakup proporsi ragam disabilitas dan status kerja.
 */
export async function getNationalStats() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('disability_type, career_status, role')

    if (error) throw error

    const talents = profiles.filter(p => p.role === 'talent')
    
    // Menghitung distribusi ragam disabilitas
    const disabilityDist = talents.reduce((acc: any, curr) => {
      const type = curr.disability_type || "Tidak Teridentifikasi"
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    return {
      totalTalents: talents.length,
      totalCompanies: profiles.filter(p => p.role === 'company').length,
      disabilityDistribution: disabilityDist,
      employmentRate: {
        employed: talents.filter(t => t.career_status?.includes('Employed')).length,
        seeking: talents.filter(t => t.career_status === 'Job Seeker').length
      }
    }
  } catch (error) {
    console.error("Error fetching national stats:", error)
    return null
  }
}

/**
 * Menarik data dari View research_transition_analysis untuk analisis korelasi.
 * Fokus pada transisi pendidikan ke dunia kerja.
 */
export async function getTransitionInsights() {
  try {
    const { data, error } = await supabase
      .from('research_transition_analysis')
      .select('*')

    if (error) throw error

    // Logika korelasi sederhana untuk narasi screen reader
    const inklusiWork = data.filter(d => d.education_model === 'Inklusi' && d.career_status?.includes('Employed')).length
    const slbWork = data.filter(d => d.education_model === 'SLB' && d.career_status?.includes('Employed')).length

    return {
      raw: data,
      narrative: `Dari total dataset, lulusan model Inklusi yang sudah bekerja berjumlah ${inklusiWork} orang, sementara lulusan SLB berjumlah ${slbWork} orang.`
    }
  } catch (error) {
    console.error("Error fetching transition insights:", error)
    return null
  }
}

/**
 * Mengambil log input manual untuk kebutuhan audit data.
 * Membantu admin melihat tren universitas atau kota yang belum terdaftar di data-static.ts.
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
 * Mengambil data longitudinal sejarah status karir.
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
