"use server"

import { supabase } from "@/lib/supabase";

/**
 * UPDATE PROFIL UTAMA (Tabel: public.profiles)
 * Digunakan untuk memperbarui data dasar talenta termasuk data riset akademik.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    // Validasi data: Pastikan tidak ada kolom 'temp' atau manual yang masuk ke DB
    // agar tidak merusak proses query Supabase
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

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Profile Update Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * MANAJEMEN RIWAYAT KERJA (Tabel: public.work_experiences)
 */
export async function upsertWorkExperience(experience: any) {
  try {
    const { data, error } = await supabase
      .from("work_experiences")
      .upsert({
        ...experience,
        is_verified: experience.is_verified || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
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
 * SINKRONISASI SERTIFIKAT OTOMATIS
 * Menarik data dari tabel 'trainees' JOIN 'partners' & 'trainings'
 */
export async function syncOfficialCertifications(userId: string) {
  try {
    const { data: traineeData, error } = await supabase
      .from("trainees")
      .select(`
        status,
        trainings (
          id,
          title, 
          updated_at
        ),
        partners (
          name
        )
      `)
      .eq("profile_id", userId)
      .eq("status", "completed");

    if (error) throw error;

    const officialCerts = traineeData?.map((item: any) => ({
      training_id: item.trainings?.id,
      name: item.trainings?.title || "Sertifikat Pelatihan",
      organizer_name: item.partners?.name || "Official Partner",
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
 * CEK STATUS PENEMPATAN KERJA
 */
export async function checkVerifiedPlacement(userId: string) {
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        status,
        company_id,
        jobs (title),
        companies (name)
      `)
      .eq("applicant_id", userId)
      .eq("status", "hired"); // Sesuai skema Mas: hired adalah goal akhir

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Placement Check Error:", error.message);
    return { success: false, error: error.message };
  }
}