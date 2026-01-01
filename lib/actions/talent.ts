import { supabase } from "@/lib/supabase";

/**
 * UPDATE PROFIL UTAMA (Tabel: profiles)
 * Digunakan oleh Modul 1, 2, 3, 4, dan 5
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
 * MANAJEMEN RIWAYAT KERJA (Tabel: work_experiences)
 * Digunakan oleh Modul 3
 */
export async function upsertWorkExperience(experience: any) {
  try {
    // Memastikan is_verified default ke false jika input manual
    const { data, error } = await supabase
      .from("work_experiences")
      .upsert({
        ...experience,
        is_verified: experience.is_verified || false,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Work Experience Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * PENDAFTARAN PELATIHAN (Tabel: trainees)
 * Digunakan oleh Talent Dashboard (Training Match)
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
    console.error("Training Application Error:", error.message);
    return { success: false, error: error.message };
  }
}
/**
 * FUNGSI SMART: SINKRONISASI SERTIFIKAT OTOMATIS
 */
export async function syncOfficialCertifications(userId: string) {
  try {
    const { data: traineeData, error } = await (supabase
      .from("trainees")
      .select(`
        status,
        trainings (
          title, 
          updated_at, 
          profiles (full_name)
        )
      `)
      .eq("profile_id", userId)
      .eq("status", "completed") as any);

    if (error) throw error;

    const officialCerts = traineeData?.map((item: any) => ({
      name: item.trainings?.title || "Sertifikat Pelatihan",
      issuer: item.trainings?.profiles?.full_name || "Official Partner",
      year: item.trainings?.updated_at 
        ? new Date(item.trainings.updated_at).getFullYear().toString() 
        : new Date().getFullYear().toString(),
      is_verified: true
    })) || [];

    return { success: true, data: officialCerts };
  } catch (error: any) {
    console.error("Sync Certs Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * FUNGSI SMART: CEK STATUS PENEMPATAN KERJA OTOMATIS
 */
export async function checkVerifiedPlacement(userId: string) {
  try {
    const { data, error } = await (supabase
      .from("applications")
      .select(`
        status,
        jobs (title, company_id, profiles (full_name))
      `)
      .eq("profile_id", userId)
      .eq("status", "hired") as any);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
