"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Globe, MapPin, Info, 
  Save, ShieldCheck, CheckCircle2, AlertCircle, FileText 
} from "lucide-react";
import { 
  ACCOMMODATION_TYPES, 
  TRAINING_ORGANIZER_CATEGORIES,
  INDONESIA_CITIES 
} from "@/lib/data-static";

interface ProfileEditorProps {
  partner: any;
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ partner, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: partner?.name || "",
    description: partner?.description || "", // Visi Inklusi
    website: partner?.website || "",
    location: partner?.location || "",
    category: partner?.category || "Perguruan Tinggi",
    nib_number: partner?.nib_number || "", // Nomor Registrasi Institusi
    master_accommodations_provided: partner?.master_accommodations_provided || []
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from("partners")
      .update({
        ...formData,
        updated_at: new Date()
      })
      .eq("id", partner.id);

    if (!error) {
      onUpdate();
    } else {
      alert("Gagal memperbarui data: " + error.message);
    }
    setLoading(false);
  }

  const toggleAccommodation = (item: string) => {
    const current = formData.master_accommodations_provided;
    const next = current.includes(item)
      ? current.filter((i: string) => i !== item)
      : [...current, item];
    setFormData({ ...formData, master_accommodations_provided: next });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-20 duration-500 animate-in fade-in">
      {/* Header Profile */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Profil & Audit Inklusi</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Lengkapi data untuk meningkatkan skor aksesibilitas institusi</p>
        </div>
        <div 
          className="flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-100"
          aria-label={`Skor Aksesibilitas saat ini: ${partner?.inclusion_score || 0} persen`}
        >
          <ShieldCheck size={20} />
          <div className="text-left leading-none">
            <p className="text-[8px] font-black uppercase opacity-70">Accessibility Score</p>
            <p className="text-lg font-black">{partner?.inclusion_score || 0}%</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* IDENTITAS UTAMA */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <h3 className="text-sm font-black uppercase italic tracking-widest">Identitas Institusi</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="inst-name" className="text-[10px] font-black uppercase text-slate-400">Nama Resmi Institusi</label>
              <input 
                id="inst-name"
                className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold transition-all focus:border-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="inst-reg" className="text-[10px] font-black uppercase text-slate-400">Nomor Registrasi Institusi (NIB)</label>
              <input 
                id="inst-reg"
                className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold transition-all focus:border-slate-900"
                placeholder="Masukkan nomor NIB atau izin resmi"
                value={formData.nib_number}
                onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="inst-cat" className="text-[10px] font-black uppercase text-slate-400">Kategori</label>
              <select 
                id="inst-cat"
                className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="inst-loc" className="text-[10px] font-black uppercase text-slate-400">Domisili Kota / Kabupaten</label>
              <select 
                id="inst-loc"
                className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none focus:ring-2 focus:ring-slate-900"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Pilih Kota</option>
                {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="inst-web" className="text-[10px] font-black uppercase text-slate-400">Website / Tautan Profil</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                id="inst-web"
                className="w-full rounded-2xl bg-slate-50 p-4 pl-12 font-bold"
                placeholder="https://www.kampus.ac.id"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* DESKRIPSI & VISI */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            <h3 className="text-sm font-black uppercase italic tracking-widest">Deskripsi & Visi Inklusi</h3>
          </div>
          <div className="space-y-2">
            <label htmlFor="inst-desc" className="text-[10px] font-black uppercase text-slate-400">Visi Inklusi & Pengenalan Institusi</label>
            <textarea 
              id="inst-desc"
              rows={4}
              className="w-full rounded-3xl border-2 border-transparent bg-slate-50 p-6 font-medium leading-relaxed transition-all focus:border-slate-900"
              placeholder="Ceritakan komitmen institusi Anda terhadap pendidikan inklusif bagi disabilitas..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </section>

        {/* AUDIT AKOMODASI (RISET) */}
        <section className="relative space-y-8 overflow-hidden rounded-[4rem] bg-slate-900 p-10 text-white shadow-2xl shadow-blue-900/20">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Audit Kesiapan Inklusi</h3>
            </div>
            <p className="mb-8 max-w-lg text-xs font-medium text-slate-400">
              Centang fasilitas dan dukungan yang secara riil tersedia di institusi Anda. Data ini akan digunakan untuk menghitung skor inklusi publik.
            </p>

            <div 
              role="group" 
              aria-labelledby="audit-label"
              className="grid grid-cols-1 gap-3 md:grid-cols-2"
            >
              <span id="audit-label" className="sr-only">Daftar Akomodasi yang Tersedia</span>
              {ACCOMMODATION_TYPES.map((item) => {
                const isSelected = formData.master_accommodations_provided.includes(item);
                return (
                  <label
                    key={item}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleAccommodation(item)}
                    />
                    <span className="max-w-[85%] text-[10px] font-black uppercase tracking-widest leading-tight">
                      {item}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 size={18} className="text-white shrink-0" />
                    ) : (
                      <div className="h-[18px] w-[18px] rounded-full border-2 border-slate-600 group-hover:border-slate-400 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-10 opacity-5" aria-hidden="true">
            <AlertCircle size={200} />
          </div>
        </section>

        {/* TOMBOL SIMPAN */}
        <button 
          type="submit" 
          disabled={loading}
          className="group flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? (
            "Memproses Data..."
          ) : (
            <>
              <Save size={18} className="transition-transform group-hover:scale-125" /> 
              Simpan & Perbarui Profil Inklusi
            </>
          )}
        </button>
      </form>
    </div>
  );
}
