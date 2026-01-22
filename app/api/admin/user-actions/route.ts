export const runtime = 'edge';

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Runtime check for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Only initialize if we have the required credentials
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabaseAdmin = createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: Request) {
  // Check if Supabase is properly configured
  if (!supabaseAdmin) {
    console.error("Supabase admin client not initialized. Missing environment variables.");
    return NextResponse.json(
      { error: "Server configuration error. Please contact administrator." },
      { status: 500 }
    );
  }

  try {
    const { action, userId, email } = await request.json()

    switch (action) {
      case "FORCE_CONFIRM":
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        )
        if (confirmError) return NextResponse.json({ error: confirmError.message }, { status: 400 });
        return NextResponse.json({ message: "User berhasil dikonfirmasi secara paksa" })

      case "SUSPEND":
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: "87600h" } 
        )
        if (banError) return NextResponse.json({ error: banError.message }, { status: 400 });
        return NextResponse.json({ message: "User berhasil disuspend" })

      case "DELETE_USER":
        // Karena Mas sudah set ON DELETE CASCADE di SQL, 
        // cukup jalankan satu perintah ini.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (deleteError) {
          return NextResponse.json(
            { error: deleteError.message }, 
            { status: 400 }
          )
        }
        return NextResponse.json({ message: "User telah dihapus permanen dari sistem" })

      case "RESET_PASSWORD":
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email
        })
        if (resetError) return NextResponse.json({ error: resetError.message }, { status: 400 });
        return NextResponse.json({ message: "Link reset password telah dikirim" })

      default:
        return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Admin API Error Critical:", error)
    return NextResponse.json(
      { error: "Kesalahan sistem: " + (error.message || "Unknown Error") }, 
      { status: 500 }
    )
  }
}