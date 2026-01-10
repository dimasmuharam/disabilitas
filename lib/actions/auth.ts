"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * PENDAFTARAN TALENTA BARU
 * Mengotomatisasi Informed Consent untuk kebutuhan riset.
 */
export async function signUpTalent(formData: any) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          role: "talent",
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      // Inisialisasi Profil (Penting untuk integrasi data riset)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          full_name: formData.full_name,
          email: formData.email,
          role: "talent",
          has_informed_consent: true, // Wajib diisi true sesuai standar riset
          created_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * MASUK (LOGIN)
 */
export async function signIn(formData: any) {
  const supabase = createClient();
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) throw error;

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * KELUAR (LOGOUT)
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
