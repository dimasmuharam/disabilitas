"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Globe, MapPin, Info, 
  Save, ShieldCheck, CheckCircle2, AlertCircle 
} from "lucide-react";
import { ACCOMMODATION_TYPES, TRAINING_ORGANIZER_CATEGORIES } from "@/lib/data-static";

interface ProfileEditorProps {
  partner: any;
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ partner, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: partner?.name || "",
    description: partner?.description || "",
    website: partner?.website || "",
    location: partner?.location || "",
    category: partner?.category || "Lembaga Pelatihan",
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
      onUpdate(); // Memicu refresh data di dashboard utama & kembali ke overview
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
    <div className="mx-auto max-w-4xl space-y-10 duration-500 animate-in fade-in">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Profil & Audit Inklusi</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lengkapi data untuk meningkatkan skor aksesibilitas institusi</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-100">
          <ShieldCheck size={20} />
          <div className="text-left leading-none">
            <p className="text-[8px] font-black uppercase opacity-70">Accessibility Score</p>
            <p className="text-lg font-black">{partner?.inclusion_score || 0}%</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* DATA DASAR */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <h3 className="text-sm font-black uppercase italic tracking-widest">Identitas Institusi</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Nama Resmi</label>
              <input 
                className="input-std w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold transition-all focus:border-slate-900"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Kategori</label>
              <select 
                className="input-std w-full rounded-2xl bg-slate-50 p-4 font-bold"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Website & Lokasi</label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  className="w-full rounded-2xl bg-slate-50 p-4 pl-12 font-bold"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  className="w-full rounded-2xl bg-slate-50 p-4 pl-12 font-bold"
                  placeholder="Kota/Provinsi"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT AKOMODASI (RISET) */}
        <section className="relative space-y-8 overflow-hidden rounded-[4rem] bg-slate-900 p-10 text-white">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h3 className="text-xl font-black uppercase italic tracking-tighter">Audit Kesiapan Inklusi</h3>
            </div>
            <p className="mb-8 max-w-lg text-xs font-medium text-slate-400">
              Centang fasilitas dan dukungan yang secara riil tersedia di institusi Anda. Data ini akan digunakan untuk menghitung skor inklusi publik.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {ACCOMMODATION_TYPES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAccommodation(item)}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.master_accommodations_provided.includes(item)
                    ? "border-emerald-400 bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                    : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="max-w-[80%] text-left leading-tight">{item}</span>
                  {formData.master_accommodations_provided.includes(item) && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-10 opacity-5">
            <AlertCircle size={200} />
          </div>
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-[2.5rem] bg-slate-900 py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-blue-600"
        >
          {loading ? "Menyimpan Data..." : <><Save size={18}/> Simpan & Perbarui Profil Inklusi</>}
        </button>
      </form>
    </div>
  );
}
