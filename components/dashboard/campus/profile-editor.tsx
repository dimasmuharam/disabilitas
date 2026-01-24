"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, ArrowLeft, Globe, MapPin, Info, 
  FileText, Building2, CheckCircle2, AlertCircle,
  ListChecks, ChevronDown, TrendingUp, ShieldCheck, Link2, Loader2
} from "lucide-react";

// MENGACU KETAT PADA DATA-STATIC.TS
import { 
  UNIVERSITIES, 
  ACCOMMODATION_TYPES,
  INDONESIA_CITIES 
} from "@/lib/data-static";

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
  const [announcement, setAnnouncement] = useState("");
  
  const [formData, setFormData] = useState({
    name: campus?.name || "",
    description: campus?.description || "",
    website: campus?.website || "",
    location: campus?.location || "",
    nib_number: campus?.nib_number || "",
    stats_academic_total: campus?.stats_academic_total || 0,
    stats_academic_hired: campus?.stats_academic_hired || 0,
    master_accommodations_provided: campus?.master_accommodations_provided || [],
    verification_document_link: campus?.verification_document_link || ""
  });

  const handleCheckboxChange = (item: string) => {
    const current = [...formData.master_accommodations_provided];
    const index = current.indexOf(item);
    if (index === -1) current.push(item);
    else current.splice(index, 1);
    setFormData({ ...formData, master_accommodations_provided: current });
  };

  // AKSI 1: SIMPAN DATA PROFIL & UPDATE SKOR INKLUSI
  const handleSaveProfile = async () => {
    if (!formData.name) {
      setAnnouncement("Kesalahan: Nama institusi harus dipilih.");
      return;
    }

    setLoading(true);
    setAnnouncement("Sedang menyinkronkan data profil dan index inklusi...");

    try {
      // 1. UPDATE TABEL CAMPUSES
      const { error: campusError } = await supabase
        .from("campuses")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campus.id);

      if (campusError) throw campusError;

      // 2. UPSERT KE TABEL CAMPUS_EVALUATIONS (Pemicu National Inclusion Score)
      const evalPayload: any = { 
        campus_id: campus.id, 
        year: 2026 
      };
      
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

      setAnnouncement("Sukses: Profil dan Data Riset berhasil diperbarui.");
    } catch (error: any) {
      setAnnouncement(`Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // AKSI 2: AJUKAN VERIFIKASI DOKUMEN (Anti-Mandek)
  const handleRequestVerification = async () => {
    if (!formData.verification_document_link || !formData.verification_document_link.trim()) {
      setAnnouncement("Kesalahan: Tautan dokumen kosong. Harap isi link Google Drive.");
      return;
    }

    if (!formData.verification_document_link.includes("drive.google.com")) {
      setAnnouncement("Kesalahan: Tautan tidak valid. Harus menggunakan link Google Drive resmi.");
      return;
    }

    setLoading(true);
    setAnnouncement("Mengirimkan berkas verifikasi ke sistem pusat...");

    try {
      const { error } = await supabase
        .from("verification_requests")
        .upsert({
          target_id: campus.id,
          target_type: 'campus',
          document_url: formData.verification_document_link,
          status: 'pending'
        }, { onConflict: 'target_id' });

      if (error) throw error;
      
      setAnnouncement("Sukses: Permohonan verifikasi berhasil dikirim.");
      setTimeout(() => onUpdate(), 2000);
    } catch (error: any) {
      setAnnouncement(`Gagal verifikasi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Live Region untuk Screen Reader */}
      <div className="sr-only" aria-live="assertive" role="status">{announcement}</div>

      <header className="mb-10 flex flex-col justify-between gap-4 border-b-4 border-slate-900 pb-6 md:flex-row md:items-center">
        <button onClick={onBack} aria-label="Batal dan kembali ke dashboard" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-slate-900">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Batal & Kembali
        </button>
        <div className="text-left md:text-right">
          <h1 className="text-2xl font-black uppercase italic leading-tight tracking-tighter">Integrasi Profil Akademik</h1>
          <p className="text-[9px] font-bold uppercase italic tracking-[0.2em] text-blue-600">
            National Inclusion Sync Protocol v2026
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          
          {/* SEKSI VERIFIKASI (Tampil jika belum verified) */}
          {!campus?.is_verified && (
            <section className="rounded-[3rem] border-4 border-dashed border-blue-600 bg-blue-50 p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg"><Link2 size={24} /></div>
                <div>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-900">Validasi Akses Kampus</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Sertakan berkas penetapan ULD atau SK Institusi</p>
                </div>
              </div>
              <div className="space-y-4">
                <label htmlFor="campus-verify-link" className="ml-2 text-[10px] font-black uppercase text-blue-900">Link Berkas G-Drive (PDF)</label>
                <input 
                  id="campus-verify-link"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.verification_document_link}
                  onChange={e => setFormData({...formData, verification_document_link: e.target.value})}
                  className="w-full rounded-2xl border-2 border-blue-200 p-5 font-bold outline-none focus:border-blue-600 shadow-inner bg-white text-blue-900"
                />
              </div>
            </section>
          )}

          {/* IDENTITAS UTAMA */}
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-6 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:p-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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

              {/* TRACER DATA */}
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
                    <input id="total-alumni" type="number" value={formData.stats_academic_total} onChange={(e) => setFormData({...formData, stats_academic_total: parseInt(e.target.value) || 0})} className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 font-black text-emerald-400 outline-none focus:border-emerald-400" />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="hired-alumni" className="text-[10px] font-black uppercase text-slate-400">Lulusan Sudah Bekerja</label>
                    <input id="hired-alumni" type="number" value={formData.stats_academic_hired} onChange={(e) => setFormData({...formData, stats_academic_hired: parseInt(e.target.value) || 0})} className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 font-black text-emerald-400 outline-none focus:border-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="website-url" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Globe size={14} /> Website Resmi</label>
                <input id="website-url" type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900" placeholder="https://..." />
              </div>
              <div className="space-y-3">
                <label htmlFor="nib-input" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><FileText size={14} /> Nomor NIB / Izin</label>
                <input id="nib-input" type="text" value={formData.nib_number} onChange={(e) => setFormData({...formData, nib_number: e.target.value})} className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900" placeholder="0000-0000" />
              </div>

              <div className="space-y-3 text-left md:col-span-2">
                <label htmlFor="description-text" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Info size={14} /> Deskripsi Layanan Inklusi</label>
                <textarea id="description-text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} className="block w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 px-6 py-5 font-medium leading-relaxed outline-none focus:border-slate-900" />
              </div>
            </div>
          </section>
        </div>

        {/* INDIKATOR DAN AKSI */}
        <div className="space-y-8">
          <fieldset className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
            <legend className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-blue-400">
              <ListChecks size={18} /> 14 Indikator Validasi
            </legend>
            <div className="custom-scrollbar relative z-10 max-h-[500px] space-y-3 overflow-y-auto pr-2" role="group">
              {ACCOMMODATION_TYPES.map((item) => (
                <label key={item} className="group flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                  <input type="checkbox" className="mt-1 size-5 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500" checked={formData.master_accommodations_provided.includes(item)} onChange={() => handleCheckboxChange(item)} />
                  <span className="text-[10px] font-black uppercase leading-tight text-slate-300 transition-colors group-hover:text-white">{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* AREA NOTIFIKASI DAN TOMBOL */}
          <div className="space-y-6">
            {announcement && (
              <div className={`flex items-center gap-3 rounded-2xl border-4 p-5 text-[10px] font-black uppercase italic tracking-widest border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]
                ${announcement.includes("Sukses") ? "bg-emerald-400 text-slate-900" : 
                  announcement.includes("Sedang") ? "bg-blue-400 text-white" : 
                  "bg-rose-400 text-white"}`}>
                {announcement.includes("Sukses") ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {announcement}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <button 
                type="button"
                onClick={handleSaveProfile}
                disabled={loading} 
                className="group flex w-full items-center justify-center gap-3 rounded-[2rem] border-4 border-slate-900 bg-white py-6 text-xs font-black uppercase italic tracking-widest text-slate-900 transition-all hover:bg-slate-50 disabled:opacity-50"
              >
                {loading && !announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Simpan Draft Profil
              </button>

              {!campus?.is_verified && (
                <button 
                  type="button"
                  onClick={handleRequestVerification}
                  disabled={loading} 
                  className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-blue-600 py-6 text-xs font-black uppercase italic tracking-widest text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  {loading && announcement.includes("verifikasi") ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  Ajukan Verifikasi
                </button>
              )}
            </div>
            
            <p className="text-center text-[8px] font-bold uppercase italic leading-relaxed tracking-widest text-slate-400">
              Data Profil diproses untuk National Inclusion Score. <br /> Verifikasi diperlukan untuk otorisasi penuh.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}