import Link from "next/link"
import { 
  Building2, 
  Users, 
  GraduationCap, 
  Landmark, 
  Search, 
  ArrowRight, 
  Handshake, 
  Database,
  ShieldCheck,
  BarChartHorizontal,
  Zap
} from "lucide-react"

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-blue-100">
      
      {/* 1. HERO SECTION: Meruntuhkan Stigma dengan Data */}
      <section className="w-full border-b-8 border-slate-900 bg-white py-20 dark:bg-slate-900 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full border-2 border-slate-900 bg-yellow-400 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                National Inclusion Infrastructure
              </div>
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl">
                Hub Digital<br />
                <span className="text-blue-600">Karir Inklusif</span>
              </h1>
              <p className="mx-auto max-w-[800px] text-lg font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 md:text-2xl">
                Menghubungkan Talenta disabilitas, pemberi kerja yang mencari kualitas, Mitra pelatihan dan Organisasi, Perguruan Tinggi, serta Pemerintah dalam satu platform terintegrasi.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/talent"
                className="group inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-10 text-sm font-black uppercase tracking-widest text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
              >
                Eksplor Solusi Kami
              </Link>
              <Link
                href="/lowongan"
                className="group inline-flex h-14 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase tracking-widest text-slate-900 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] active:translate-y-0.5"
              >
                <Search className="mr-2 size-5" /> Cari Lowongan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE HUB: 5 Stakeholders Gateway */}
      <section className="w-full bg-slate-50 py-24 dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">Hub Koneksi Inklusif</h2>
            <p className="mt-4 font-bold uppercase tracking-widest text-slate-500 italic">Pilih peran Anda dalam ekosistem ini:</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* TALENTA - TO /talent */}
            <Link href="/talent" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Users size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Talenta</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Ubah stigma menjadi data. Bangun profil profesional yang memetakan skill dan akomodasi Anda secara resmi.
              </p>
            </Link>

            {/* PERUSAHAAN - TO /perusahaan */}
            <Link href="/perusahaan" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-white">
                <Building2 size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Perusahaan</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Dapatkan akses ke database talenta nasional yang sudah tervalidasi skill-nya oleh institusi pendidikan resmi.
              </p>
            </Link>

            {/* MITRA PELATIHAN - TO /partner */}
            <Link href="/partner" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Handshake size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Mitra Pelatihan</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Validasi kompetensi alumni Anda dan pantau keterserapan kerja mereka setelah mengikuti program pelatihan.
              </p>
            </Link>

            {/* KAMPUS - TO /kampus */}
            <Link href="/kampus" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-indigo-500 text-white">
                <GraduationCap size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Kampus (ULD)</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Digitalisasi Unit Layanan Disabilitas untuk sinkronisasi data lulusan dengan kebutuhan industri profesional.
              </p>
            </Link>

            {/* PEMERINTAH (ULD NAKER) - TO /government */}
            <Link href="/government" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-purple-600 text-white">
                <Landmark size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Pemerintah</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Gunakan dashboard otoritas untuk memantau kepatuhan industri dan simulasi ketersediaan talenta nasional.
              </p>
            </Link>

            {/* THE GAP FILLER (The Core Vision) */}
            <div className="group rounded-[2rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Zap size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic text-blue-400">The Gap Filler</h3>
              <p className="text-sm font-bold leading-relaxed opacity-80">
                Satu-satunya sistem yang menjahit data terpisah menjadi satu jalur transisi dari pendidikan ke pekerjaan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LOGIC SECTION: Why It Works */}
      <section className="w-full bg-white py-24 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-left">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl">
                Integritas Data <br /><span className="text-blue-600">Inklusi Nyata</span>
              </h2>
              <div className="space-y-4 font-bold text-slate-600 italic">
                <p className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 shrink-0 text-blue-600" />
                  Memvalidasi klaim kompetensi melalui verifikasi institusi mitra.
                </p>
                <p className="flex items-start gap-3">
                  <Database className="mt-1 shrink-0 text-blue-600" />
                  Menghilangkan hambatan informasi (*asymmetric information*) antara pencari kerja dan pemberi kerja.
                </p>
                <p className="flex items-start gap-3">
                  <BarChartHorizontal className="mt-1 shrink-0 text-blue-600" />
                  Mendukung pengambilan kebijakan berbasis data riil di lapangan.
                </p>
              </div>
            </div>
            <div className="rounded-[3rem] border-8 border-slate-900 bg-slate-100 p-8 shadow-2xl dark:bg-slate-800">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <span className="font-black uppercase italic">National Integration</span>
                  <span className="text-3xl font-black text-blue-600">DONE</span>
                </div>
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <span className="font-black uppercase italic">Institutional Trust</span>
                  <span className="text-3xl font-black text-emerald-600">HIGH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase italic">Stakeholder Sync</span>
                  <span className="text-3xl font-black text-orange-500">READY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="w-full bg-blue-600 py-24 text-white">
        <div className="container px-4 text-center md:px-6">
          <h2 className="mb-6 text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
            Satu Ekosistem. <br /> Sejuta Peluang Berbasis Data.
          </h2>
          <div className="mt-12 flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href="/daftar"
              className="inline-flex h-16 items-center justify-center rounded-2xl bg-slate-900 px-12 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/kontak"
              className="inline-flex h-16 items-center justify-center rounded-2xl border-4 border-white bg-transparent px-12 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-blue-600"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}