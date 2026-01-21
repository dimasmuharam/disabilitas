"use client"

import Link from "next/link"
import { usePathname } from "next/navigation" // Pastikan import ini ada
import { Globe, Mail, MapPin, Phone, ExternalLink } from "lucide-react"

export function SiteFooter() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear();

  // --- LOGIKA "TAHU DIRI": SEMBUNYI JIKA DI AREA ADMIN ---
  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 print:hidden">
      <div className="container px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* KOLOM 1: Brand & Ekosistem */}
          <div className="flex flex-col space-y-6">
            <div className="text-left">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50">
                Disabilitas.com
              </h2>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Pusat data dan ekosistem inklusi disabilitas terintegrasi. Menghubungkan potensi talenta dengan peluang karir melalui teknologi riset dan audit aksesibilitas.
              </p>
            </div>
            
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-left">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Induk Organisasi</span>
              <a 
                href="https://dimaster.co.id" 
                className="inline-flex items-center text-sm font-bold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Kunjungi website Dimaster Group (Membuka tab baru)"
              >
                <Globe className="mr-2 size-4" aria-hidden="true" /> Dimaster Group <ExternalLink className="ml-1 size-3 opacity-30" />
              </a>
            </div>
          </div>

          {/* KOLOM 2: Navigasi Identitas */}
          <nav aria-label="Informasi Perusahaan" className="text-left">
            <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-50">
              Tentang Kami
            </h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tentang" className="transition-all hover:text-blue-600 hover:pl-1 focus:outline-none focus:ring-2 focus:ring-blue-600">
                  Profil Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/tim" className="transition-all hover:text-blue-600 hover:pl-1">
                  Tim & Manajemen
                </Link>
              </li>
              <li>
                <Link href="/karir" className="transition-all hover:text-blue-600 hover:pl-1">
                  Karir Inklusif
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="transition-all hover:text-blue-600 hover:pl-1">
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 3: Legalitas & Komitmen */}
          <nav aria-label="Legalitas dan Kebijakan" className="text-left">
            <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-50">
              Komitmen & Legal
            </h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/aksesibilitas" className="text-blue-700 transition-all hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                  Pernyataan Aksesibilitas
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="transition-all hover:text-blue-600 hover:pl-1">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/syarat" className="transition-all hover:text-blue-600 hover:pl-1">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/peta-situs" className="transition-all hover:text-blue-600 hover:pl-1">
                  Peta Situs
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 4: Kontak & Lokasi */}
          <div className="text-left">
            <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-50">
              Kantor Pusat
            </h3>
            <address className="space-y-4 text-sm not-italic font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-start">
                <MapPin className="mr-3 size-5 shrink-0 text-blue-600" aria-hidden="true" />
                <span className="leading-relaxed">
                  Jl. Mulya Makarya No. A/1,<br />
                  Larangan, Tangerang,<br />
                  Banten 15154.
                </span>
              </div>
              <div className="flex items-center group">
                <Mail className="mr-3 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <a href="mailto:halo@disabilitas.com" className="transition-colors group-hover:text-blue-600">
                  halo@disabilitas.com
                </a>
              </div>
              <div className="flex items-center group">
                <Phone className="mr-3 size-4 shrink-0 text-blue-600" aria-hidden="true" />
                <a 
                  href="https://wa.me/6282310301799" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-colors group-hover:text-blue-600"
                  aria-label="Hubungi WhatsApp Layanan Konsumen"
                >
                  +62 823-1030-1799
                </a>
              </div>
            </address>
          </div>
        </div>
        
        {/* Hak Cipta & Disclaimer */}
        <div className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              © {currentYear} PT Dimaster Education Berprestasi.
            </p>
            <div className="flex items-center gap-4 text-[9px] font-bold uppercase text-slate-400">
              <span>WCAG 2.1 Compliant</span>
              <span className="size-1 rounded-full bg-slate-300"></span>
              <span>ISO 27001 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}