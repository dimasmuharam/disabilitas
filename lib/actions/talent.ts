"use server"

import { supabase } from "@/lib/supabase";

/**
 * Update Talent Profile
 * PERBAIKAN: Menghilangkan .single() untuk menghindari error jika ID tidak ditemukan,
 * dan memastikan pesan error dikirim balik ke UI agar dibaca Screen Reader.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    // Validasi input awal
    if (!userId) {
      return { success: false, error: "USER_ID_TIDAK_DITEMUKAN" };
    }

    const { data, error, count } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select(); // Hilangkan .single() agar tidak crash jika row kosong

    if (error) {
      console.error("[SERVER_ACTION] Supabase Error:", error);
      return { success: false, error: `DATABASE_ERROR: ${error.message}` };
    }

    // Cek apakah ada data yang benar-benar terupdate
    if (!data || data.length === 0) {
      console.error("[SERVER_ACTION] No rows updated for ID:", userId);
      return { 
        success: false, 
        error: "DATA_PROFIL_TIDAK_DITEMUKAN_DI_DATABASE" 
      };
    }

    return { success: true, data: data[0] };
  } catch (error: any) {
    console.error("[SERVER_ACTION] Catch Error:", error.message);
    return { success: false, error: `ACTION_SYSTEM_ERROR: ${error.message}` };
  }
}

/**
 * Upsert Work Experience
 */
export async function upsertWorkExperience(experience: any) {
  try {
    if (!experience.talent_id) {
        return { success: false, error: "TALENT_ID_REQUIRED" };
    }

    const { data, error } = await supabase
      .from("work_experiences")
      .upsert({
        ...experience,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      console.error("[SERVER_ACTION] Upsert Error:", error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}