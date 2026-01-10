"use server"

// Menggunakan createClient untuk Server-Side (Next.js 14 Standard)
import { createClient } from "@/lib/supabase/server"; 
import { revalidatePath } from "next/cache";

/**
 * UPDATE PROFIL UTAMA (Tabel: public.profiles)
 */
export async function updateTalentProfile(userId: string, updates: any) {
  const supabase = createClient();
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

    // Refresh data di halaman dashboard agar perubahan langsung terlihat
    revalidatePath("/dashboard");
    
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
  const supabase = createClient();
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
    
    revalidatePath("/dashboard");
    return { success: true, data };
  } catch (error: any) {
    console.error("Work Experience Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * SINKRONISASI SERTIFIKAT OTOMATIS DARI MODUL PELATIHAN
 * Menarik data dari tabel 'trainees' yang statusnya sudah 'completed'.
 */
export async function syncOfficialCertifications(userId: string) {
  const supabase = createClient();
  try {
    // Sinkronisasi: trainees -> trainings (mengambil detail penyelenggara)
    const { data: traineeData, error } = await supabase
      .from("trainees")
      .select(`
        status,
        trainings (
          title, 
          category,
          updated_at
        )
      `)
      .eq("profile_id", userId)
      .eq("status", "completed");

    if (error) throw error;

    // Transformasi data untuk visualisasi profil
    const officialCerts = traineeData?.map((item: any) => ({
      name: item.trainings?.title || "Sertifikat Pelatihan",
      organizer_name: "Official Partner", // Bisa dikembangkan untuk join ke tabel partners
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
 * Applications accepted -> Memperbarui status karir secara otomatis
 */
export async function checkVerifiedPlacement(userId: string) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        status,
        company_id,
        jobs (title)
      `)
      .eq("applicant_id", userId)
      .eq("status", "accepted"); // Sesuai skema Mas: accepted

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Placement Check Error:", error.message);
    return { success: false, error: error.message };
  }
}
