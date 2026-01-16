"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, ArrowLeft, Globe, MapPin, Info, 
  FileText, Building2, CheckCircle2, AlertCircle,
  ListChecks, ChevronDown, Monitor, TrendingUp
} from "lucide-react";

// MENGACU KETAT PADA DATA-STATIC.TS (Locked)
import { 
  UNIVERSITIES, 
  ACCOMMODATION_TYPES,
  INDONESIA_CITIES 
} from "@/lib/data-static";

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
    inclusion_score_digital: campus?.inclusion_score_digital || 0,
    stats_academic_total: campus?.stats_academic_total || 0,
    stats_academic_hired: campus?.stats_academic_hired || 0,
    master_accommodations_provided: campus?.master_accommodations_provided || [],
  });

  const handleCheckboxChange = (item: string) => {
    const current = [...formData.master_accommodations_provided];
    const index = current.indexOf(item);
    if (index === -1) {
      current.push(item);
    } else {
      current.splice(index, 1);
    }
    setFormData({ ...formData, master_accommodations_provided: current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const { error } = await supabase
        .from("campuses")
        .update({
          name: formData.name,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          nib_number: formData.nib_number,
          inclusion_score_digital: formData.inclusion_score_digital,
          stats_academic_total: formData.stats_academic_total,
          stats_academic_hired: formData.stats_academic_hired,
          master_accommodations_provided: formData.master_accommodations_provided,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campus.id);

      if (error) throw error;

      setMessage({ text: "Profil Kampus Berhasil Disinkronisasi Secara Valid!", isError: false });
      setTimeout(() => onUpdate(), 1500);
    } catch (error: any) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      {/* HEADER CONTROL */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between border-b-4 border-slate-900 pb-6 gap-4">
        <button 
          onClick={onBack} 
          aria-label="Kembali ke halaman dashboard"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Batal & Kembali
        </button>
        <div className="text-left md:text-right">
          <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-tight">Integrasi Profil Akademik</h1>
          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 italic">
            Closed Database System • Data-Static Locked
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-6 md:p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]" aria-labelledby="section-identity">
            <h2 id="section-identity" className="sr-only">Identitas Institusi</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              
              {/* DROPDOWN UNIVERSITAS (KLASTER IDENTITAS) */}
              <div className="md:col-span-2 space-y-3">
                <label htmlFor="uni-select" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Building2 size={14} aria-hidden="true" /> Pilih Institusi Terdaftar
                </label>
                <div className="relative">
                  <select
                    id="uni-select"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Universitas Dari Daftar --</option>
                    {UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} aria-hidden="true" />
                </div>
              </div>

              {/* LOKASI WILAYAH */}
              <div className="md:col-span-2 space-y-3">
                <label htmlFor="location-select" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={14} aria-hidden="true" /> Lokasi Wilayah
                </label>
                <div className="relative">
                  <select
                    id="location-select"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="block w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Lokasi --</option>
                    {INDONESIA_CITIES.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} aria-hidden="true" />
                </div>
              </div>

              {/* KLASTER 2: DIGITAL ACCESSIBILITY (THE SALES TRIGGER) */}
              <div className="md:col-span-2 rounded-2xl border-2 border-orange-100 bg-orange-50 p-6 space-y-4">
                <label htmlFor="digital-score" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                  <Monitor size={16} aria-hidden="true" /> Digital Accessibility Self-Assessment
                </label>
                <div className="flex items-center gap-6">
                  <input
                    id="digital-score"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formData.inclusion_score_digital}
                    onChange={(e) => setFormData({...formData, inclusion_score_digital: parseInt(e.target.value)})}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-orange-200 accent-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-600"
                    aria-describedby="digital-desc"
                  />
                  <span className="text-2xl font-black text-orange-600" aria-live="polite">{formData.inclusion_score_digital}%</span>
                </div>
                <p id="digital-desc" className="text-[9px] font-bold italic text-orange-500 leading-tight uppercase leading-relaxed">
                  * Berdasarkan standar WCAG 2.1. Skor ini memicu kebutuhan audit aksesibilitas profesional oleh tim disabilitas.com.
                </p>
              </div>

              {/* KLASTER 3: OUTPUT PERFORMANCE (TRACER VALIDATION) */}
              <div className="md:col-span-2 rounded-2xl border-4 border-slate-900 bg-slate-900 p-8 text-white space-y-6">
                <div className="flex items-center gap-3">
                  <TrendingUp size={24} className="text-emerald-400" aria-hidden="true" />
                  <div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">Performa Penyerapan Kerja</h3>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">Menentukan 30% dari Bobot Inclusion Score Nasional</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="total-alumni" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Mahasiswa & Alumni Disabilitas</label>
                    <input
                      id="total-alumni"
                      type="number"
                      value={formData.stats_academic_total}
                      onChange={(e) => setFormData({...formData, stats_academic_total: parseInt(e.target.value) || 0})}
                      className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 font-black text-emerald-400 outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label htmlFor="hired-alumni" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alumni Sudah Bekerja (Manual)</label>
                    <input
                      id="hired-alumni"
                      type="number"
                      value={formData.stats_academic_hired}
                      onChange={(e) => setFormData({...formData, stats_academic_hired: parseInt(e.target.value) || 0})}
                      className="block w-full rounded-xl border-2 border-white/10 bg-white/5 px-5 py-4 font-black text-emerald-400 outline-none focus:border-emerald-400 transition-all"
                    />
                  </div>
                </div>
                
                <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                  <p className="text-[9px] font-black italic text-emerald-400 leading-relaxed uppercase tracking-widest" aria-live="polite">
                    ESTIMASI EMPLOYMENT RATE: {formData.stats_academic_total > 0 ? Math.round((formData.stats_academic_hired / formData.stats_academic_total) * 100) : 0}%
                  </p>
                </div>
              </div>

              {/* WEBSITE & NIB */}
              <div className="space-y-3">
                <label htmlFor="website-url" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Globe size={14} aria-hidden="true" /> Website Resmi
                </label>
                <input
                  id="website-url"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://univ.ac.id"
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="nib-input" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <FileText size={14} aria-hidden="true" /> Nomor NIB / Izin Izin
                </label>
                <input
                  id="nib-input"
                  type="text"
                  value={formData.nib_number}
                  onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
                  placeholder="Nomor Izin Institusi"
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none focus:border-slate-900 focus:bg-white transition-all"
                />
              </div>

              {/* DESKRIPSI LAYANAN */}
              <div className="md:col-span-2 space-y-3">
                <label htmlFor="description-text" className="ml-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Info size={14} aria-hidden="true" /> Deskripsi Komitmen Inklusi
                </label>
                <textarea
                  id="description-text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  placeholder="Ceritakan profil singkat ULD dan kebijakan inklusi kampus Anda..."
                  className="block w-full rounded-[2rem] border-2 border-slate-100 bg-slate-50 px-6 py-5 font-medium outline-none focus:border-slate-900 focus:bg-white transition-all leading-relaxed"
                />
              </div>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: KLASTER 1 - PHYSICAL & ACADEMIC ACCOMMODATION (14 INDIKATOR) */}
        <div className="space-y-8">
          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl overflow-hidden relative">
            <legend className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-emerald-400">
              <ListChecks size={18} aria-hidden="true" /> 14 Indikator Akomodasi
            </legend>
            <div 
              className="max-h-[600px] space-y-3 overflow-y-auto pr-2 custom-scrollbar"
              role="group"
              aria-label="Daftar fasilitas akomodasi fisik dan akademik"
            >
              {ACCOMMODATION_TYPES.map((item) => (
                <label key={item} className="group flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 focus-within:ring-2 focus-within:ring-emerald-500">
                  <input
                    type="checkbox"
                    className="mt-1 size-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                    checked={formData.master_accommodations_provided.includes(item)}
                    onChange={() => handleCheckboxChange(item)}
                  />
                  <span className="text-[10px] font-black leading-tight text-slate-300 uppercase group-hover:text-white transition-colors">{item}</span>
                </label>
              ))}
            </div>
            {/* Aesthetic Background Icon */}
            <Building2 className="absolute -right-10 -bottom-10 text-white/5" size={200} />
          </fieldset>

          {/* SAVE BUTTON & MESSAGE */}
          <div className="space-y-4">
            {message.text && (
              <div 
                role="alert" 
                aria-live="assertive"
                className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase animate-in zoom-in-95 ${message.isError ? 'border-red-500/20 bg-red-50 text-red-600' : 'border-emerald-500/20 bg-emerald-50 text-emerald-600'}`}
              >
                {message.isError ? <AlertCircle size={18} aria-hidden="true" /> : <CheckCircle2 size={18} aria-hidden="true" />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-6 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-xl transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "PROSES SINKRONISASI..." : (
                <>
                  <Save size={20} className="group-hover:animate-bounce" aria-hidden="true" /> SIMPAN DATA RISET
                </>
              )}
            </button>
            <p className="text-center text-[8px] font-bold uppercase tracking-widest text-slate-400 leading-relaxed italic">
              Data yang Anda masukkan menjadi basis perhitungan <br /> National Inclusion Index secara publik.
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}