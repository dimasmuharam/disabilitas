import Link from "next/link"
import { Globe, Mail, MapPin, Phone } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          
          {/* KOLOM 1: Identitas Brand & Induk */}
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Disabilitas.com
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Platform ekosistem digital inklusif pertama di Indonesia. Menghubungkan talenta, bisnis, dan pemerintah dalam satu data terintegrasi.
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="mb-1 block font-semibold">Bagian dari:</span>
              <a 
                href="https://dimaster.co.id" 
                className="inline-flex items-center font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Kunjungi website Dimaster Group (membuka tab baru)"
              >
                <Globe className="mr-2 size-4" aria-hidden="true" /> Dimaster Group
              </a>
            </div>
          </div>

          {/* KOLOM 2: Navigasi Perusahaan */}
          <nav aria-label="Tautan Perusahaan">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-50">
              Tentang Kami
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tentang" className="decoration-blue-500 underline-offset-4 hover:underline">
                  Profil Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/tim" className="decoration-blue-500 underline-offset-4 hover:underline">
                  Tim & Manajemen
                </Link>
              </li>
              <li>
                <Link href="/karir" className="decoration-blue-500 underline-offset-4 hover:underline">
                  Karir di Disabilitas.com
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="flex items-center decoration-blue-500 underline-offset-4 hover:underline">
                   Hubungi Kami
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 3: Komitmen & Legal (PENTING) */}
          <nav aria-label="Legal dan Aksesibilitas">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-50">
              Komitmen & Legal
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/aksesibilitas" className="font-medium text-blue-700 decoration-blue-500 underline-offset-4 hover:underline dark:text-blue-400">
                  Pernyataan Aksesibilitas
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="decoration-blue-500 underline-offset-4 hover:underline">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/syarat" className="decoration-blue-500 underline-offset-4 hover:underline">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/peta-situs" className="decoration-blue-500 underline-offset-4 hover:underline">
                  Peta Situs (Sitemap)
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 4: Alamat Singkat */}
          <div className="md:col-span-1">
             <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-50">
              Kantor Pusat
            </h3>
            <address className="text-sm not-italic leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="mb-3 flex items-start">
                <MapPin className="mr-2 size-5 shrink-0 text-slate-400" aria-hidden="true" />
                <span>
                  Jl. Mulya Makarya No. A/1,<br />
                  Larangan, Tangerang,<br />
                  Banten 15154.
                </span>
              </span>
              <span className="mb-2 flex items-center">
                <Mail className="mr-2 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                <a href="mailto:halo@disabilitas.com" className="hover:text-blue-600">halo@disabilitas.com</a>
              </span>
              <span className="flex items-center">
                <Phone className="mr-2 size-4 shrink-0 text-slate-400" aria-hidden="true" />
                <a 
                  href="https://wa.me/6282310301799" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-600"
                  aria-label="Hubungi WhatsApp Kami"
                >
                  +62 823-1030-1799
                </a>
              </span>
            </address>
          </div>

        </div>
        
        {/* Hak Cipta */}
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-xs text-slate-500 dark:border-slate-800">
          <p>© 2025 PT Dimaster Education Berprestasi. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  )
}
