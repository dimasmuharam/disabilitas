"use server"

import { supabase } from "@/lib/supabase"

/**
 * Memperbarui status lamaran kerja (Pending, Interview, Accepted, Rejected)
 * Digunakan oleh HRD di Dashboard Perusahaan/BUMN
 */
export async function updateApplicationStatus(applicationId: string, status: string) {
    try {
        const { data, error } = await supabase
            .from("applications")
            .update({ 
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq("id", applicationId)
            .select()

        if (error) throw error
        
        return { data, error: null }
    } catch (error: any) {
        console.error("Error updating application status:", error.message)
        return { data: null, error: error.message }
    }
}

/**
 * Mengambil detail profil talenta untuk diproses rekrutmen
 * Update [2025-12-31]: Sinkronisasi nama tabel work_experiences sesuai DB
 */
export async function getTalentDetailsForCompany(talentId: string) {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("*, work_experiences(*), certifications(*)")
            .eq("id", talentId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error: any) {
        console.error("Error fetching talent details:", error.message)
        return { data: null, error: error.message }
    }
}

/**
 * FUNGSI GOVERNMENT: Tracking Karir ASN Internal
 * Mengambil data talenta yang berstatus ASN di instansi tertentu
 */
export async function getInternalAsnTracking(agencyName: string) {
    try {
        // Mencari talenta yang saat ini bekerja di instansi yang login
        // Berdasarkan kolom is_current_work di tabel work_experiences
        const { data, error } = await supabase
            .from("profiles")
            .select("*, work_experiences!inner(*)")
            .eq("work_experiences.company_name", agencyName)
            .eq("work_experiences.is_current_work", true)
            .eq("career_status", "ASN (PNS / PPPK)")

        if (error) throw error
        return { data, error: null }
    } catch (error: any) {
        console.error("Error tracking internal ASN:", error.message)
        return { data: null, error: error.message }
    }
}
