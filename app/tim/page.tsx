import Link from "next/link"
import { Linkedin, Mail, User } from "lucide-react"

export default function TimPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="container px-4 md:px-6">
        
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl">
            Nakhoda Perubahan
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Kami adalah kumpulan individu yang percaya bahwa keterbatasan fisik bukanlah batasan untuk berkarya.
          </p>
        </div>

        {/* SECTION FOUNDER */}
        <div className="mb-16">
          <div className="flex flex-col items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row">
            <div className="flex h-64 w-full items-center justify-center bg-slate-200 dark:bg-slate-800 md:h-auto md:w-1/3">
              {/* Nanti ganti dengan Foto Asli Mas Dimas */}
              <User className="size-24 text-slate-400" />
            </div>
            <div className="w-full p-8 md:w-2/3 md:p-12">
              <div className="text-sm font-semibold uppercase tracking-wide text-blue-600">Founder & CEO</div>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">Dimas Prasetyo Muharam</h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                Sebagai aktivis tunanetra dan pendiri Forum ASN Inklusif, Dimas mendedikasikan karirnya untuk menjebol tembok penghalang bagi penyandang disabilitas di dunia kerja. Visinya adalah menciptakan ekosistem di mana kompetensi menjadi satu-satunya tolak ukur, bukan kondisi fisik.
              </p>
              <div className="mt-6 flex space-x-4">
                 <Link href="#" className="text-slate-400 hover:text-blue-600"><Linkedin className="size-5" /></Link>
                 <Link href="mailto:ceo@disabilitas.com" className="text-slate-400 hover:text-blue-600"><Mail className="size-5" /></Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION TIM EKSEKUTIF (Dummy - Bisa dihapus/diedit) */}
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { name: "Rina Kusuma", role: "Chief Operating Officer", desc: "Berpengalaman 10 tahun di manajemen SDM inklusif." },
            { name: "Budi Santoso", role: "Head of Technology", desc: "Arsitek sistem di balik platform aksesibel kami." },
            { name: "Sari Pertiwi", role: "Community Manager", desc: "Jembatan komunikasi antara talenta dan perusahaan." }
          ].map((member, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <User className="size-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{member.name}</h3>
              <p className="mb-2 text-sm font-medium text-blue-600">{member.role}</p>
              <p className="text-sm text-slate-500">{member.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
