import Link from "next/link"
import { Linkedin, Mail, User } from "lucide-react"

export default function TimPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-slate-900 dark:text-slate-50 mb-4">
            Nakhoda Perubahan
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Kami adalah kumpulan individu yang percaya bahwa keterbatasan fisik bukanlah batasan untuk berkarya.
          </p>
        </div>

        {/* SECTION FOUNDER */}
        <div className="mb-16">
          <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/3 h-64 md:h-auto bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              {/* Nanti ganti dengan Foto Asli Mas Dimas */}
              <User className="h-24 w-24 text-slate-400" />
            </div>
            <div className="w-full md:w-2/3 p-8 md:p-12">
              <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">Founder & CEO</div>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">Dimas Prasetyo Muharam</h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                Sebagai aktivis tunanetra dan pendiri Forum ASN Inklusif, Dimas mendedikasikan karirnya untuk menjebol tembok penghalang bagi penyandang disabilitas di dunia kerja. Visinya adalah menciptakan ekosistem di mana kompetensi menjadi satu-satunya tolak ukur, bukan kondisi fisik.
              </p>
              <div className="mt-6 flex space-x-4">
                 <Link href="#" className="text-slate-400 hover:text-blue-600"><Linkedin className="h-5 w-5" /></Link>
                 <Link href="mailto:ceo@disabilitas.com" className="text-slate-400 hover:text-blue-600"><Mail className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION TIM EKSEKUTIF (Dummy - Bisa dihapus/diedit) */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Rina Kusuma", role: "Chief Operating Officer", desc: "Berpengalaman 10 tahun di manajemen SDM inklusif." },
            { name: "Budi Santoso", role: "Head of Technology", desc: "Arsitek sistem di balik platform aksesibel kami." },
            { name: "Sari Pertiwi", role: "Community Manager", desc: "Jembatan komunikasi antara talenta dan perusahaan." }
          ].map((member, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">{member.name}</h3>
              <p className="text-blue-600 text-sm font-medium mb-2">{member.role}</p>
              <p className="text-slate-500 text-sm">{member.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
