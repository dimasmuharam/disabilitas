import { Mail, MapPin, Phone, MessageSquare, Clock, Building } from "lucide-react"

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">Hubungi Kami</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Kami siap mendengar kebutuhan inklusi Anda. Silakan hubungi kami untuk konsultasi, kerjasama, atau bantuan teknis.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* KOLOM 1: INFORMASI KONTAK */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Kartu Alamat */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Building className="h-5 w-5 text-slate-900 dark:text-slate-50" /> Kantor Pusat
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm text-slate-500 mb-1">Legalitas Perusahaan</h3>
                  <p className="font-medium text-slate-900 dark:text-slate-50">
                    PT Dimaster Education Berprestasi
                  </p>
                  <p className="text-xs text-slate-500">(Member of Dimaster Group)</p>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium text-slate-900 dark:text-slate-50 mb-1">Alamat Operasional:</p>
                    <address className="not-italic leading-relaxed">
                      Jl. Mulya Makarya No. A/1,<br />
                      RT.002 / RW.004, Larangan Selatan,<br />
                      Kec. Larangan, Kota Tangerang,<br />
                      Banten 15154
                    </address>
                    <p className="mt-3 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-100 dark:border-orange-900 italic">
                      *Kunjungan tamu harap membuat janji temu terlebih dahulu (Home Office).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Email Umum</p>
                    <a href="mailto:halo@disabilitas.com" className="text-sm font-medium hover:text-blue-600">
                      halo@disabilitas.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">WhatsApp / Telepon</p>
                    <a href="https://wa.me/6282310301799" target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:text-blue-600">
                      +62 823-1030-1799
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Jam Operasional</p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <li>Senin - Jumat: 08.30 - 15.00 WIB</li>
                      <li>Sabtu: 09.30 - 12.00 WIB</li>
                      <li>Minggu: Tutup</li>
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
                  <input id="nama" type="text" className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 dark:bg-slate-950 dark:border-slate-800" placeholder="Nama Anda" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input id="email" type="email" className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 dark:bg-slate-950 dark:border-slate-800" placeholder="email@contoh.com" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="subjek" className="text-sm font-medium">Subjek</label>
                  <select id="subjek" className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 dark:bg-slate-950 dark:border-slate-800">
                    <option>Pertanyaan Umum</option>
                    <option>Kerjasama Bisnis & Audit</option>
                    <option>Kendala Teknis Website</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="pesan" className="text-sm font-medium">Pesan</label>
                  <textarea id="pesan" className="flex min-h-[120px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-950 dark:bg-slate-950 dark:border-slate-800" placeholder="Tulis pesan Anda di sini..." />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-white shadow hover:bg-slate-800 transition-colors w-full md:w-auto">
                    Kirim Pesan
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* KOLOM 3: GOOGLE MAPS EMBED */}
        <div className="mt-8">
           <div className="bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden h-[400px] border border-slate-300 dark:border-slate-700 relative shadow-md">
             {/* PETA OTOMATIS:
                Mengarah ke "Dimaster Education, Larangan, Tangerang".
                Menggunakan mode "place" agar ada pin penanda lokasi.
             */}
             <iframe 
               src="https://maps.google.com/maps?q=Dimaster+Education+Jl.+Mulya+Makarya+No.A/1,+Larangan+Sel.,+Kec.+Larangan,+Kota+Tangerang,+Banten+15154&t=&z=15&ie=UTF8&iwloc=&output=embed" 
               width="100%" 
               height="100%" 
               style={{ border: 0 }} 
               allowFullScreen 
               loading="lazy" 
               referrerPolicy="no-referrer-when-downgrade"
               title="Peta Lokasi Kantor Dimaster Group"
               aria-label="Peta Google Maps menunjukkan lokasi kantor Dimaster Education di Tangerang"
             ></iframe>
             
             {/* Overlay estetik jika map loading */}
             <div className="absolute inset-0 pointer-events-none border border-slate-200/20 rounded-xl shadow-inner"></div>
           </div>
        </div>

      </div>
    </div>
  )
}
