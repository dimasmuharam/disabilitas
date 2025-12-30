import { supabase } from "@/lib/supabase"

/**
 * Memperbarui atau mendaftarkan profil master perusahaan
 * Fokus pada sinkronisasi variabel riset (akomodasi & visi)
 */
export async function updateCompanyMaster(userId: string, companyData: any) {
  try {
    const { data, error } = await supabase
      .from('companies')
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
 * Mengambil data statistik perusahaan untuk dashboard
 */
export async function getCompanyStats(companyId: string) {
  const { count: jobCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)

  const { count: appCount } = await supabase
    .from('applications')
    .select('*, jobs!inner(*)', { count: 'exact', head: true })
    .eq('jobs.company_id', companyId)

  return { jobCount: jobCount || 0, applicantCount: appCount || 0 }
}
