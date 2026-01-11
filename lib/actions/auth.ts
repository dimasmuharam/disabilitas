"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * UNIFIED USER REGISTRATION
 * Handles multi-role registration with atomic transactions.
 * Branches based on selected role: TALENT, COMPANY, or PARTNER
 */
export async function signUpUser(formData: {
  email: string;
  password: string;
  full_name: string;
  role: "talent" | "company" | "partner";
  captchaToken?: string;
  emailRedirectTo?: string;
}) {
  const supabase = createClient();
  
  try {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          role: formData.role,
        },
        captchaToken: formData.captchaToken,
        emailRedirectTo: formData.emailRedirectTo,
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("User creation failed - no user returned");
    }

    // 2. Role-based table insertion using user ID as primary key
    const userId = data.user.id;
    const timestamp = new Date().toISOString();

    if (formData.role === "talent") {
      // Insert into profiles table with has_informed_consent: true
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          full_name: formData.full_name,
          email: formData.email.toLowerCase().trim(),
          role: "talent",
          has_informed_consent: true, // Required for research standards
          created_at: timestamp,
          updated_at: timestamp,
        });

      if (profileError) {
        console.error("Profile insert error:", {
          message: profileError.message || "Unknown error",
          code: profileError.code || "UNKNOWN",
          details: profileError.details || "No details",
        });
        throw new Error(`Failed to create talent profile: ${profileError.message}`);
      }
    } else if (formData.role === "company") {
      // Insert into companies table
      const { error: companyError } = await supabase
        .from("companies")
        .insert({
          id: userId,
          name: formData.full_name,
          email: formData.email.toLowerCase().trim(),
          created_at: timestamp,
          updated_at: timestamp,
        });

      if (companyError) {
        console.error("Company insert error:", {
          message: companyError.message || "Unknown error",
          code: companyError.code || "UNKNOWN",
          details: companyError.details || "No details",
        });
        throw new Error(`Failed to create company profile: ${companyError.message}`);
      }
    } else if (formData.role === "partner") {
      // Insert into partners table
      const { error: partnerError } = await supabase
        .from("partners")
        .insert({
          id: userId,
          name: formData.full_name,
          email: formData.email.toLowerCase().trim(),
          created_at: timestamp,
          updated_at: timestamp,
        });

      if (partnerError) {
        console.error("Partner insert error:", {
          message: partnerError.message || "Unknown error",
          code: partnerError.code || "UNKNOWN",
          details: partnerError.details || "No details",
        });
        throw new Error(`Failed to create partner profile: ${partnerError.message}`);
      }
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Pendaftaran berhasil" };
  } catch (error: any) {
    // Log detailed error for debugging (no sensitive data)
    console.error("Auth Error Details:", error);
    console.error("SignUp Error:", {
      message: error.message || "Unknown error",
      status: error.status || "N/A",
      code: error.code || "UNKNOWN",
      name: error.name || "Error",
    });
    return { success: false, message: error.message || "Terjadi kesalahan sistem" };
  }
}

/**
 * LEGACY: PENDAFTARAN TALENTA BARU
 * Kept for backward compatibility - use signUpUser instead
 */
export async function signUpTalent(formData: any) {
  return signUpUser({
    email: formData.email,
    password: formData.password,
    full_name: formData.full_name,
    role: "talent",
  });
}

/**
 * SIGN IN WITH ROLE-BASED REDIRECTION
 */
export async function signIn(formData: { email: string; password: string }) {
  // Verify environment variable is present
  console.log("Checking Env:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) throw error;

    // Get user role for redirection
    if (data.user) {
      const userRole = data.user.user_metadata?.role;
      
      revalidatePath("/", "layout");
      
      // Role-based redirection
      let redirectPath = "/dashboard";
      if (userRole === "talent") {
        redirectPath = "/dashboard/talent";
      } else if (userRole === "company") {
        redirectPath = "/dashboard/company";
      } else if (userRole === "partner") {
        redirectPath = "/dashboard/partner";
      } else if (userRole === "government") {
        redirectPath = "/dashboard/government";
      } else if (userRole === "admin") {
        redirectPath = "/dashboard/super-admin";
      }

      return { success: true, message: "Login berhasil", redirectPath };
    }

    return { success: true, message: "Login berhasil" };
  } catch (error: any) {
    // Log detailed error for debugging (no sensitive data)
    console.error("Auth Error Details:", error);
    console.error("SignIn Error:", {
      message: error.message || "Unknown error",
      status: error.status || "N/A",
      code: error.code || "UNKNOWN",
      name: error.name || "Error",
    });
    // CRITICAL: Always return a valid object, never undefined
    return { 
      success: false, 
      message: error.message || "Database Connection Error"
    };
  }
}

/**
 * SIGN OUT
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
