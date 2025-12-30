"use server"

import { supabase } from "@/lib/supabase"

/**
 * Memperbarui status lamaran kerja (Pending, Interview, Accepted, Rejected)
 * Digunakan oleh HRD di Dashboard Perusahaan
 */
export async function updateApplicationStatus(applicationId: string, status: string) {
    try {
        const { data, error } = await supabase
            .from('applications')
            .update({ 
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', applicationId)
            .select()

        if (error) throw error

        // LOGIKA RISET: Jika status 'accepted', kita bisa menelusuri korelasi 
        // antara jenis disabilitas dan kecepatan serapan kerja di industri tertentu.
        
        return { data, error: null }
    } catch (error: any) {
        console.error("Error updating application status:", error.message)
        return { data: null, error: error.message }
    }
}

/**
 * Mengambil detail profil talenta untuk diproses rekrutmen
 */
export async function getTalentDetailsForCompany(talentId: string) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, education(*), experience(*)')
            .eq('id', talentId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error: any) {
        return { data: null, error: error.message }
    }
}
