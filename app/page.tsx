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
  BarChartHorizontal
} from "lucide-react"

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col selection:bg-blue-100">
      
      {/* 1. HERO SECTION: Meruntuhkan Stigma dengan Data */}
      <section className="w-full border-b-8 border-slate-900 bg-white py-20 dark:bg-slate-900 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl">
                Berhenti Menebak <br />
                <span className="text-blue-600">Petakan Potensi</span>
              </h1>
              <p className="mx-auto max-w-[800px] text-lg font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 md:text-2xl">
                Bukan SDM yang rendah, melainkan potensi yang belum terpetakan. 
                Satu ekosistem integrasi data untuk Talenta, Kampus, Mitra, dan Pemerintah.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/lowongan"
                className="group inline-flex h-14 items-center justify-center rounded-2xl bg-blue-600 px-10 text-sm font-black uppercase tracking-widest text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] active:translate-y-0.5"
              >
                <Search className="mr-2 size-5" /> Cari Talenta Terpetakan
              </Link>
              <Link
                href="/daftar"
                className="group inline-flex h-14 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase tracking-widest text-slate-900 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] active:translate-y-0.5"
              >
                Daftarkan Potensi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EKOSISTEM 5 PILAR: Fokus pada Solusi & Gap Filling */}
      <section className="w-full bg-slate-50 py-24 dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter sm:text-5xl">Hub Koneksi Inklusif</h2>
            <p className="mt-4 font-bold uppercase tracking-widest text-slate-500">Membatalkan batasan informasi antar stakeholder.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* TALENTA */}
            <Link href="/lowongan" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Users size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Talenta</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Bangun profil profesional dengan pemetaan skill dan akomodasi yang tervalidasi oleh lembaga resmi.
              </p>
            </Link>

            {/* PERUSAHAAN */}
            <Link href="/bisnis" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-orange-500 text-white">
                <Building2 size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Perusahaan</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Rekrutmen berbasis data, bukan asumsi. Temukan talenta sesuai kualifikasi dan domisili terdekat.
              </p>
            </Link>

            {/* MITRA PELATIHAN / ORGANISASI */}
            <Link href="/partner" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                <Handshake size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Mitra & Org</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Validasi skill alumni pelatihan Anda dan pantau dampak penyerapan kerja mereka secara berkelanjutan.
              </p>
            </Link>

            {/* KAMPUS */}
            <Link href="/kampus" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-indigo-500 text-white">
                <GraduationCap size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Kampus (ULD)</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Otomasi Tracer Study dan digitalisasi Unit Layanan Disabilitas untuk relevansi kurikulum industri.
              </p>
            </Link>

            {/* PEMERINTAH (ULD NAKER) */}
            <Link href="/government" className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-purple-600 text-white">
                <Landmark size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">ULD Naker</h3>
              <p className="text-sm font-bold leading-relaxed text-slate-600">
                Alamat digital untuk fungsi Hub daerah. Pantau kepatuhan kuota dan sebaran talenta lokal.
              </p>
            </Link>

            {/* PEMERINTAH PUSAT / SIMULASI */}
            <div className="group rounded-[2rem] border-4 border-slate-900 bg-slate-900 p-8 text-white shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] transition-all">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <BarChartHorizontal size={28} />
              </div>
              <h3 className="mb-3 text-2xl font-black uppercase italic">Pusat & Riset</h3>
              <p className="text-sm font-bold leading-relaxed opacity-80">
                Simulasi formasi CASN inklusif nasional berbasis data ketersediaan talenta riil dari berbagai daerah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE LOGIC: Addressing the Research & Thesis Gap */}
      <section className="w-full bg-white py-24 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-left">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl">
                Mengisi Celah <br /><span className="text-blue-600">Integritas Data</span>
              </h2>
              <div className="space-y-4 font-bold text-slate-600">
                <p className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 shrink-0 text-blue-600" />
                  Profil talenta tidak hanya berisi klaim, tapi validasi riwayat dari institusi pendidikan dan lembaga pelatihan.
                </p>
                <p className="flex items-start gap-3">
                  <Database className="mt-1 shrink-0 text-blue-600" />
                  Menghilangkan &quot;Asymmetric Information&quot; yang selama ini menjadi penghambat utama rekrutmen inklusif.
                </p>
                <p className="flex items-start gap-3">
                  <ArrowRight className="mt-1 shrink-0 text-blue-600" />
                  Mendorong standar Aksesibilitas Digital dan Akomodasi yang Layak sebagai parameter kesiapan industri.
                </p>
              </div>
            </div>
            <div className="rounded-[3rem] border-8 border-slate-900 bg-slate-100 p-8 shadow-2xl dark:bg-slate-800">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <span className="font-black uppercase italic">Market Matching Rate</span>
                  <span className="text-3xl font-black text-blue-600">88%</span>
                </div>
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <span className="font-black uppercase italic">Verified Institutions</span>
                  <span className="text-3xl font-black text-emerald-600">70+</span>
                </div>
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                  <span className="font-black uppercase italic">National Talent Mapping</span>
                  <span className="text-3xl font-black text-orange-500">100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="w-full bg-blue-600 py-24 text-white">
        <div className="container px-4 text-center md:px-6">
          <h2 className="mb-6 text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl">
            Siap Menjadi Bagian <br /> Dari Ekosistem?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl font-bold uppercase tracking-widest opacity-80">
            Bergabunglah sekarang untuk mewujudkan pemetaan potensi disabilitas yang akurat dan inklusif.
          </p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link
              href="/daftar"
              className="inline-flex h-16 items-center justify-center rounded-2xl bg-slate-900 px-12 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              Mulai Sekarang
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