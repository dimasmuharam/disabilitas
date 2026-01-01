import { supabase } from "@/lib/supabase";

/**
 * Update profil utama talenta (Tabel: profiles)
 * Digunakan oleh Modul 1, 2, 3, dan 5
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Profile Update Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * CRUD Riwayat Kerja (Tabel: work_experiences)
 * Digunakan oleh Modul 2
 */
export async function upsertWorkExperience(experience: any) {
  try {
    const { data, error } = await supabase
      .from("work_experiences")
      .upsert(experience)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * CRUD Sertifikasi & Agregasi Skill (Tabel: certifications)
 * Digunakan oleh Modul 4
 */
export async function upsertCertification(certification: any) {
  try {
    const { data, error } = await supabase
      .from("certifications")
      .upsert(certification)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Pendaftaran Pelatihan (Tabel: trainees)
 * Digunakan oleh Dashboard Utama (Matching Center)
 */
export async function applyForTraining(trainingId: string, profileId: string) {
  try {
    const { data, error } = await supabase
      .from("trainees")
      .insert({
        training_id: trainingId,
        profile_id: profileId,
        status: "applied"
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
