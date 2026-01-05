import { supabase } from "@/lib/supabase"

/**
 * Memperbarui atau mendaftarkan profil master perusahaan
 * Sinkron dengan kolom tabel 'companies' terbaru untuk data riset
 */
export async function updateCompanyMaster(userId: string, companyData: any) {
  try {
    // Audit mapping data agar persis dengan kolom tabel Supabase
    const { data, error } = await supabase
      .from("companies")
      .upsert({
        owner_id: userId,
        name: companyData.name,
        email: companyData.email,            // Baru: Sesuai tabel
        website: companyData.website,        // Baru: Sesuai tabel
        industry: companyData.industry,
        category: companyData.category,      // Baru: Sesuai tabel
        size: companyData.size,              // Perbaikan: dari business_scale ke size
        nib_number: companyData.nib_number,  // Baru: Sesuai tabel
        description: companyData.description,
        location: companyData.location,
        total_employees: companyData.total_employees, // Baru: Sesuai tabel
        total_employees_with_disability: companyData.total_employees_with_disability,
        master_accommodations_provided: companyData.master_accommodations_provided,
        updated_at: new Date()
      }, {
        onConflict: 'owner_id' // Pastikan melakukan update jika owner_id sudah ada
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
