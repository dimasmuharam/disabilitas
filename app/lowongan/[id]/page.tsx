import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building2, MapPin, Briefcase, DollarSign, CheckCircle, Clock, Globe } from "lucide-react"

// Data Dummy (Simulasi Database)
// Nanti ini kita ganti dengan pengambilan data real dari Supabase
const jobsData: Record<string, any> = {
  "1": {
    title: "Customer Service Specialist (Chat Support)",
    company: "PT Telekomunikasi Digital",
    location: "Jakarta (Hybrid)",
    type: "Full-time",
    salary: "Rp 5.000.000 - 7.000.000",
    posted: "2 hari lalu",
    description: "Kami mencari Customer Service yang sabar dan komunikatif untuk menangani keluhan pelanggan via Chat. Posisi ini sangat ramah untuk teman-teman Tunanetra (menggunakan Screen Reader) atau Tuli (Text-based).",
    requirements: [
      "Pendidikan minimal SMA/SMK",
      "Mampu mengetik cepat dan akurat",
      "Familiar dengan penggunaan komputer & Microsoft Office",
      "Bersedia bekerja shift (Pagi/Siang/Malam)"
    ],
    accessibility: [
      "Screen Reader Friendly Software",
      "Website Internal Aksesibel (WCAG 2.1)",
      "Area kantor dengan Guiding Block",
      "Diperbolehkan WFH 3 hari/minggu"
    ]
  },
  "2": {
    title: "Junior Web Developer",
    company: "Startup Karya Bangsa",
    location: "Remote (WFH Total)",
    type: "Kontrak",
    salary: "Rp 6.000.000 - 9.000.000",
    posted: "5 jam lalu",
    description: "Bergabunglah dengan tim engineering kami. Kami tidak peduli keterbatasan fisik Anda, yang kami pedulikan adalah kualitas kode Anda.",
    requirements: [
      "Menguasai HTML, CSS, JavaScript (React/Next.js)",
      "Paham penggunaan Git",
      "Memiliki portofolio project (meskipun project latihan)",
      "Kemampuan bahasa Inggris pasif (membaca dokumentasi)"
    ],
    accessibility: [
      "100% Remote Work (Bekerja dari rumah)",
      "Komunikasi tim via teks (Slack/Discord) - Ramah Tuli",
      "Jadwal kerja fleksibel (Result Oriented)",
      "Mentoring inklusif"
    ]
  }
}

interface PageProps {
  params: {
    id: string
  }
}

export default function JobDetailPage({ params }: PageProps) {
  // Ambil data berdasarkan ID dari URL
  const job = jobsData[params.id]

  // Jika ID tidak ditemukan di data dummy, lempar ke halaman 404
  if (!job) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="container px-4 md:px-6 max-w-4xl">
        
        {/* Tombol Kembali */}
        <Link 
          href="/lowongan"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Lowongan
        </Link>

        {/* HEADER LOWONGAN */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{job.title}</h1>
              <div className="flex flex-col sm:flex-row gap-3 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-2 font-medium">
                  <Building2 className="h-5 w-5" /> {job.company}
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> {job.location}
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-2">
                   <Clock className="h-5 w-5" /> {job.posted}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {job.salary}
              </div>
              <button className="w-full inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-medium text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                Lamar Sekarang
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* KOLOM UTAMA (KIRI) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Deskripsi */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50">Deskripsi Pekerjaan</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {job.description}
              </p>
            </section>

            {/* Kualifikasi */}
            <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-50">Kualifikasi</h2>
              <ul className="space-y-3">
                {job.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* SIDEBAR (KANAN) - INFO AKSESIBILITAS */}
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900 p-6">
              <h2 className="text-lg font-bold mb-4 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Akomodasi Aksesibilitas
              </h2>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                Perusahaan ini telah berkomitmen menyediakan fasilitas berikut:
              </p>
              <ul className="space-y-3">
                {job.accessibility.map((acc: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{acc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-semibold mb-2">Tentang Perusahaan</h3>
              <p className="text-sm text-slate-500 mb-4">
                {job.company} adalah perusahaan yang telah terverifikasi sebagai Mitra Inklusif Disabilitas.com.
              </p>
              <a href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                <Globe className="h-3 w-3" /> Website Perusahaan
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
