"use client";

import React, { useState } from "react";
import { 
  Save, Building2, MapPin, Globe, 
  Users, CheckCircle2, Info, Accessibility 
} from "lucide-react";
import { updateCompanyMaster } from "@/lib/actions/company";
import { INDONESIA_CITIES, ACCOMMODATION_TYPES } from "@/lib/data-static";

export default function ProfileEditor({ company, user, onSuccess }: { company: any, user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company?.name || "",
    industry: company?.industry || "",
    category: company?.category || "Swasta", // Variabel Riset BRIN
    description: company?.description || "",
    vision: company?.vision_statement || "",
    location: company?.location || "",
    totalEmployees: company?.total_employees || 0, // Variabel Riset BRIN
    totalDisabilityEmp: company?.total_employees_with_disability || 0,
    accessibilityFeatures: company?.accessibility_features || []
  });

  const [announcement, setAnnouncement] = useState("");

  const handleToggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      accessibilityFeatures: prev.accessibilityFeatures.includes(feature)
        ? prev.accessibilityFeatures.filter(f => f !== feature)
        : [...prev.accessibilityFeatures, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnnouncement(`{"Sedang menyimpan perubahan profil instansi..."}`);

    const result = await updateCompanyMaster(user.id, formData);

    if (result.data) {
      setAnnouncement(`{"Profil berhasil diperbarui. Kembali ke Overview."}`);
      onSuccess(); // Ini akan memicu redirect ke Overview di file induk
    } else {
      setAnnouncement(`{"Gagal memperbarui profil: "}${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in slide-in-from-bottom-4">
      {/* Live Region untuk Screen Reader */}
      <div className="sr-only" aria-live="polite">{announcement}</div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl"><Building2 size={24} /></div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Identitas & Kategori Instansi"}</h2>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
            >
              {loading ? "MEMPROSES..." : <><Save size={18}/> {"Simpan Perubahan"}</>}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Kolom Kiri */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Resmi Instansi"}</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Kategori (Untuk Data Riset)"}</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 bg-white"
                >
                  <option value="Swasta">{"Sektor Swasta"}</option>
                  <option value="BUMN">{"BUMN / BUMD"}</option>
                  <option value="Pemerintah">{"Instansi Pemerintah (ASN)"}</option>
                  <option value="NGO">{"Organisasi Non-Profit / NGO"}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Lokasi Kantor Pusat"}</label>
                <select 
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 bg-white"
                >
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            {/* Kolom Kanan: Data Pegawai (Gap Analysis) */}
            <div className="space-y-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <div className="flex items-center gap-2 mb-4 text-blue-600">
                <Users size={20} />
                <h3 className="text-[10px] font-black uppercase tracking-widest">{"Data Keterserapan Tenaga Kerja"}</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Total Seluruh Pegawai"}</label>
                <input 
                  type="number"
                  value={formData.totalEmployees}
                  onChange={e => setFormData({...formData, totalEmployees: parseInt(e.target.value) || 0})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-black text-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Pegawai Disabilitas Saat Ini"}</label>
                <input 
                  type="number"
                  value={formData.totalDisabilityEmp}
                  onChange={e => setFormData({...formData, totalDisabilityEmp: parseInt(e.target.value) || 0})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 font-black text-xl text-blue-600 outline-none focus:border-blue-600"
                />
              </div>
              
              <div className="p-4 bg-blue-100/50 rounded-xl border border-blue-200">
                <p className="text-[9px] font-bold text-blue-700 leading-relaxed italic">
                  {"* Data ini digunakan untuk menghitung kepatuhan kuota minimal 1% sesuai mandat UU No. 8/2016."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: MASTER AKOMODASI (UI CHECKLIST) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><Accessibility size={24} /></div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Fasilitas & Akomodasi Inklusi"}</h2>
          </div>

          <div className="grid gap-4">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Centang Fasilitas yang Dimiliki Kantor Anda:"}</label>
            <div className="flex flex-wrap gap-3">
              {ACCOMMODATION_TYPES.map(acc => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => handleToggleFeature(acc)}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${
                    formData.accessibilityFeatures.includes(acc)
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105"
                    : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200"
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
