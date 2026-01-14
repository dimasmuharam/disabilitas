"use server"

import { supabase } from "@/lib/supabase";

/**
 * UPDATE PROFIL UTAMA (Tabel: public.profiles)
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    // Kerapihan Data: Kita hanya mengambil data yang valid sesuai kolom di skema SQL Mas
    // Membuang variabel 'manual' agar tidak menyebabkan error "Column not found"
    const { manual_university, manual_major, ...cleanUpdates } = updates;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Supabase Database Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Action Execution Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * MANAJEMEN RIWAYAT KERJA
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