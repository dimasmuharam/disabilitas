"use client"

import * as React from "react"
import { INCLUSIVE_JOB_TEMPLATE } from "@/app/lowongan/create/template"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button" // Pastikan Mas punya komponen Button atau ganti dengan <button>
import { CheckCircle2, AlertCircle } from "lucide-react"

export function JobForm() {
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")

  // Gabungkan template menjadi string untuk isi awal textarea deskripsi
  const initialDescription = INCLUSIVE_JOB_TEMPLATE.sections
    .map(s => `${s.heading.toUpperCase()}\n${s.content}\n`)
    .join("\n")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    
    const formData = new FormData(event.currentTarget)
    const title = formData.get("title")
    const description = formData.get("description")
    const company_id = (await supabase.auth.getUser()).data.user?.id

    const { error } = await supabase
      .from("jobs")
      .insert([{ 
        title, 
        description, 
        company_id,
        is_active: true,
        created_at: new Date()
      }])

    setLoading(false)
    if (error) {
      setMessage("Gagal memposting: " + error.message)
    } else {
      setMessage("Lowongan Inklusif Berhasil Dipublikasikan!")
      event.currentTarget.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="grid gap-2">
        <label htmlFor="title" className="font-bold text-sm">Nama Posisi</label>
        <input 
          id="title"
          name="title"
          required
          placeholder={INCLUSIVE_JOB_TEMPLATE.title}
          className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:bg-slate-950 dark:border-slate-800"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="description" className="font-bold text-sm">Deskripsi & Akomodasi Inklusif</label>
        <textarea 
          id="description"
          name="description"
          required
          rows={15}
          defaultValue={initialDescription}
          className="flex w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:bg-slate-950 dark:border-slate-800 font-mono"
        />
        <p className="text-xs text-slate-500 italic">Format di atas adalah standar inklusi minimal. Silakan sesuaikan isinya.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${message.includes("Gagal") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
          {message.includes("Gagal") ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {message}
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-11 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Memproses..." : "Publikasikan Lowongan"}
      </button>
    </form>
  )
}
