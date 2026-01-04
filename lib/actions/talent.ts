import { supabase } from "@/lib/supabase";

/**
 * UPDATE PROFIL UTAMA (Tabel: profiles)
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
 */
export async function upsertWorkExperience(experience: any) {
  try {
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
 * SINKRONISASI SERTIFIKAT OTOMATIS DARI PELATIHAN
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
          organizer_name
        )
      `)
      .eq("profile_id", userId)
      .eq("status", "completed") as any);

    if (error) throw error;

    const officialCerts = traineeData?.map((item: any) => ({
      name: item.trainings?.title || "Sertifikat Pelatihan",
      issuer: item.trainings?.organizer_name || "Official Partner",
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
 * CEK STATUS PENEMPATAN KERJA (Status: accepted)
 * Sinkron dengan label 'accepted' di DB
 */
export async function checkVerifiedPlacement(userId: string) {
  try {
    const { data, error } = await (supabase
      .from("applications")
      .select(`
        status,
        jobs (title, company_id, companies (name))
      `)
      .eq("profile_id", userId)
      .eq("status", "accepted") as any); // Diubah dari 'hired' ke 'accepted'

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
