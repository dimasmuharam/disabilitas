import { supabase } from "@/lib/supabase"

/**
 * Memperbarui atau mendaftarkan profil master perusahaan
 * Serta otomatis mengirimkan permohonan verifikasi ke Admin jika dokumen disertakan.
 */
export async function updateCompanyMaster(userId: string, companyData: any) {
  try {
    // 1. Update data utama di tabel companies
    const { data, error: companyError } = await supabase
      .from("companies")
      .upsert({
        id: userId,
        name: companyData.name,
        website: companyData.website,
        industry: companyData.industry,
        category: companyData.category,
        size: companyData.size,
        nib_number: companyData.nib_number,
        description: companyData.description,
        location: companyData.location,
        total_employees: Number(companyData.total_employees) || 0,
        total_employees_with_disability: Number(companyData.total_employees_with_disability) || 0,
        master_accommodations_provided: companyData.master_accommodations_provided,
        verification_document_link: companyData.verification_document_link, // Kolom G-Drive
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (companyError) throw companyError;

    // 2. OTOMATISASI: Jika ada link dokumen, kirim/update request ke verification_requests
    // Ini agar Admin mendapatkan notifikasi di "Verification Hub"
    if (companyData.verification_document_link) {
      const { error: requestError } = await supabase
        .from("verification_requests")
        .upsert({
          target_id: userId,
          target_type: 'company',
          document_url: companyData.verification_document_link,
          status: 'pending' // Reset ke pending setiap kali link diupdate
        }, {
          onConflict: 'target_id' 
        })
      
      if (requestError) console.error("Request Queue Error:", requestError.message);
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
    const [jobRes, appRes] = await Promise.all([
      supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId)
    ])

    if (jobRes.error) throw jobRes.error
    if (appRes.error) throw appRes.error

    return { 
      jobCount: jobRes.count || 0, 
      applicantCount: appRes.count || 0,
      error: null 
    }
  } catch (error: any) {
    console.error("Error fetching stats:", error.message)
    return { jobCount: 0, applicantCount: 0, error: error.message }
  }
}

/**
 * Mengambil profil lengkap perusahaan berdasarkan ID
 */
export async function getCompanyProfile(companyId: string) {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}