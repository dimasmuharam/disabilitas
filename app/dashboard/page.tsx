"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation" // Tambah useSearchParams

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams() // Hook untuk baca URL
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  // State untuk Notifikasi Verifikasi
  const [showVerifiedSuccess, setShowVerifiedSuccess] = useState(false)

  // State Data Profil
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [gender, setGender] = useState("male")
  const [disabilityCategory, setDisabilityCategory] = useState("")
  const [lastEducation, setLastEducation] = useState("")
  const [skills, setSkills] = useState("")
  const [workPref, setWorkPref] = useState("hybrid")
  const [isConsent, setIsConsent] = useState(false)

  useEffect(() => {
    // 1. Cek apakah ada tanda 'verified=true' di URL
    if (searchParams.get('verified') === 'true') {
      setShowVerifiedSuccess(true)
      // Opsional: Hilangkan parameter dari URL agar bersih (tanpa refresh)
      router.replace('/dashboard')
    }

    getProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/masuk")
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setFullName(data.full_name || "")
        setCity(data.city || "")
        setGender(data.gender || "male")
        setDisabilityCategory(data.disability_category || "")
        setLastEducation(data.last_education || "")
        setWorkPref(data.work_preference || "hybrid")
        setSkills(data.skills ? data.skills.join(", ") : "")
        setIsConsent(data.is_research_consent || false)
      }
    } catch (error) {
      console.log("Error loading user data", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user logged in")

      const updates = {
        id: user.id,
        full_name: fullName,
        city,
        gender,
        disability_category: disabilityCategory,
        last_education: lastEducation,
        work_preference: workPref,
        skills: skills.split(",").map((s) => s.trim()),
        is_research_consent: isConsent,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      setMsg("Data berhasil disimpan! Terima kasih sudah melengkapi profil.")
      setShowVerifiedSuccess(false) // Hilangkan notifikasi verifikasi jika user sudah simpan data
    } catch (error) {
      setMsg("Gagal menyimpan data. Silakan coba lagi.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Memuat data profil...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-3xl mx-auto">
        
        {/* ALERT KHUSUS JIKA BARU VERIFIKASI */}
        {showVerifiedSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded-r shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Email berhasil diverifikasi!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Selamat datang di Disabilitas.com. Silakan lengkapi data diri Anda di bawah ini untuk mulai melamar kerja.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 shadow rounded-lg border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Profil & Data Riset
          </h1>

          <form onSubmit={updateProfile} className="space-y-6">
            {/* Bagian 1: Identitas */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-4">
              <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">1. Identitas Diri</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} 
                  className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kota Domisili</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} 
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} 
                    className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Disabilitas */}
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-md space-y-4 border border-blue-100 dark:border-blue-900">
              <h2 className="font-semibold text-lg text-blue-800 dark:text-blue-300">2. Ragam Disabilitas</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Data ini digunakan untuk pencocokan alat kerja.</p>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kategori Utama</label>
                <select value={disabilityCategory} onChange={(e) => setDisabilityCategory(e.target.value)}
                  className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Sensorik Netra">Sensorik Netra (Blind/Low Vision)</option>
                  <option value="Sensorik Rungu">Sensorik Rungu (Tuli/HoH)</option>
                  <option value="Fisik">Fisik / Daksa</option>
                  <option value="Intelektual">Intelektual</option>
                  <option value="Mental">Mental / Psikososial</option>
                  <option value="Non-Disabilitas">Non-Disabilitas (Umum)</option>
                </select>
              </div>
            </div>

            {/* Bagian 3: Kompetensi */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md space-y-4">
              <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-200">3. Pendidikan & Skill</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pendidikan Terakhir</label>
                  <select value={lastEducation} onChange={(e) => setLastEducation(e.target.value)}
                    className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                    <option value="">-- Pilih Jenjang --</option>
                    <option value="SD">SD / Sederajat</option>
                    <option value="SMP">SMP / Sederajat</option>
                    <option value="SMA">SMA / SMK / SMALB</option>
                    <option value="D3">Diploma (D1-D4)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Preferensi Kerja</label>
                  <select value={workPref} onChange={(e) => setWorkPref(e.target.value)}
                    className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                    <option value="wfo">WFO (Masuk Kantor)</option>
                    <option value="wfh">WFH (Remote/Di Rumah)</option>
                    <option value="hybrid">Hybrid (Campuran)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Skill / Keahlian</label>
                <textarea 
                  value={skills} 
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Contoh: Microsoft Word, Public Speaking, Python, Pijat Shiatsu (Pisahkan dengan koma)"
                  className="w-full p-2 border rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-24"
                />
              </div>
            </div>

            {/* Bagian 4: Consent */}
            <div className="flex items-start space-x-3 p-4 border border-slate-200 dark:border-slate-700 rounded-md">
              <input 
                id="consent" 
                type="checkbox" 
                checked={isConsent}
                onChange={(e) => setIsConsent(e.target.checked)}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="consent" className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Persetujuan Riset:</strong> Saya mengizinkan data profil saya (tanpa identitas nama) digunakan untuk keperluan statistik Jurnal JAIP dan riset kebijakan BRIN/Pertuni demi kemajuan inklusi di Indonesia.
              </label>
            </div>

            {/* Tombol Simpan */}
            <div className="pt-4">
              {msg && <p className="mb-4 text-center font-medium text-blue-600 dark:text-blue-400">{msg}</p>}
              
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-bold text-lg disabled:opacity-50"
              >
                {saving ? "Menyimpan Data..." : "SIMPAN PROFIL"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
