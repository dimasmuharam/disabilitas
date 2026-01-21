import Link from "next/link"
import { 
  Handshake, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Target, 
  LineChart,
  ClipboardCheck,
  CheckCircle2
} from "lucide-react"

export default function PartnerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-emerald-100">
      
      {/* HERO SECTION - Emerald Theme for Community & Growth */}
      <section className="border-b-8 border-slate-900 bg-emerald-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Community & Training Partner
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Pastikan Pelatihan <br /> Menjadi Pekerjaan
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-emerald-50">
                Hubungkan alumni pelatihan Anda langsung dengan industri. Pantau dampak program Anda melalui tracking transisi karier yang akurat.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register?role=partner"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Daftar Sebagai Mitra
                </Link>
                <Link
                  href="#masuk"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-slate-900 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Masuk Portal Mitra
                </Link>
              </div>
            </div>
            
            {/* LOGIN FORM INTEGRATED IN HERO (RIGHT SIDE) */}
            <div id="masuk" className="rounded-[3rem] border-8 border-slate-900 bg-white p-10 text-slate-900 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] lg:p-12">
              <h2 className="mb-6 text-2xl font-black uppercase italic">Login Portal Mitra</h2>
              <form className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase tracking-widest">Email Organisasi</label>
                  <input 
                    type="email" 
                    placeholder="nama@organisasi.or.id"
                    className="w-full rounded-xl border-4 border-slate-900 p-4 font-bold outline-none focus:bg-emerald-50"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black uppercase tracking-widest">Kata Sandi</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full rounded-xl border-4 border-slate-900 p-4 font-bold outline-none focus:bg-emerald-50"
                  />
                </div>
                <button className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-black uppercase italic tracking-widest text-white transition-all hover:bg-slate-900">
                  Masuk Dashboard
                </button>
              </form>
              <p className="mt-6 text-xs font-bold text-slate-400 uppercase">
                Khusus Lembaga Pelatihan, DPO, & Komunitas Disabilitas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FILLING THE GAP: Value for Partners */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 sm:text-5xl">
            Menjembatani Celah Pelatihan <br /> & Dunia Kerja
          </h2>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {[
              {
                icon: LineChart,
                title: "Tracer Study Alumni",
                desc: "Pantau secara otomatis alumni pelatihan Anda. Siapa yang sudah bekerja, di mana, dan apakah pekerjaan tersebut sesuai dengan pelatihan Mas?"
              },
              {
                icon: Target,
                title: "Rekrutmen Peserta",
                desc: "Gunakan database talenta nasional untuk mencari calon peserta pelatihan yang paling membutuhkan atau paling sesuai dengan kriteria program Anda."
              },
              {
                icon: ClipboardCheck,
                title: "Validasi Kompetensi",
                desc: "Sertifikasi yang Mas berikan akan muncul di profil publik talenta, memberikan sinyal kualifikasi yang kuat bagi perusahaan yang ingin merekrut."
              }
            ].map((v, i) => (
              <div key={i} className="group rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-emerald-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <v.icon className="size-8 text-emerald-700" />
                </div>
                <h3 className="mb-4 text-2xl font-black uppercase italic leading-none">{v.title}</h3>
                <p className="text-sm font-bold italic leading-relaxed text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / QUOTE */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-8 inline-flex size-16 items-center justify-center rounded-full bg-emerald-500">
            <Handshake size={32} />
          </div>
          <blockquote className="text-2xl font-black italic leading-tight text-white md:text-4xl">
            &ldquo;Melalui Disabilitas.com, kami akhirnya bisa menunjukkan data konkret keterserapan alumni pelatihan kami ke dunia industri. Ini bukti dampak nyata bagi pemberi hibah dan pemerintah.&rdquo;
          </blockquote>
          <footer className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-emerald-400">
            — Koordinator Program Inklusi Komunitas
          </footer>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-emerald-600 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="text-4xl font-black uppercase italic leading-none md:text-6xl">
              Bersama Membangun <br /> Ekosistem Karier
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-emerald-100/70">
              Jangan biarkan data talenta terfragmentasi. Integrasikan program Anda sekarang.
            </p>
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/register?role=partner"
                className="rounded-2xl border-4 border-slate-900 bg-yellow-400 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0"
              >
                Gabung Sebagai Mitra
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}