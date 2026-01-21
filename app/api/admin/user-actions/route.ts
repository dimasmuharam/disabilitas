export const runtime = 'edge';

import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { action, userId, email } = await request.json()

    switch (action) {
      case "FORCE_CONFIRM":
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        )
        if (confirmError) throw confirmError
        return NextResponse.json({ message: "User berhasil dikonfirmasi secara paksa" })

      case "SUSPEND":
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: "87600h" } 
        )
        if (banError) throw banError
        return NextResponse.json({ message: "User berhasil disuspend" })

      case "DELETE_USER":
        /**
         * PENTING: Supabase auth.admin.deleteUser hanya menghapus data di auth.users.
         * Jika ada relasi tabel publik yang tidak diset 'ON DELETE CASCADE', 
         * database akan menolak (Error 23503).
         */
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        
        if (deleteError) {
          // Jika error, kirim pesan string yang jelas, bukan object
          return NextResponse.json(
            { error: deleteError.message || "Gagal menghapus karena relasi data di tabel lain." }, 
            { status: 400 }
          )
        }
        return NextResponse.json({ message: "User telah dihapus permanen dari sistem" })

      case "RESET_PASSWORD":
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email
        })
        if (resetError) throw resetError
        return NextResponse.json({ message: "Link reset password telah dikirim" })

      default:
        return NextResponse.json({ error: "Aksi tidak dikenal" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Admin API Error:", error)
    // Pastikan error yang dikirim selalu string message
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal server" }, 
      { status: 500 }
    )
  }
}