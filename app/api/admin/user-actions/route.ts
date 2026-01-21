import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Inisialisasi Admin Supabase dengan Service Role Key
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

    // PROTEKSI: Cek apakah yang memanggil ini adalah admin (opsional jika sudah lewat middleware)
    
    switch (action) {
      case "FORCE_CONFIRM":
        // Mengonfirmasi email tanpa user perlu klik link
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { email_confirm: true }
        )
        if (confirmError) throw confirmError
        return NextResponse.json({ message: "User berhasil dikonfirmasi secara paksa" })

      case "SUSPEND":
        // Menonaktifkan user (ban)
        const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { ban_duration: "87600h" } // Ban selama 10 tahun
        )
        if (banError) throw banError
        return NextResponse.json({ message: "User berhasil disuspend" })

      case "DELETE_USER":
        // Menghapus user permanen dari Auth & semua tabel terkait (Cascade)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError
        return NextResponse.json({ message: "User telah dihapus permanen" })

      case "RESET_PASSWORD":
        // Kirim email reset password manual
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
    console.error("Admin Action Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}