"use client";

import React, { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, ArrowLeft, Globe, MapPin, Info, 
  FileText, Building2, CheckCircle2, AlertCircle,
  ListChecks, ChevronDown, ShieldCheck, Link2, Loader2, X
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
  
  // State Pencarian (Combobox)
  const [searchUni, setSearchUni] = useState("");
  const [showUniList, setShowUniList] = useState(false);
  const [searchLoc, setSearchLoc] = useState("");
  const [showLocList, setShowLocList] = useState(false);

  const [formData, setFormData] = useState({
    name: campus?.name || "",
    description: campus?.description || "",
    website: campus?.website || "",
    location: campus?.location || "",
    nib_number: campus?.nib_number || "",
    master_accommodations_provided: campus?.master_accommodations_provided || [],
    verification_document_link: campus?.verification_document_link || ""
  });

  // Filter List berdasarkan input
  const filteredUnis = useMemo(() => 
    UNIVERSITIES.filter(u => u.toLowerCase().includes(searchUni.toLowerCase())), 
  [searchUni]);

  const filteredLocs = useMemo(() => 
    INDONESIA_CITIES.filter(c => c.toLowerCase().includes(searchLoc.toLowerCase())), 
  [searchLoc]);

  const handleCheckboxChange = (item: string) => {
    const current = [...formData.master_accommodations_provided];
    const index = current.indexOf(item);
    if (index === -1) current.push(item);
    else current.splice(index, 1);
    setFormData({ ...formData, master_accommodations_provided: current });
  };

  const handleSaveProfile = async () => {
    if (!formData.name) {
      setAnnouncement("Kesalahan: Nama institusi harus dipilih.");
      return;
    }

    setLoading(true);
    setAnnouncement("Sedang menyinkronkan data profil...");

    try {
      const { error: campusError } = await supabase
        .from("campuses")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campus.id);

      if (campusError) throw campusError;

      const evalPayload: any = { campus_id: campus.id, year: 2026 };
      ACCOMMODATION_TYPES.forEach(item => {
        const dbColumn = DB_MAP[item];
        if (dbColumn) evalPayload[dbColumn] = formData.master_accommodations_provided.includes(item);
      });

      await supabase.from("campus_evaluations").upsert(evalPayload, { onConflict: 'campus_id, year' });

      setAnnouncement("Sukses: Profil berhasil diperbarui.");
      setTimeout(() => onUpdate(), 1000);
    } catch (error: any) {
      setAnnouncement(`Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async () => {
    if (!formData.verification_document_link?.includes("drive.google.com")) {
      setAnnouncement("Kesalahan: Gunakan link Google Drive resmi.");
      return;
    }

    setLoading(true);
    setAnnouncement("Mengirimkan berkas verifikasi...");

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
      setAnnouncement(`Gagal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="text-left duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="sr-only" aria-live="assertive" role="status">{announcement}</div>

      <header className="mb-10 flex flex-col justify-between gap-4 border-b-4 border-slate-900 pb-6 md:flex-row md:items-center">
        <button onClick={onBack} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-slate-900">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Dashboard
        </button>
        <div className="text-left md:text-right">
          <h1 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900">Integrasi Profil Akademik</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          
          {/* SEKSI VERIFIKASI - SMART HIDING */}
          {!campus?.is_verified && (
            <section className="rounded-[3rem] border-4 border-dashed border-blue-600 bg-blue-50 p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-4">
                <div className="rounded-2xl bg-blue-600 p-3 text-white"><Link2 size={24} /></div>
                <div>
                  <h2 className="text-xl font-black uppercase italic leading-none tracking-tighter text-blue-900">Validasi Akses</h2>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-blue-500">Sertakan link SK/Dokumen Penetapan ULD dari G-Drive</p>
                </div>
              </div>
              <input 
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.verification_document_link}
                onChange={e => setFormData({...formData, verification_document_link: e.target.value})}
                className="w-full rounded-2xl border-2 border-blue-200 bg-white p-5 font-bold text-blue-900 outline-none focus:border-blue-600"
              />
            </section>
          )}

          {/* IDENTITAS UTAMA */}
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* COMBOBOX KAMPUS */}
              <div className="relative space-y-3 md:col-span-2">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Building2 size={14} /> Nama Perguruan Tinggi
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={showUniList ? searchUni : formData.name}
                    onChange={(e) => { setSearchUni(e.target.value); setShowUniList(true); }}
                    onFocus={() => setShowUniList(true)}
                    placeholder="Ketik nama kampus Anda..."
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900"
                  />
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
                {showUniList && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border-4 border-slate-900 bg-white p-2 shadow-2xl">
                    {filteredUnis.map(u => (
                      <button key={u} onClick={() => { setFormData({...formData, name: u}); setShowUniList(false); }} className="w-full rounded-lg p-3 text-left text-[10px] font-black uppercase hover:bg-blue-50 hover:text-blue-600">{u}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* COMBOBOX LOKASI */}
              <div className="relative space-y-3 md:col-span-2">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={14} /> Wilayah Otoritas
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={showLocList ? searchLoc : formData.location}
                    onChange={(e) => { setSearchLoc(e.target.value); setShowLocList(true); }}
                    onFocus={() => setShowLocList(true)}
                    placeholder="Ketik nama kota..."
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900"
                  />
                  <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
                {showLocList && (
                  <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border-4 border-slate-900 bg-white p-2 shadow-2xl">
                    {filteredLocs.map(c => (
                      <button key={c} onClick={() => { setFormData({...formData, location: c}); setShowLocList(false); }} className="w-full rounded-lg p-3 text-left text-[10px] font-black uppercase hover:bg-slate-50">{c}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">Website</label>
                <input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold" placeholder="https://..." />
              </div>
              
              <div className="space-y-3">
                <label className="ml-1 text-[10px] font-black uppercase text-slate-400">NIB / SK Mendikbud</label>
                <input type="text" value={formData.nib_number} onChange={e => setFormData({...formData, nib_number: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold" />
              </div>

              <div className="space-y-3 md:col-span-2">
                <label className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Info size={14} /> Deskripsi Layanan Inklusi</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 px-6 py-5 font-medium leading-relaxed outline-none focus:border-slate-900" placeholder="Jelaskan visi atau unit layanan disabilitas Anda..." />
              </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR AKSI */}
        <div className="space-y-8">
          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl">
            <legend className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase text-blue-400"><ListChecks size={18} /> 14 Indikator Inklusi</legend>
            <div className="custom-scrollbar max-h-[400px] space-y-3 overflow-y-auto pr-2">
              {ACCOMMODATION_TYPES.map(item => (
                <label key={item} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10">
                  <input type="checkbox" checked={formData.master_accommodations_provided.includes(item)} onChange={() => handleCheckboxChange(item)} className="mt-1 size-5 accent-blue-500" />
                  <span className="text-[9px] font-black uppercase leading-tight text-slate-300">{item}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-4">
            {announcement && (
              <div className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-emerald-400 p-4 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 size={16} /> {announcement}
              </div>
            )}
            
            <button onClick={handleSaveProfile} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-[2rem] border-4 border-slate-900 bg-white py-6 font-black uppercase text-slate-900 hover:bg-slate-50">
              {loading ? <Loader2 className="animate-spin" /> : <Save />} Update Profil
            </button>

            {!campus?.is_verified && (
              <button onClick={handleRequestVerification} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-blue-600 py-6 font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:bg-blue-700">
                <ShieldCheck /> Ajukan Verifikasi
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}