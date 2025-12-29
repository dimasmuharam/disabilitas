import Link from "next/link"
import { Globe, Mail, MapPin, Phone } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          
          {/* KOLOM 1: Identitas Brand & Induk */}
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
                Disabilitas.com
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Platform ekosistem digital inklusif pertama di Indonesia. Menghubungkan talenta, bisnis, dan pemerintah dalam satu data terintegrasi.
              </p>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="block font-semibold mb-1">Bagian dari:</span>
              <a 
                href="https://dimaster.co.id" 
                className="inline-flex items-center hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Kunjungi website Dimaster Group (membuka tab baru)"
              >
                <Globe className="h-4 w-4 mr-2" aria-hidden="true" /> Dimaster Group
              </a>
            </div>
          </div>

          {/* KOLOM 2: Navigasi Perusahaan */}
          <nav aria-label="Tautan Perusahaan">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4 uppercase tracking-wider">
              Tentang Kami
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/tentang" className="hover:underline underline-offset-4 decoration-blue-500">
                  Profil Perusahaan
                </Link>
              </li>
              <li>
                <Link href="/tim" className="hover:underline underline-offset-4 decoration-blue-500">
                  Tim & Manajemen
                </Link>
              </li>
              <li>
                <Link href="/karir" className="hover:underline underline-offset-4 decoration-blue-500">
                  Karir di Disabilitas.com
                </Link>
              </li>
              <li>
                <Link href="/kontak" className="hover:underline underline-offset-4 decoration-blue-500 flex items-center">
                   Hubungi Kami
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 3: Komitmen & Legal (PENTING) */}
          <nav aria-label="Legal dan Aksesibilitas">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4 uppercase tracking-wider">
              Komitmen & Legal
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/aksesibilitas" className="hover:underline underline-offset-4 decoration-blue-500 font-medium text-blue-700 dark:text-blue-400">
                  Pernyataan Aksesibilitas
                </Link>
              </li>
              <li>
                <Link href="/privasi" className="hover:underline underline-offset-4 decoration-blue-500">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/syarat" className="hover:underline underline-offset-4 decoration-blue-500">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link href="/peta-situs" className="hover:underline underline-offset-4 decoration-blue-500">
                  Peta Situs (Sitemap)
                </Link>
              </li>
            </ul>
          </nav>

          {/* KOLOM 4: Alamat Singkat */}
          <div className="md:col-span-1">
             <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4 uppercase tracking-wider">
              Kantor Pusat
            </h3>
            <address className="text-sm text-slate-600 dark:text-slate-400 not-italic leading-relaxed">
              <span className="flex items-start mb-3">
                <MapPin className="h-5 w-5 mr-2 shrink-0 text-slate-400" aria-hidden="true" />
                <span>
                  Jl. Mulya Makarya No. A/1,<br />
                  Larangan, Tangerang,<br />
                  Banten 15154.
                </span>
              </span>
              <span className="flex items-center mb-2">
                <Mail className="h-4 w-4 mr-2 shrink-0 text-slate-400" aria-hidden="true" />
                <a href="mailto:halo@disabilitas.com" className="hover:text-blue-600">halo@disabilitas.com</a>
              </span>
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-2 shrink-0 text-slate-400" aria-hidden="true" />
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
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          <p>© 2025 PT Dimaster Education Berprestasi. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  )
}
