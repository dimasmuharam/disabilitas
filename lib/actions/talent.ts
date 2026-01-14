"use server"

import { supabase } from "@/lib/supabase";

/**
 * Update Talent Profile
 * Mengikuti logika asli yang stabil dan sudah terbukti berhasil di modul Identity.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Action Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Upsert Work Experience
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