import { supabase } from "@/lib/supabase"

/**
 * Memperbarui atau mendaftarkan profil master perusahaan
 * Sinkron dengan kolom tabel 'companies' terbaru untuk data riset
 */
export async function updateCompanyMaster(userId: string, companyData: any) {
  try {
    const { data, error } = await supabase
      .from("companies")
      .upsert({
        owner_id: userId,
        name: companyData.name,
        website: companyData.website,
        industry: companyData.industry,
        category: companyData.category,
        size: companyData.size,
        nib_number: companyData.nib_number,
        description: companyData.description,
        location: companyData.location,
        // Pastikan konversi ke Number agar tidak ditolak kolom integer database
        total_employees: Number(companyData.total_employees) || 0,
        total_employees_with_disability: Number(companyData.total_employees_with_disability) || 0,
        master_accommodations_provided: companyData.master_accommodations_provided,
        // Gunakan format ISO String untuk keamanan PostgreSQL
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'owner_id'
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase Error:", error.message);
      throw error;
    }
    
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
    const { count: jobCount, error: jobError } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId)

    if (jobError) throw jobError

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
