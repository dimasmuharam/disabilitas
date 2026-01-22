import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Search, Users, Settings2, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Pernyataan Aksesibilitas | Standar Inklusi Digital Terpadu",
  description: "Komitmen Disabilitas.com dalam menyediakan teknologi inklusif berbasis standar WCAG 2.1 Level AA dan metodologi riset pengguna nyata.",
};

export default function AksesibilitasPage() {
  return (
    <div className="min-h-screen bg-white py-12 selection:bg-blue-100 dark:bg-slate-950 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        
        {/* HEADER SECTION */}
        <div className="mb-16 text-left">
          <div className="mb-4 inline-block rounded-lg border-2 border-slate-900 bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            Accessibility Statement
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white sm:text-6xl">
            Teknologi Tanpa <br />
            <span className="text-blue-600">Hambatan Akses.</span>
          </h1>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            Terakhir diperbarui: Januari 2026
          </p>
        </div>

        <div className="space-y-12">
          
          {/* CORE PHILOSOPHY */}
          <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-50 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:bg-slate-900 lg:p-12">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <ShieldCheck className="size-8 text-blue-600" /> Perspektif Nyata
                </h2>
                <p className="text-lg font-bold leading-relaxed text-slate-600 dark:text-slate-300">
                  Disabilitas.com dikembangkan di bawah supervisi teknis <strong>Dimas Prasetyo Muharam</strong>, seorang peneliti pendidikan inklusif dan praktisi tunanetra.
                </p>
                <p className="font-medium leading-relaxed text-slate-500 italic">
                  Kami percaya bahwa aksesibilitas sejati tercapai ketika metodologi riset yang ketat bertemu dengan pengalaman hidup nyata sebagai pengguna teknologi asistif.
                </p>
              </div>
              <div className="space-y-6">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <Search className="size-8 text-blue-600" /> Standar Kepatuhan
                </h2>
                <div className="space-y-4 font-bold text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 size-5 shrink-0 text-emerald-500" />
                    <span>WCAG 2.1 Level AA: Kepatuhan teknis internasional agar konten dapat dipersepsikan dan dipahami.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 size-5 shrink-0 text-emerald-500" />
                    <span>SPBE Indonesia: Selaras dengan standar aksesibilitas layanan publik nasional.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TECHNICAL FEATURES GRID */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Navigasi Keyboard",
                desc: "Penggunaan penuh tanpa mouse dengan kontrol hirarki fokus yang logis.",
                icon: Settings2
              },
              {
                title: "Kontras Visual",
                desc: "Rasio warna tinggi yang dioptimalkan untuk kemudahan pembacaan low-vision.",
                icon: Eye
              },
              {
                title: "Integrasi ARIA",
                desc: "Label deskriptif pada elemen interaktif untuk pembaca layar (Screen Reader).",
                icon: Users
              }
            ].map((item, idx) => (
              <div key={idx} className="group rounded-3xl border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1">
                <item.icon className="mb-4 size-10 text-blue-600" />
                <h3 className="mb-2 text-xl font-black uppercase italic tracking-tighter">{item.title}</h3>
                <p className="text-sm font-bold italic text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* REPORTING SECTION */}
          <div className="rounded-[3rem] border-4 border-slate-900 bg-blue-600 p-10 text-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="max-w-xl space-y-4">
                <h3 className="text-3xl font-black uppercase italic leading-none tracking-tighter">
                  Kolaborasi Berkelanjutan
                </h3>
                <p className="text-lg font-bold italic text-blue-100">
                  Aksesibilitas adalah proses dinamis. Jika Anda menemukan hambatan teknis, tim peneliti kami siap melakukan audit dan perbaikan segera.
                </p>
              </div>
              <Link 
                href="/kontak" 
                className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-yellow-400 px-10 text-sm font-black uppercase italic tracking-widest text-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                Laporkan Masalah Akses
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}