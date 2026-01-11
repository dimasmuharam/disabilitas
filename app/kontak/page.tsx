"use client"

import { Mail, MapPin, Phone, Clock, Building, Send } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-50">Hubungi Kami</h1>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400">
            Kami siap mendengar kebutuhan inklusi Anda. Silakan hubungi kami untuk konsultasi audit aksesibilitas, kerjasama rekrutmen, atau undangan pembicara.
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* KOLOM 1: INFORMASI KONTAK */}
          <div className="space-y-6 lg:col-span-1">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
                <Building className="size-5 text-slate-900 dark:text-slate-50" /> Kantor Operasional
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-slate-500">Legalitas</h3>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    PT Dimaster Education Berprestasi
                  </p>
                  <p className="text-xs text-slate-500">(Dimaster Group)</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 size-5 shrink-0 text-blue-600" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="mb-1 font-medium text-slate-900 dark:text-slate-50">Alamat:</p>
                    <address className="not-italic leading-relaxed">
                      Jl. Mulya Makarya No. A/1,<br />
                      RT.002 / RW.004, Larangan Selatan,<br />
                      Kec. Larangan, Kota Tangerang,<br />
                      Banten 15154
                    </address>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="size-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">Email Utama</p>
                    <a href="mailto:halo@disabilitas.com" className="text-sm font-medium hover:text-blue-600">
                      halo@disabilitas.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp</p>
                    <a href="https://wa.me/6282310301799" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-blue-600">
                      +62 823-1030-1799
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="size-5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-500">Layanan</p>
                    <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
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
            <div className="mb-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-6 text-xl font-semibold">Kirim Pesan</h2>
              <form className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="nama" className="text-sm font-medium">Nama Lengkap</label>
                  <input id="nama" type="text" required className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950" placeholder="Nama Anda" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input id="email" type="email" required className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950" placeholder="email@contoh.com" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="subjek" className="text-sm font-medium">Tujuan Menghubungi</label>
                  <select id="subjek" className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950">
                    <option>Pertanyaan Umum</option>
                    <option>Konsultasi Audit Aksesibilitas</option>
                    <option>Kerjasama Rekrutmen Inklusif</option>
                    <option>Undangan Pembicara / Media</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="pesan" className="text-sm font-medium">Pesan</label>
                  <textarea id="pesan" required className="flex min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 dark:border-slate-800 dark:bg-slate-950" placeholder="Tuliskan detail kebutuhan Anda..." />
                </div>

                <div className="py-2 md:col-span-2">
                  <Turnstile siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" />
                </div>

                <div className="md:col-span-2">
                  <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 md:w-auto">
                    <Send className="size-4" /> Kirim Pesan
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* KOLOM 3: GOOGLE MAPS EMBED - DIMASTER LOCATION */}
        <div className="mt-8">
           <div className="relative h-[450px] overflow-hidden rounded-xl border border-slate-300 bg-slate-200 shadow-md dark:border-slate-700 dark:bg-slate-800">
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
