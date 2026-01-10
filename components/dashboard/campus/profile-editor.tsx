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
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Profil & Audit Inklusi</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lengkapi data untuk meningkatkan skor aksesibilitas institusi</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-100">
          <ShieldCheck size={20} />
          <div className="text-left leading-none">
            <p className="text-[8px] font-black uppercase opacity-70">Accessibility Score</p>
            <p className="text-lg font-black">{partner?.inclusion_score || 0}%</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* DATA DASAR */}
        <section className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={18} className="text-blue-600" />
            <h3 className="font-black uppercase italic text-sm tracking-widest">Identitas Institusi</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Nama Resmi</label>
              <input 
                className="input-std w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-slate-900 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Kategori</label>
              <select 
                className="input-std w-full p-4 bg-slate-50 rounded-2xl font-bold"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Website & Lokasi</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  className="pl-12 w-full p-4 bg-slate-50 rounded-2xl font-bold"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  className="pl-12 w-full p-4 bg-slate-50 rounded-2xl font-bold"
                  placeholder="Kota/Provinsi"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT AKOMODASI (RISET) */}
        <section className="bg-slate-900 p-10 rounded-[4rem] text-white space-y-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h3 className="font-black uppercase italic text-xl tracking-tighter">Audit Kesiapan Inklusi</h3>
            </div>
            <p className="text-xs font-medium text-slate-400 max-w-lg mb-8">
              Centang fasilitas dan dukungan yang secara riil tersedia di institusi Anda. Data ini akan digunakan untuk menghitung skor inklusi publik.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACCOMMODATION_TYPES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleAccommodation(item)}
                  className={`flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                    formData.master_accommodations_provided.includes(item)
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/20"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="text-left leading-tight max-w-[80%]">{item}</span>
                  {formData.master_accommodations_provided.includes(item) && <CheckCircle2 size={16} />}
                </button>
              ))}
            </div>
          </div>
          <div className="absolute right-0 bottom-0 p-10 opacity-5">
            <AlertCircle size={200} />
          </div>
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-2xl"
        >
          {loading ? "Menyimpan Data..." : <><Save size={18}/> Simpan & Perbarui Profil Inklusi</>}
        </button>
      </form>
    </div>
  );
}
