"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Globe, Mail, MapPin, Phone, ExternalLink, Zap } from "lucide-react"

export function SiteFooter() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith('/admin')) return null

  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 print:hidden">
      <div className="container px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* KOLOM 1: Brand & Misi */}
          <div className="flex flex-col space-y-6">
            <div className="text-left">
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50">
                Disabilitas.com
              </h2>
              <p className="mt-4 text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400 italic">
                Hub Digital Pengembangan Karir Inklusif. Menghubungkan potensi talenta dengan industri melalui validasi institusi dan standar aksesibilitas digital.
              </p>
            </div>
            
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-left transition-all hover:border-blue-500">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">Pusat Keahlian</span>
              <a 
                href="https://dimaster.co.id" 
                className="inline-flex items-center text-sm font-bold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Zap className="mr-2 size-4 text-blue-600" aria-hidden="true" /> Dimaster Group <ExternalLink className="ml-1 size-3 opacity-30" />
              </a>
            </div>
          </div>

          {/* KOLOM 2: Hub Stakeholder (Fokus Thesis & Ekosistem) */}
          <nav aria-label="Hub Pemangku Kepentingan" className="text-left">
            <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Stakeholder Hub
            </h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/talent" className="transition-all hover:text-blue-600 hover:pl-1">
                  Portal Talenta
                </Link>
              </li>
              <li>
                <Link href="/perusahaan" className="transition-all hover:text-blue-600 hover:pl-1">
                  Portal Pemberi Kerja
                </Link>
              </li>
              <li>
                <Link href="/kampus" className="transition-all hover:text-blue-600 hover:pl-1">
                  Portal Perguruan Tinggi
                </Link>
              </li>
              <li>
                <Link href="/government" className="transition-all hover:text-blue-600 hover:pl-1">
                  Portal Pemerintah
                </Link>
              </li>
              <li>
                <Link href="/partner" className="transition-all hover:text-blue-600 hover:pl-1">
                  Portal Mitra Organisasi
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 3: Layanan & Legal */}
          <nav aria-label="Layanan dan Legalitas" className="text-left">
            <h3 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-50">
              Layanan & Legal
            </h3>
            <ul className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/bisnis/audit" className="text-purple-600 transition-all hover:text-purple-800 dark:text-purple-400">
                  Audit Aksesibilitas
                </Link>
              </li>
              <li>
                <Link href="/aksesibilitas" className="transition-all hover:text-blue-600 hover:pl-1">
                  Pernyataan Aksesibilitas
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="transition-all hover:text-blue-600 hover:pl-1">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="transition-all hover:text-blue-600 hover:pl-1">
                  Hubungi Kami
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
              <div className="flex items-start group">
                <MapPin className="mr-3 size-5 shrink-0 text-blue-600 transition-transform group-hover:scale-110" aria-hidden="true" />
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
              <span className="flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" /> WCAG 2.1 AA Compliant</span>
              <span className="size-1 rounded-full bg-slate-300"></span>
              <span>ISO 27001 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}