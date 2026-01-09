"use server"

import { supabase } from "@/lib/supabase";

/**
 * UPDATE PROFIL UTAMA (Tabel: profiles)
 * Digunakan untuk memperbarui data dasar talenta.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
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
 * Menyimpan atau memperbarui pengalaman kerja talenta.
 */
export async function upsertWorkExperience(experience: any) {
  try {
    const { data, error } = await supabase
      .from("work_experiences")
      .upsert({
        ...experience,
        // Sinkronisasi dengan skema boolean is_verified
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
 * SINKRONISASI SERTIFIKAT OTOMATIS DARI MODUL PELATIHAN
 * Menarik data dari tabel 'trainees' yang statusnya sudah 'completed'.
 * Jalur Data: Pelatihan (Trainees) -> Profil (Certifications)
 */
export async function syncOfficialCertifications(userId: string) {
  try {
    // Mencari riwayat pendaftaran pelatihan (bukan lamaran kerja)
    const { data: traineeData, error } = await supabase
      .from("trainees")
      .select(`
        status,
        trainings (
          title, 
          organizer_name,
          updated_at
        )
      `)
      .eq("profile_id", userId) // Benar: trainees menggunakan profile_id
      .eq("status", "completed");

    if (error) throw error;

    // Transformasi data agar cocok dengan struktur tabel certifications
    const officialCerts = traineeData?.map((item: any) => ({
      name: item.trainings?.title || "Sertifikat Pelatihan",
      organizer_name: item.trainings?.organizer_name || "Official Partner",
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
 * CEK STATUS PENEMPATAN KERJA DARI MODUL LOWONGAN
 * Menarik data dari tabel 'applications' yang statusnya sudah 'accepted'.
 * Jalur Data: Lamaran Kerja (Applications) -> Status Pekerjaan
 */
export async function checkVerifiedPlacement(userId: string) {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        status,
        company_id,
        jobs (title)
      `)
      .eq("applicant_id", userId) // Benar: applications menggunakan applicant_id
      .eq("status", "accepted");

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Placement Check Error:", error.message);
    return { success: false, error: error.message };
  }
}
