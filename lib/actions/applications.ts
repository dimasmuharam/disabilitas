"use server"

import { supabase } from "@/lib/supabase"

/**
 * Memperbarui status lamaran kerja (applied, accepted, rejected)
 * Digunakan oleh HRD di Dashboard Perusahaan/Instansi
 * Sesuai Skema DB: status menggunakan USER-DEFINED (application_status)
 */
export async function updateApplicationStatus(applicationId: string, status: string) {
    try {
        const { data, error } = await supabase
            .from("applications")
            .update({ 
                status: status, // Pastikan input status sesuai enum di DB (huruf kecil)
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
 * Digunakan oleh HRD saat klik 'Cetak CV' atau 'Lihat Profil'
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
 * Membantu instansi memantau talenta disabilitas yang sudah masuk sistem ASN
 * Berdasarkan Instruksi Super Admin: Kerapihan data karir
 */
export async function getInternalAsnTracking(agencyName: string) {
    try {
        // Logika: Mencari profil yang punya riwayat kerja saat ini di instansi tsb
        const { data, error } = await supabase
            .from("profiles")
            .select("*, work_experiences!inner(*)")
            .eq("work_experiences.company_name", agencyName)
            .eq("work_experiences.is_current_work", true)
            // career_status harus sesuai dengan pilihan di data-static.ts
            .eq("career_status", "ASN (PNS / PPPK)")

        if (error) throw error
        return { data, error: null }
    } catch (error: any) {
        console.error("Error tracking internal ASN:", error.message)
        return { data: null, error: error.message }
    }
}
