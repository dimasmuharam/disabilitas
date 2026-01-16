"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, ArrowLeft, Globe, MapPin, Info, 
  FileText, Building2, CheckCircle2, AlertCircle,
  ListChecks, ChevronDown, TrendingUp
} from "lucide-react";

// MENGACU KETAT PADA DATA-STATIC.TS (Locked)
import { 
  UNIVERSITIES, 
  ACCOMMODATION_TYPES,
  INDONESIA_CITIES 
} from "@/lib/data-static";

// MAP UNTUK SINKRONISASI KOLOM BOOLEAN DATABASE (RESEARCH PROTOCOL v0.0.3)
const DB_MAP: Record<string, string> = {
  "Ramp, Lift, dan Jalur Mobilitas Aksesibel": "f_ramp_mobilitas",
  "Toilet Khusus Disabilitas yang Standar": "f_toilet_aksesibel",
  "Jalur Pemandu (Guiding Block) dan Penanda Tekstur": "f_guiding_block",
  "Area Parkir dan Drop-off Prioritas Disabilitas": "f_parkir_prioritas",
  "Ruang Belajar Tenang dan Pencahayaan Kontras": "f_ruang_sensory",
  "Website Portal Kampus Standar WCAG 2.1": "d_web_wcag",
  "LMS (Learning Management System) Aksesibel": "d_lms_aksesibel",
  "Dokumen Digital Kuliah Format EPUB/Tagged-PDF": "d_dokumen_digital",
  "Lisensi Software Alat Bantu (Screen Reader/Magnifier)": "d_software_assistive",
  "Sistem Informasi Pengumuman Visual dan Audio": "d_info_visual_audio",
  "Unit Layanan Disabilitas (ULD) Resmi Institusi": "o_uld_resmi",
  "Layanan Juru Bahasa Isyarat dan Notulensi Real-time": "o_jbi_notulensi",
  "Modifikasi Kurikulum dan Metode Ujian Fleksibel": "o_kurikulum_fleksibel",
  "Pendampingan Karir dan Transisi Kerja (Job Coach)": "o_pendampingan_karir"
};

interface ProfileEditorProps {
  campus: any;
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ campus, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  
  const [formData, setFormData] = useState({
    name: campus?.name || "",
    description: campus?.description || "",
    website: campus?.website || "",
    location: campus?.location || "",
    nib_number: campus?.nib_number || "",
    stats_academic_total: campus?.stats_academic_total || 0,
    stats_academic_hired: campus?.stats_academic_hired || 0,
    master_accommodations_provided: campus?.master_accommodations_provided || [],
  });

