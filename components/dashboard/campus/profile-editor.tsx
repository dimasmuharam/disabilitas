"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Globe, MapPin, Save, ShieldCheck, 
  CheckCircle2, AlertCircle, FileText, ChevronDown 
} from "lucide-react";
import { 
  ACCOMMODATION_TYPES, 
  TRAINING_ORGANIZER_CATEGORIES,
  INDONESIA_CITIES,
  UNIVERSITIES,
  GOVERNMENT_AGENCIES_LIST,
  TRAINING_PARTNERS,
  NONPROFIT_ORG_LIST
} from "@/lib/data-static";

interface ProfileEditorProps {
  partner: any;
  onUpdate: () => void;
  onBack: () => void;
}

export default function ProfileEditor({ partner, onUpdate, onBack }: ProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  const instNameRef = useRef<HTMLSelectElement>(null);
  const locationRef = useRef<HTMLSelectElement>(null);

  const [formData, setFormData] = useState({
    name: partner?.name || "",
    description: partner?.description || "",
    website: partner?.website || "",
    location: partner?.location || "",
    category: partner?.category || "Perguruan Tinggi",
    nib_number: partner?.nib_number || "",
    manual_name: "",
    master_accommodations_provided: partner?.master_accommodations_provided || []
  });

  const getInstitutionOptions = () => {
    switch (formData.category) {
      case "Perguruan Tinggi": return UNIVERSITIES;
      case "Pemerintah": return GOVERNMENT_AGENCIES_LIST;
      case "Mitra Pelatihan (LKP/LPK)": return TRAINING_PARTNERS;
      case "Organisasi / Komunitas Disabilitas": return NONPROFIT_ORG_LIST;
      default: return [];
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("Sedang sinkronisasi database...");
    
    const finalName = formData.name === "LAINNYA" ? formData.manual_name : formData.name;

    try {
      if (formData.name === "LAINNYA" && formData.manual_name) {
        await supabase.from("manual_input_logs").insert([{
          field_name: "partner_name_manual",
          input_value: formData.manual_name
        }]);
      }

      const { error } = await supabase
        .from("partners")
        .update({
          name: finalName,
          description: formData.description,
          website: formData.website,
          location: formData.location,
          category: formData.category,
          nib_number: formData.nib_number,
          master_accommodations_provided: formData.master_accommodations_provided,
          updated_at: new Date()
        })
        .eq("id", partner.id);

      if (error) throw error;

      setStatusMsg("Sukses! Profil berhasil diperbarui.");
      setTimeout(() => onUpdate(), 1500);
    } catch (err: any) {
      setStatusMsg("Gagal: " + err.message);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
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
      <div className="sr-only" aria-live="assertive">{statusMsg}</div>

      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="text-left">
          <h2 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase">Profil & Audit Inklusi</h2>
          <p className="mt-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase italic">Sinkronisasi data resmi untuk validitas riset nasional</p>
        </div>
        <div 
          className="flex items-center gap-3 rounded-2xl bg-blue-600 px-6 py-3 text-white shadow-blue-100 shadow-lg"
          aria-label={`Skor Aksesibilitas: ${partner?.inclusion_score || 0} persen`}
        >
          <ShieldCheck size={20} />
          <div className="text-left leading-none">
            <p className="text-[8px] font-black uppercase opacity-70">Inclusion Score</p>
            <p className="text-lg font-black">{partner?.inclusion_score || 0}%</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="rounded-[3rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-blue-600" size={18} />
            <h3 className="text-sm font-black italic tracking-widest uppercase">Identitas Resmi Institusi</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="inst-cat" className="text-[10px] font-black text-slate-400 uppercase">1. Kategori Institusi</label>
              <select 
                id="inst-cat"
                className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                value={formData.category}
                onChange={(e) => {
                  setFormData({...formData, category: e.target.value, name: ""});
                  setTimeout(() => instNameRef.current?.focus(), 100);
                }}
              >
                {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>{/* NAMA RESMI (CLOSED LIST) */}
            <div className="space-y-2">
              <label htmlFor="inst-name" className="text-[10px] font-black uppercase text-slate-400">2. Nama Institusi Resmi</label>
              <div className="relative">
                <select 
                  ref={instNameRef}
                  id="inst-name"
                  required
                  className="w-full appearance-none rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    if(e.target.value !== "LAINNYA") setTimeout(() => locationRef.current?.focus(), 100);
                  }}
                >
                  <option value="">-- Pilih Nama Resmi --</option>
                  {getInstitutionOptions().map(inst => <option key={inst} value={inst}>{inst}</option>)}
                  <option value="LAINNYA">+ INSTITUSI TIDAK TERDAFTAR</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* INPUT MANUAL JIKA LAINNYA */}
            {formData.name === "LAINNYA" && (
              <div className="md:col-span-2 space-y-2 animate-in zoom-in-95">
                <label htmlFor="inst-manual" className="text-[10px] font-black italic uppercase text-pink-600">Input Manual Nama Lengkap Institusi</label>
                <input 
                  id="inst-manual"
                  className="w-full rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 font-bold outline-none focus:border-pink-600"
                  placeholder="Ketik nama lengkap tanpa singkatan..."
                  value={formData.manual_name}
                  onChange={(e) => setFormData({...formData, manual_name: e.target.value})}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="inst-reg" className="text-[10px] font-black uppercase text-blue-600 italic">Nomor Registrasi (NIB/Izin)</label>
              <input 
                id="inst-reg"
                className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold transition-all outline-none focus:border-blue-600"
                placeholder="Contoh: 123456789"
                value={formData.nib_number}
                onChange={(e) => setFormData({...formData, nib_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="inst-loc" className="text-[10px] font-black uppercase text-slate-400">Domisili Kota / Kabupaten</label>
              <select 
                ref={locationRef}
                id="inst-loc"
                className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="">Pilih Kota</option>
                {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* VISI & WEBSITE */}
        <section className="rounded-[3rem] border-2 border-slate-50 bg-white p-8 text-left shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-blue-600" size={18} />
            <h3 className="text-sm font-black italic tracking-widest uppercase">Visi Inklusi & Website</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label htmlFor="inst-web" className="text-[10px] font-black uppercase text-slate-400">Website Resmi</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  id="inst-web"
                  className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 pl-12 font-bold outline-none focus:border-blue-600"
                  placeholder="https://www.institusi.ac.id"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="inst-desc" className="text-[10px] font-black uppercase text-slate-400">Komitmen Inklusi</label>
              <textarea 
                id="inst-desc"
                rows={4}
                className="w-full rounded-3xl border-2 border-transparent bg-slate-50 p-6 font-medium leading-relaxed transition-all outline-none focus:border-slate-900"
                placeholder="Ceritakan bagaimana institusi Anda mendukung talenta disabilitas..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* AUDIT AKOMODASI */}
        <section className="relative overflow-hidden rounded-[4rem] bg-slate-900 p-10 text-left text-white shadow-blue-900/20 shadow-2xl space-y-8">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-emerald-400" size={24} />
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Audit Kesiapan Inklusi</h3>
            </div>
            <p className="mb-8 max-w-lg text-xs font-medium text-slate-400">
              Data akomodasi rill ini akan disinkronkan dengan kebutuhan talenta untuk menghitung skor aksesibilitas otomatis.
            </p>
            <div role="group" aria-labelledby="audit-label" className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <span id="audit-label" className="sr-only">Daftar Akomodasi Tersedia</span>
              {ACCOMMODATION_TYPES.map((item) => {
                const isSelected = formData.master_accommodations_provided.includes(item);
                return (
                  <label
                    key={item}
                    className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-blue-500 ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-600 text-white shadow-emerald-900/20 shadow-lg"
                        : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleAccommodation(item)}
                    />
                    <span className="max-w-[85%] text-[10px] font-black leading-tight uppercase tracking-widest">
                      {item}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="shrink-0 text-white" size={18} />
                    ) : (
                      <div className="size-[18px] shrink-0 rounded-full border-2 border-slate-600 group-hover:border-slate-400" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={loading}
          className="group flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sinkronisasi Database..." : (
            <>
              <Save className="transition-transform group-hover:scale-125" size={18} /> 
              Simpan & Perbarui Profil Institusi
            </>
          )}
        </button>
      </form>
    </div>
  );
}
