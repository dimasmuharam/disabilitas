"use client"

import { Metadata } from "next";
import { Mail, MapPin, Phone, Clock, Building, Send, MessageSquare } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-white py-12 selection:bg-blue-100 dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        
        {/* HEADER SECTION */}
        <div className="mb-16 text-center lg:text-left">
          <div className="mb-4 inline-block rounded-lg border-2 border-slate-900 bg-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            Contact & Support
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50 sm:text-6xl">
            Mari Berdiskusi.
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-bold italic text-slate-500 dark:text-slate-400">
            Kami siap mendengar kebutuhan inklusi Anda. Hubungi kami untuk konsultasi audit aksesibilitas, kerjasama rekrutmen, atau sinergi ekosistem riset.
          </p>
        </div>
        
        <div className="grid gap-12 lg:grid-cols-3">
          
          {/* KOLOM 1: INFORMASI KONTAK - Gaya Neubrutalist */}
          <div className="space-y-8 lg:col-span-1">
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] dark:bg-slate-900 dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
              <h2 className="mb-8 flex items-center gap-3 text-2xl font-black uppercase italic">
                <Building className="size-6 text-blue-600" /> Kantor
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entitas Resmi</h3>
                  <p className="font-black uppercase italic text-slate-900 dark:text-slate-50">
                    PT Dimaster Education Berprestasi
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="rounded-xl border-2 border-slate-900 bg-blue-50 p-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <MapPin className="size-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-bold italic text-slate-600 dark:text-slate-400">
                    <address className="not-italic leading-relaxed">
                      Jl. Mulya Makarya No. A/1,<br />
                      Larangan Selatan, Kec. Larangan,<br />
                      Kota Tangerang, Banten 15154
                    </address>
                  </div>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="rounded-xl border-2 border-slate-900 bg-emerald-50 p-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <Mail className="size-5 text-emerald-600" />
                  </div>
                  <a href="mailto:halo@disabilitas.com" className="text-sm font-black uppercase italic transition-colors hover:text-blue-600">
                    halo@disabilitas.com
                  </a>
                </div>

                <div className="group flex items-center gap-4">
                  <div className="rounded-xl border-2 border-slate-900 bg-green-50 p-2 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                    <Phone className="size-5 text-green-600" />
                  </div>
                  <a href="https://wa.me/6282310301799" target="_blank" rel="noopener noreferrer" className="text-sm font-black uppercase italic transition-colors hover:text-green-600">
                    +62 823-1030-1799
                  </a>
                </div>

                <div className="border-t-2 border-slate-100 pt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock size={14} /> Jam Operasional
                  </h3>
                  <ul className="space-y-1 text-xs font-black uppercase italic text-slate-500">
                    <li>Sen - Jum: 08.30 - 15.00 WIB</li>
                    <li>Sabtu: 09.30 - 12.00 WIB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* KOLOM 2: FORM PESAN - Interactive Style */}
          <div className="lg:col-span-2">
            <div className="rounded-[3rem] border-4 border-slate-900 bg-slate-50 p-8 shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] dark:bg-slate-900 lg:p-12">
              <h2 className="mb-8 flex items-center gap-3 text-3xl font-black uppercase italic">
                <MessageSquare className="size-8 text-blue-600" /> Kirim Pesan
              </h2>
              
              <form className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <label htmlFor="nama" className="text-[10px] font-black uppercase tracking-widest">Nama Lengkap</label>
                  <input 
                    id="nama" 
                    type="text" 
                    required 
                    className="flex h-14 w-full rounded-xl border-4 border-slate-900 bg-white px-4 font-bold outline-none focus:bg-blue-50 dark:bg-slate-950" 
                    placeholder="Nama/Instansi Anda" 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest">Alamat Email</label>
                  <input 
                    id="email" 
                    type="email" 
                    required 
                    className="flex h-14 w-full rounded-xl border-4 border-slate-900 bg-white px-4 font-bold outline-none focus:bg-blue-50 dark:bg-slate-950" 
                    placeholder="email@kantor.com" 
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="subjek" className="text-[10px] font-black uppercase tracking-widest">Tujuan Menghubungi</label>
                  <select 
                    id="subjek" 
                    className="flex h-14 w-full appearance-none rounded-xl border-4 border-slate-900 bg-white px-4 font-bold outline-none focus:bg-blue-50 dark:bg-slate-950"
                  >
                    <option>Konsultasi Audit Aksesibilitas Digital (Expertise)</option>
                    <option>Sinergi Ekosistem & Riset BRIN</option>
                    <option>Kerjasama Rekrutmen & Data Talenta</option>
                    <option>Kemitraan Perguruan Tinggi (ULD)</option>
                    <option>Undangan Media & Pembicara</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label htmlFor="pesan" className="text-[10px] font-black uppercase tracking-widest">Detail Kebutuhan</label>
                  <textarea 
                    id="pesan" 
                    required 
                    className="flex min-h-[150px] w-full rounded-xl border-4 border-slate-900 bg-white p-4 font-bold outline-none focus:bg-blue-50 dark:bg-slate-950" 
                    placeholder="Tuliskan pesan atau detail tantangan inklusi di organisasi Anda..." 
                  />
                </div>

                <div className="py-2 md:col-span-2">
                  <Turnstile siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" />
                </div>

                <div className="md:col-span-2">
                  <button 
                    type="submit" 
                    className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-blue-600 px-10 text-sm font-black uppercase italic tracking-widest text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:bg-slate-900"
                  >
                    <Send className="size-5" /> Kirim Pesan Strategis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* GOOGLE MAPS SECTION */}
        <div className="mt-16 overflow-hidden rounded-[3rem] border-8 border-slate-900 shadow-[15px_15px_0px_0px_rgba(15,23,42,0.1)]">
          <div className="relative h-[450px] bg-slate-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.304673892348!2d106.7214!3d-6.2235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnMjQuNiJTIDEwNiw0MycxNy4wIkU!5e0!3m2!1sen!2sid!4v1700000000000" 
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