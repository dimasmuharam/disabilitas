"use server"

import { createAdminClient } from "@/lib/supabase" // GUNAKAN ADMIN CLIENT

/**
 * Memperbarui profil master perusahaan & mengirim antrean verifikasi
 */
export async function updateCompanyMaster(userId: string, companyData: any) {
  try {
    // Gunakan Admin Client untuk bypass RLS
    const admin = createAdminClient();

    // 1. Update data utama di tabel companies
    const { data, error: companyError } = await admin
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
        verification_document_link: companyData.verification_document_link,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()

    if (companyError) throw companyError;

    // 2. OTOMATISASI: Kirim/update request ke verification_requests
    if (companyData.verification_document_link) {
      const { error: requestError } = await admin
        .from("verification_requests")
        .upsert({
          target_id: userId,
          target_type: 'company',
          document_url: companyData.verification_document_link,
          status: 'pending' 
        }, {
          onConflict: 'target_id' 
        })
      
      if (requestError) {
        console.error("Request Queue Error:", requestError.message);
        // Kita tidak throw agar profil tetap tersimpan walau antrean gagal
      }
    }
    
    return { data, error: null }
  } catch (error: any) {
    console.error("Error updating company:", error.message)
    return { data: null, error: error.message }
  }
}

/**
 * Mengambil data statistik perusahaan (Boleh pakai client biasa jika RLS SELECT dibuka)
 */
export async function getCompanyStats(companyId: string) {
  try {
    const admin = createAdminClient();
    const [jobRes, appRes] = await Promise.all([
      admin.from("jobs").select("*", { count: "exact", head: true }).eq("company_id", companyId),
      admin.from("applications").select("*", { count: "exact", head: true }).eq("company_id", companyId)
    ])

    if (jobRes.error) throw jobRes.error
    if (appRes.error) throw appRes.error

    return { 
      jobCount: jobRes.count || 0, 
      applicantCount: appRes.count || 0,
      error: null 
    }
  } catch (error: any) {
    return { jobCount: 0, applicantCount: 0, error: error.message }
  }
}

/**
 * Mengambil profil lengkap perusahaan
 */
export async function getCompanyProfile(companyId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
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