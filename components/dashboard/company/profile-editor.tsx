"use client";

import React, { useState } from "react";
import { 
  Save, Building2, Globe, Users, 
  Accessibility, FileBadge, Mail, 
  MapPin, FileText
} from "lucide-react";
import { updateCompanyMaster } from "@/lib/actions/company";
import { 
  INDONESIA_CITIES, 
  ACCOMMODATION_TYPES, 
  INDUSTRY_CATEGORIES,     // Sudah Sesuai data-static
  COMPANY_SIZE_CATEGORIES, // Sudah Sesuai data-static
  EMPLOYER_CATEGORIES      // Sudah Sesuai data-static
} from "@/lib/data-static";

export default function ProfileEditor({ company, user, onSuccess }: { company: any, user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const [formData, setFormData] = useState({
    name: company?.name || "",
        website: company?.website || "",
    industry: company?.industry || "",
    category: company?.category || EMPLOYER_CATEGORIES[0],
    size: company?.size || "",
    nib_number: company?.nib_number || "",
    description: company?.description || "",
    location: company?.location || "",
    total_employees: company?.total_employees || 0,
    total_employees_with_disability: company?.total_employees_with_disability || 0,
    master_accommodations_provided: (company?.master_accommodations_provided as string[]) || []
  });

  const handleToggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      master_accommodations_provided: prev.master_accommodations_provided.includes(feature)
        ? prev.master_accommodations_provided.filter((f: string) => f !== feature)
        : [...prev.master_accommodations_provided, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnnouncement(`{"Sedang menyimpan data riset instansi ke server..."}`);

    // Mapping sinkron total dengan kolom tabel companies di database
    const payload = {
      name: formData.name,
            website: formData.website,
      industry: formData.industry,
      category: formData.category,
      size: formData.size,
      nib_number: formData.nib_number,
      description: formData.description,
      location: formData.location,
      total_employees: formData.total_employees,
      total_employees_with_disability: formData.total_employees_with_disability,
      master_accommodations_provided: formData.master_accommodations_provided
    };

    const result = await updateCompanyMaster(user.id, payload);

    if (result.data) {
      setAnnouncement(`{"Data profil diperbarui secara permanen. Kembali ke Dashboard."}`);
      onSuccess(); 
    } else {
      setAnnouncement(`{"Gagal menyimpan data ke database. Silakan cek koneksi Anda."}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in slide-in-from-bottom-4">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* BAGIAN 1: IDENTITAS LEGAL & KATEGORI */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-10">
          <div className="flex items-center gap-4 border-b pb-8">
            <div className="p-3 bg-blue-600 text-white rounded-2xl"><Building2 size={24} /></div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Informasi Resmi Instansi"}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="comp-name" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Resmi Instansi"}</label>
                <input id="comp-name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600 transition-all focus:ring-4 focus:ring-blue-50" />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="comp-nib" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><FileBadge size={12} className="text-blue-600" /> {"NIB (Nomor Induk Berusaha)"}</label>
                <input id="comp-nib" required placeholder="13 digit nomor..." value={formData.nib_number} onChange={e => setFormData({...formData, nib_number: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-black tracking-[0.2em] outline-none focus:border-blue-600 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="comp-cat" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Kategori"}</label>
                  <select id="comp-cat" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white focus:border-blue-600 outline-none">
                    {EMPLOYER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="comp-size" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Skala Usaha"}</label>
                  <select id="comp-size" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white focus:border-blue-600 outline-none">
                    <option value="">{"Pilih Skala"}</option>
                    {COMPANY_SIZE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="comp-ind" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Sektor Industri"}</label>
                <select id="comp-ind" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white focus:border-blue-600 outline-none">
                  <option value="">{"Pilih Industri"}</option>
                  {INDUSTRY_CATEGORIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><label htmlFor="comp-web" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><Globe size={12}/> {"Website"}</label><input id="comp-web" placeholder="https://..." value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold focus:border-blue-600 outline-none" /></div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-loc" className="text-[10px] font-black uppercase text-slate-400 ml-2 flex items-center gap-2"><MapPin size={12}/> {"Lokasi Kantor Pusat"}</label>
                <select id="comp-loc" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold bg-white focus:border-blue-600 outline-none">
                  <option value="">{"Pilih Kota"}</option>
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>
        {/* BAGIAN 2: RISET KARYAWAN & DATA AKOMODASI */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-12">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Keterserapan Tenaga Kerja */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <Users size={24} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-tight">{"Statistik Karyawan"}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div className="space-y-2">
                  <label htmlFor="total-emp" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Total Seluruh Pegawai"}</label>
                  <input 
                    id="total-emp" type="number"
                    value={formData.total_employees}
                    onChange={e => setFormData({...formData, total_employees: parseInt(e.target.value) || 0})}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 font-black text-xl outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="dis-emp" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Pegawai Disabilitas Saat Ini"}</label>
                  <input 
                    id="dis-emp" type="number"
                    value={formData.total_employees_with_disability}
                    onChange={e => setFormData({...formData, total_employees_with_disability: parseInt(e.target.value) || 0})}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 font-black text-xl text-blue-600 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Deskripsi & Komitmen */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-slate-900 mb-2">
                <FileText size={24} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-tight">{"Deskripsi & Komitmen"}</h2>
              </div>
              <div className="space-y-2">
                <label htmlFor="comp-desc" className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Profil Singkat Instansi"}</label>
                <textarea 
                  id="comp-desc" rows={8}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 rounded-2xl border-2 border-slate-100 text-sm font-medium outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
                  placeholder="Ceritakan profil umum dan bagaimana instansi Anda mendukung keberagaman talenta..."
                />
              </div>
            </div>
          </div>

          {/* FASILITAS AKOMODASI (SOP: Checkbox Asli untuk Aksesibilitas) */}
          <div className="space-y-6 border-t pt-10">
            <div className="flex items-center gap-3 text-slate-900">
              <Accessibility size={24} className="text-emerald-600" />
              <div>
                <h2 className="text-sm font-black uppercase italic tracking-tighter">{"Master Fasilitas & Akomodasi Inklusi"}</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{"Pilih fasilitas yang tersedia secara nyata di kantor Anda"}</p>
              </div>
            </div>
            
            <fieldset className="grid gap-4">
              <legend className="sr-only">{"Opsi Akomodasi Tersedia"}</legend>
              <div className="flex flex-wrap gap-3" role="group">
                {ACCOMMODATION_TYPES.map((acc) => {
                  const isChecked = formData.master_accommodations_provided.includes(acc);
                  return (
                    <label key={acc} className="relative cursor-pointer group">
                      {/* Checkbox asli disembunyikan secara visual tetapi terbaca Screen Reader */}
                      <input 
                        type="checkbox"
                        className="sr-only peer"
                        checked={isChecked}
                        onChange={() => handleToggleFeature(acc)}
                        aria-label={acc}
                      />
                      {/* Desain UI Garang mengikuti status Peer-Checked */}
                      <div className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2 
                        ${isChecked 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg scale-105" 
                          : "bg-slate-50 text-slate-400 border-slate-100 hover:border-emerald-200"
                        } peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-200`}>
                        {isChecked && <span className="mr-2">{"✓"}</span>} {acc}
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </section>

        {/* TOMBOL SIMPAN - POSISI DI UJUNG FORM (SOP) */}
        <div className="pt-10 flex flex-col md:flex-row justify-end items-center gap-6 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-400 uppercase italic text-center md:text-right">
            {"* Dengan menyimpan, data ini akan menjadi basis perhitungan indeks inklusi instansi Anda."}
          </p>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-20 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "MEMPROSES DATA..." : "SIMPAN & SELESAI"}
          </button>
        </div>
      </form>
    </div>
  );
}
