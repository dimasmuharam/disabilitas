"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * UPDATE PROFIL UTAMA (Tabel: profiles)
 * Menangani data dasar, akademik, dan keahlian.
 * Data dikunci sesuai skema database dan data-static.ts.
 */
export async function updateTalentProfile(userId: string, updates: any) {
  try {
    if (!userId) return { success: false, error: "User ID tidak ditemukan." };

    // 1. NORMALISASI DATA (Sinkronisasi dengan Skema SQL Mas)
    // Memastikan tipe data yang dikirim sesuai dengan tipe kolom di PostgreSQL
    const finalPayload: any = {
      ...updates,
      // graduation_date harus Integer (Skema: integer)
      graduation_date: updates.graduation_date ? parseInt(updates.graduation_date.toString()) : null,
      
      // expected_salary harus ditangani sebagai string untuk menghindari BigInt Serialization Error
      expected_salary: updates.expected_salary ? updates.expected_salary.toString() : null,

      // Memastikan kolom ARRAY tidak undefined agar tidak ditolak PostgreSQL
      education_barrier: Array.isArray(updates.education_barrier) ? updates.education_barrier : [],
      academic_support_received: Array.isArray(updates.academic_support_received) ? updates.academic_support_received : [],
      academic_assistive_tools: Array.isArray(updates.academic_assistive_tools) ? updates.academic_assistive_tools : [],
      skills: Array.isArray(updates.skills) ? updates.skills : [],
      
      updated_at: new Date().toISOString(),
    };

    // 2. EKSEKUSI KE DATABASE
    const { error } = await supabase
      .from("profiles")
      .update(finalPayload)
      .eq("id", userId);

    if (error) {
      console.error("Database Error:", error.message);
      return { success: false, error: error.message };
    }

    // 3. REVALIDASI CACHE
    // Memastikan UI mendapatkan data terbaru tanpa perlu reload manual
    revalidatePath("/profile");
    revalidatePath("/dashboard");

    // 4. RETURN KONSISTEN
    // PENTING: Jangan me-return objek 'data' hasil select karena bisa mengandung BigInt
    // yang menyebabkan Next.js crash (undefined result).
    return { success: true };

  } catch (err: any) {
    console.error("Server Action Crash Detail:", err.message);
    // Jaminan agar 'result' di frontend tidak pernah bernilai undefined
    return { success: false, error: err.message || "Terjadi kegagalan sistem server." };
  }
}

/**
 * MANAJEMEN RIWAYAT KERJA (Tabel: work_experiences)
 */
export async function upsertWorkExperience(experience: any) {
  try {
    const { error } = await supabase
      .from("work_experiences")
      .upsert({
        ...experience,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) throw error;
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * SINKRONISASI SERTIFIKAT (Pelatihan -> Sertifikasi)
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
      await supabase.from("certifications").upsert(officialCerts, { 
        onConflict: 'profile_id, training_id' 
      });
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}