  const handleCheckboxChange = (item: string) => {
    const current = [...formData.master_accommodations_provided];
    const index = current.indexOf(item);
    if (index === -1) current.push(item);
    else current.splice(index, 1);
    setFormData({ ...formData, master_accommodations_provided: current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      // 1. UPDATE TABEL CAMPUSES (Data Display & Identitas)
      const { error: campusError } = await supabase
        .from("campuses")
        .update({
          name: formData.name,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          nib_number: formData.nib_number,
          stats_academic_total: formData.stats_academic_total,
          stats_academic_hired: formData.stats_academic_hired,
          master_accommodations_provided: formData.master_accommodations_provided,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campus.id);

      if (campusError) throw campusError;

      // 2. UPSERT KE TABEL CAMPUS_EVALUATIONS (Data Riset & Trigger Pemicu Skor)
      const evalPayload: any = { 
        campus_id: campus.id, 
        year: 2026 // Snapshot tahun berjalan
      };
      
      // Sinkronkan checkbox teks ke kolom boolean database
      ACCOMMODATION_TYPES.forEach(item => {
        const dbColumn = DB_MAP[item];
        if (dbColumn) {
          evalPayload[dbColumn] = formData.master_accommodations_provided.includes(item);
        }
      });

      const { error: evalError } = await supabase
        .from("campus_evaluations")
        .upsert(evalPayload, { onConflict: 'campus_id, year' });

      if (evalError) throw evalError;

      setMessage({ text: "Profil & Data Riset Berhasil Disinkronisasi!", isError: false });
      setTimeout(() => onUpdate(), 1500);
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
      <header className="mb-10 flex flex-col justify-between gap-4 border-b-4 border-slate-900 pb-6 md:flex-row md:items-center">
        <button onClick={onBack} aria-label="Batal dan kembali" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-slate-900">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Batal & Kembali
        </button>
        <div className="text-left md:text-right">
          <h1 className="text-2xl font-black uppercase italic leading-tight tracking-tighter">Integrasi Profil Akademik</h1>
          <p className="text-[9px] font-bold uppercase italic tracking-[0.2em] text-emerald-600">
            Research Sync Protocol v0.0.3
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-6 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* NAMA INSTITUSI */}
              <div className="space-y-3 md:col-span-2">
                <label htmlFor="uni-select" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Building2 size={14} /> Nama Institusi Terdaftar
                </label>
                <div className="relative">
                  <select id="uni-select" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="block w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900" required>
                    <option value="">-- Pilih Universitas --</option>
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              {/* LOKASI */}
              <div className="space-y-3 md:col-span-2">
                <label htmlFor="location-select" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={14} /> Lokasi Wilayah
                </label>
                <div className="relative">
                  <select id="location-select" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="block w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900" required>
                    <option value="">-- Pilih Kota --</option>
                    {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              {/* TRACER DATA (30% OUTPUT WEIGHT) */}
              <div className="space-y-6 rounded-[2rem] border-4 border-slate-900 bg-slate-900 p-8 text-white md:col-span-2">
                <div className="flex items-center gap-3">
                  <TrendingUp size={24} className="text-emerald-400" />
                  <div>
                    <h3 className="text-lg font-black uppercase italic leading-none tracking-tighter">Snapshot Keterserapan Kerja</h3>
                    <p className="mt-1 text-[9px] font-bold uppercase italic tracking-widest text-slate-400">Mempengaruhi 15% dari Skor Inklusi Nasional</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2">
                  <div className="space-y-3">
                    <label htmlFor="total-alumni" className="text-[10px] font-black uppercase text-slate-400">Total Mahasiswa Disabilitas</label>
                    <input id="total-alumni" type="number" value={formData.stats_academic_total} onChange={(e) => setFormData({...formData, stats_academic_total: parseInt(e.target.value) || 0})} className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 font-black text-emerald-400 outline-none transition-all focus:border-emerald-400" />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="hired-alumni" className="text-[10px] font-black uppercase text-slate-400">Lulusan Sudah Bekerja</label>
                    <input id="hired-alumni" type="number" value={formData.stats_academic_hired} onChange={(e) => setFormData({...formData, stats_academic_hired: parseInt(e.target.value) || 0})} className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 font-black text-emerald-400 outline-none transition-all focus:border-emerald-400" />
                  </div>
                </div>
              </div>

              {/* WEBSITE & NIB */}
              <div className="space-y-3">
                <label htmlFor="website-url" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Globe size={14} /> Website Resmi</label>
                <input id="website-url" type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900" placeholder="https://..." />
              </div>
              <div className="space-y-3">
                <label htmlFor="nib-input" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><FileText size={14} /> Nomor NIB / Izin</label>
                <input id="nib-input" type="text" value={formData.nib_number} onChange={(e) => setFormData({...formData, nib_number: e.target.value})} className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900" placeholder="0000-0000" />
              </div>

              {/* DESKRIPSI */}
              <div className="space-y-3 text-left md:col-span-2">
                <label htmlFor="description-text" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Info size={14} /> Deskripsi Layanan Inklusi</label>
                <textarea id="description-text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="block w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 px-6 py-5 font-medium leading-relaxed outline-none focus:border-slate-900" />
              </div>
            </div>
          </section>
        </div>

        {/* 14 INDIKATOR (30% FISIK + 40% DIGITAL + 15% KEBIJAKAN) */}
        <div className="space-y-8">
          <fieldset className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
            <legend className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-emerald-400">
              <ListChecks size={18} /> 14 Indikator Validasi
            </legend>
            <div className="custom-scrollbar relative z-10 max-h-[600px] space-y-3 overflow-y-auto pr-2" role="group">
              {ACCOMMODATION_TYPES.map((item) => (
                <label key={item} className="group flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all focus-within:ring-2 focus-within:ring-emerald-500 hover:bg-white/10">
                  <input type="checkbox" className="mt-1 size-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500" checked={formData.master_accommodations_provided.includes(item)} onChange={() => handleCheckboxChange(item)} />
                  <span className="text-[10px] font-black uppercase leading-tight text-slate-300 transition-colors group-hover:text-white">{item}</span>
                </label>
              ))}
            </div>
            <Building2 className="absolute -bottom-10 -right-10 text-white/5" size={200} />
          </fieldset>

          <div className="space-y-4">
            {message.text && (
              <div role="alert" className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase ${message.isError ? 'border-red-500/20 bg-red-50 text-red-600' : 'border-emerald-500/20 bg-emerald-50 text-emerald-600'}`}>
                {message.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {message.text}
              </div>
            )}
            <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-6 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-xl transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50">
              {loading ? "DATA SYNC IN PROGRESS..." : <><Save size={20} className="group-hover:animate-bounce" /> SIMPAN DATA & UPDATE INDEX</>}
            </button>
            <p className="text-center text-[8px] font-bold uppercase italic leading-relaxed tracking-widest text-slate-400">
              Data akan dihitung otomatis oleh system <br /> National Inclusion Score 2026.
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}