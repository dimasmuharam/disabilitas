import { supabase } from "@/lib/supabase"

/**
 * Memperbarui atau mendaftarkan profil master perusahaan
 * Digunakan oleh Swasta & BUMN untuk manajemen identitas inklusif
 */
export async function updateCompanyMaster(userId: string, companyData: any) {
  try {
    const { data, error } = await supabase
      .from("companies")
      .upsert({
        owner_id: userId,
        name: companyData.name,
        industry: companyData.industry,
        description: companyData.description,
        vision_statement: companyData.vision,
        location: companyData.location,
        total_employees_with_disability: companyData.totalDisabilityEmp,
        master_accommodations_provided: companyData.masterAcomodations,
        updated_at: new Date()
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error("Error updating company:", error.message)
    return { data: null, error: error.message }
  }
}

/**
 * Mengambil data statistik perusahaan untuk dashboard (Job & Pelamar)
 */
export async function getCompanyStats(companyId: string) {
  try {
    // Hitung jumlah lowongan aktif
    const { count: jobCount, error: jobError } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)

    if (jobError) throw jobError

    // Hitung jumlah pelamar masuk melalui join table jobs
    const { count: appCount, error: appError } = await supabase
      .from("applications")
      .select("*, jobs!inner(*)", { count: "exact", head: true })
      .eq("jobs.company_id", companyId)

    if (appError) throw appError

    return { 
      jobCount: jobCount || 0, 
      applicantCount: appCount || 0,
      error: null 
    }
  } catch (error: any) {
    console.error("Error fetching stats:", error.message)
    return { jobCount: 0, applicantCount: 0, error: error.message }
  }
}

/**
 * FUNGSI ADMIN: Verifikasi Perusahaan (Centang Biru)
 * Digunakan di Super Admin Dashboard untuk memvalidasi kredibilitas perusahaan/BUMN
 */
export async function verifyCompanyStatus(companyId: string, status: boolean) {
  try {
    const { data, error } = await supabase
      .from("companies")
      .update({ is_verified: status })
      .eq("id", companyId)
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
