"use server"

import { supabase } from "@/lib/supabase";

/**
 * Update Talent Profile
 * Tetap menggunakan export agar modul lain (Identity, Skills, dll) tidak error.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    if (!userId) {
      return { success: false, error: "USER_ID_MISSING" };
    }

    // Pastikan payload bersih
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Database Error:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Action Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Upsert Work Experience
 * Modul ini tetap dibiarkan karena sudah jalan.
 */
export async function upsertWorkExperience(experience: any) {
  try {
    const { data, error } = await supabase
      .from("work_experiences")
      .upsert({
        ...experience,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}