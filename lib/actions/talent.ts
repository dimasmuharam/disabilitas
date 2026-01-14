"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * UPDATE PROFIL UTAMA (Tabel: public.profiles)
 * Fungsi ini menangani pembaruan data dasar, akademik, dan skill.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    // 1. Validasi ID
    if (!userId) throw new Error("User ID tidak ditemukan.");

    // 2. Kerapihan Data: Buang field internal yang bukan kolom di tabel 'profiles'
    // Masalah 'undefined' sering terjadi karena kita mengirim kolom yang tidak ada di SQL.
    const { 
      manual_university, 
      manual_major, 
      temp_skill, 
      ...cleanUpdates 
    } = updates;

    // 3. Normalisasi Data sesuai Skema SQL Mas
    const finalPayload = {
      ...cleanUpdates,
      // Pastikan kolom INTEGER tetap number atau null
      graduation_date: cleanUpdates.graduation_date ? parseInt(cleanUpdates.graduation_date.toString()) : null,
      expected_salary: cleanUpdates.expected_salary ? BigInt(cleanUpdates.expected_salary.toString()).toString() : null,
      
      // Pastikan kolom ARRAY tidak bernilai undefined (Postgres butuh array kosong atau null)
      education_barrier: Array.isArray(cleanUpdates.education_barrier) ? cleanUpdates.education_barrier : [],
      academic_support_received: Array.isArray(cleanUpdates.academic_support_received) ? cleanUpdates.academic_support_received : [],
      academic_assistive_tools: Array.isArray(cleanUpdates.academic_assistive_tools) ? cleanUpdates.academic_assistive_tools : [],
      used_assistive_tools: Array.isArray(cleanUpdates.used_assistive_tools) ? cleanUpdates.used_assistive_tools : [],
      preferred_accommodations: Array.isArray(cleanUpdates.preferred_accommodations) ? cleanUpdates.preferred_accommodations : [],
      skills: Array.isArray(cleanUpdates.skills) ? cleanUpdates.skills : [],
      
      updated_at: new Date().toISOString(),
    };

    // 4. Eksekusi ke Database
    const { data, error } = await supabase
      .from("profiles")
      .update(finalPayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Database Error Detail:", error.message);
      return { success: false, error: error.message };
    }

    // Refresh cache agar data terbaru langsung muncul di dashboard
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, data };
  } catch (error: any) {
    console.error("Critical Server Action Error:", error.message);
    return { success: false, error: error.message || "Gagal menghubungi server." };
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
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select();

    if (error) throw error;
    revalidatePath("/dashboard/career");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * SINKRONISASI SERTIFIKAT (Trainees -> Certifications)
 */
export async function syncOfficialCertifications(userId: string) {
  try {
    const { data: traineeData, error } = await supabase
      .from("trainees")
      .select(`
        status,
        trainings (id, title, updated_at),
        partners (name)
      `)
      .eq("profile_id", userId)
      .eq("status", "completed");

    if (error) throw error;

    const officialCerts = traineeData?.map((item: any) => ({
      profile_id: userId,
      training_id: item.trainings?.id,
      name: item.trainings?.title || "Sertifikat Pelatihan",
      organizer_name: item.partners?.name || "Official Partner",
      year: item.trainings?.updated_at 
        ? new Date(item.trainings.updated_at).getFullYear().toString() 
        : new Date().getFullYear().toString(),
      is_verified: true,
      verified_at: new Date().toISOString()
    })) || [];

    if (officialCerts.length > 0) {
      await supabase.from("certifications").upsert(officialCerts, { onConflict: 'profile_id, training_id' });
    }

    return { success: true, data: officialCerts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}