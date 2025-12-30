"use client"

import { Mail, MapPin, Phone, Clock, Building, Send } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">Hubungi Kami</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Kami siap mendengar kebutuhan inklusi Anda. Silakan hubungi kami untuk konsultasi audit aksesibilitas, kerjasama rekrutmen, atau undangan pembicara.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* KOLOM 1: INFORMASI KONTAK */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building className="h-5 w-5 text-slate-900 dark:text-slate-50" /> Kantor Operasional
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm text-slate-500 mb-1">Legalitas</h3>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    PT Dimaster Education Berprestasi
                  </p>
                  <p className="text-xs text-slate-500">(Dimaster Group)</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium text-slate-900 dark:text-slate-50 mb-1">Alamat:</p>
                    <address className="not-italic leading-relaxed">
                      Jl. Mulya Makarya No. A/1,<br />
                      RT.002 / RW.004, Larangan Selatan,<br />
                      Kec. Larangan, Kota Tangerang,<br />
                      Banten 15154
                    </address>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email Utama</p>
                    <a href="mailto:halo@disabilitas.com" className="text-sm font-medium hover:text-blue-600">
                      halo@disabilitas.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <a href="https://wa.me/6282310301799" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-blue-600">
                      +62 823-1030-1799
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Layanan</p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>Senin - Jumat: 08.30 - 15.00 WIB</li>
                      <li>Sabtu: 09.30 - 12.00 WIB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM 2: FORM KONTAK */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
              <h2 className="text-xl font-semibold mb-6">Kirim Pesan</h2>
              <form className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="nama" className="text-sm font-medium">Nama Lengkap</label>
                  <input id="nama" type="text" required className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:bg-slate-950 dark:border-slate-800" placeholder="Nama Anda" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input id="email" type="email" required className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:bg-slate-950 dark:border-slate-800" placeholder="email@contoh.com" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="subjek" className="text-sm font-medium">Tujuan Menghubungi</label>
                  <select id="subjek" className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:bg-slate-950 dark:border-slate-800">
                    <option>Pertanyaan Umum</option>
                    <option>Konsultasi Audit Aksesibilitas</option>
                    <option>Kerjasama Rekrutmen Inklusif</option>
                    <option>Undangan Pembicara / Media</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="pesan" className="text-sm font-medium">Pesan</label>
                  <textarea id="pesan" required className="flex min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:bg-slate-950 dark:border-slate-800" placeholder="Tuliskan detail kebutuhan Anda..." />
                </div>

                <div className="md:col-span-2 py-2">
                  <Turnstile siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" />
                </div>

                <div className="md:col-span-2">
                  <button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors w-full md:w-auto gap-2">
                    <Send className="h-4 w-4" /> Kirim Pesan
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* KOLOM 3: GOOGLE MAPS EMBED - DIMASTER LOCATION */}
        <div className="mt-8">
           <div className="bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden h-[450px] border border-slate-300 dark:border-slate-700 relative shadow-md">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.307559987817!2d106.72661507583622!3d-6.22311899376502!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f99238e89f2d%3A0xc49d01f11e03a9f!2sDimaster%20Group!5e0!3m2!1sid!2sid!4v1703875000000!5m2!1sid!2sid" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               title="Peta Lokasi Dimaster Group"
             ></iframe>
           </div>
        </div>

      </div>
    </div>
  )
}
