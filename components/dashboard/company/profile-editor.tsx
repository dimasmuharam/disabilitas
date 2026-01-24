"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Save, Building2, Globe, Users, 
  Accessibility, FileBadge, 
  MapPin, FileText, Search, ChevronDown, CheckCircle2,
  AlertCircle, Link2, Loader2
} from "lucide-react";
import { updateCompanyMaster } from "@/lib/actions/company";
import { 
  INDONESIA_CITIES, 
  ACCOMMODATION_TYPES, 
  INDUSTRY_CATEGORIES, 
  COMPANY_SIZE_CATEGORIES, 
  EMPLOYER_CATEGORIES,
  GOVERNMENT_AGENCIES_LIST,
  STATE_ENTERPRISES_LIST,
  PRIVATE_COMPANIES_LIST,
  NONPROFIT_ORG_LIST
} from "@/lib/data-static";

export default function ProfileEditor({ company, user, onSuccess }: { company: any, user: any, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  
  // State untuk pencarian nama instansi
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    master_accommodations_provided: (company?.master_accommodations_provided as string[]) || [],
    // KOLOM BARU SESUAI SKEMA VERIFIKASI
    verification_document_link: company?.verification_document_link || ""
  });

  // LOGIKA SINKRONISASI DAFTAR NAMA BERDASARKAN KATEGORI
  const filteredList = useMemo(() => {
    let list: string[] = [];
    if (formData.category === "Instansi Pemerintah (ASN)") list = GOVERNMENT_AGENCIES_LIST;
    else if (formData.category === "BUMN dan BUMD") list = STATE_ENTERPRISES_LIST;
    else if (formData.category === "Perusahaan Swasta") list = PRIVATE_COMPANIES_LIST;
    else if (formData.category === "Lembaga Nonprofit") list = NONPROFIT_ORG_LIST;
    
    if (!searchTerm) return list;
    return list.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [formData.category, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    
    // VALIDASI TAMBAHAN UNTUK VERIFIKASI
    if (!formData.name) {
      setAnnouncement("Pilih nama instansi terlebih dahulu.");
      return;
    }
    if (!formData.verification_document_link.includes("drive.google.com")) {
      setAnnouncement("Harap masukkan link Google Drive yang valid untuk dokumen verifikasi.");
      return;
    }
    
    setLoading(true);
    setAnnouncement(`Sedang menyimpan profil ${formData.name}...`);

    const result = await updateCompanyMaster(user.id, formData);

    if (result.data) {
      setAnnouncement("Berhasil memperbarui profil. Menunggu verifikasi admin.");
      onSuccess(); 
    } else {
      setAnnouncement("Gagal menyimpan data.");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl pb-20 text-left animate-in slide-in-from-bottom-4">
      {/* Aksesibilitas: Live Region untuk Screen Reader */}
      <div className="sr-only" aria-live="assertive" role="status">{announcement}</div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SEKSI 0: DOKUMEN VERIFIKASI (KRUSIAL UNTUK GATEKEEPING) */}
        {!company?.is_verified && (
          <section className="rounded-[3rem] border-4 border-dashed border-blue-600 bg-blue-50 p-10 shadow-xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg"><Link2 size={24} /></div>
              <div>
                <h2 className="text-xl font-black uppercase italic tracking-tighter text-blue-900">Validasi Akses Dashboard</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Sertakan link ke surat pengajuan kerjasama resmi dari perusahaan Anda dalam file PDF yang disimpan di Google Drive </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <label htmlFor="comp-verify-link" className="ml-2 text-[10px] font-black uppercase text-blue-900">Link Google Drive Dokumen Resmi</label>
              <input 
                id="comp-verify-link"
                required
                type="url"
                placeholder="https://drive.google.com/file/..."
                value={formData.verification_document_link}
                onChange={e => setFormData({...formData, verification_document_link: e.target.value})}
                className="w-full rounded-2xl border-2 border-blue-200 p-5 font-bold outline-none focus:border-blue-600 shadow-inner bg-white"
              />
              <div className="flex items-start gap-3 rounded-2xl bg-white/50 p-4 border border-blue-100">
                <AlertCircle size={16} className="text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed text-blue-800 italic">
                  Pastikan akses Google Drive diatur ke <strong>&quot;Anyone with the link / Siapa saja yang memiliki link&quot;</strong> agar Admin dapat memverifikasi profil Anda dengan cepat.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* SEKSI 1: IDENTITAS RESMI */}
        <section className="space-y-10 rounded-[3rem] border-2 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex items-center gap-4 border-b pb-8">
            <div className="rounded-2xl bg-slate-900 p-3 text-white"><Building2 size={24} /></div>
            <div>
              <h2 className="text-xl font-black uppercase italic tracking-tighter">Informasi Resmi Instansi</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Sinkronisasi data master pemberi kerja nasional</p>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="comp-cat" className="ml-2 text-[10px] font-black uppercase text-slate-400">Kategori Pemberi Kerja</label>
                <select 
                  id="comp-cat" 
                  required
                  value={formData.category} 
                  onChange={e => {
                    setFormData({...formData, category: e.target.value, name: ""});
                    setSearchTerm("");
                    setAnnouncement(`Kategori: ${e.target.value}. Pilih nama.`);
                  }} 
                  className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600"
                >
                  <option value="">Pilih Kategori...</option>
                  {EMPLOYER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="relative space-y-2" ref={dropdownRef}>
                <label htmlFor="comp-name-search" className="ml-2 text-[10px] font-black uppercase text-slate-400">Nama Resmi (Sesuai SK/NIB)</label>
                <div className="relative">
                  <input 
                    id="comp-name-search"
                    autoComplete="off"
                    placeholder={formData.name || (formData.category ? "Ketik nama..." : "Pilih kategori dulu")}
                    disabled={!formData.category}
                    value={searchTerm}
                    onFocus={() => setIsDropdownOpen(true)}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-blue-600 disabled:bg-slate-50"
                  />
                  <ChevronDown className="absolute right-4 top-4 text-slate-300" size={20} />
                </div>

                {isDropdownOpen && formData.category && (
                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border-2 border-slate-900 bg-white p-2 shadow-2xl" role="listbox">
                    {filteredList.length > 0 ? filteredList.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setFormData({...formData, name: item});
                          setSearchTerm("");
                          setIsDropdownOpen(false);
                          setAnnouncement(`Terpilih: ${item}`);
                        }}
                        className="w-full rounded-xl p-3 text-left text-[10px] font-black uppercase hover:bg-blue-50 hover:text-blue-600"
                      >
                        {item}
                      </button>
                    )) : (
                      <div className="p-4 text-center text-[10px] font-bold italic text-slate-400">Data tidak tersedia</div>
                    )}
                  </div>
                )}
                {formData.name && (
                  <p className="ml-2 mt-1 flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600">
                    <CheckCircle2 size={12} /> {formData.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-nib" className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><FileBadge size={12} /> NIB / Nomor Registrasi</label>
                <input id="comp-nib" required placeholder="Contoh: 123456789..." value={formData.nib_number} onChange={e => setFormData({...formData, nib_number: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 p-4 font-black tracking-widest outline-none focus:border-blue-600" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="comp-ind" className="ml-2 text-[10px] font-black uppercase text-slate-400">Sektor Industri</label>
                  <select id="comp-ind" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600">
                    <option value="">Pilih Industri</option>
                    {INDUSTRY_CATEGORIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="comp-size" className="ml-2 text-[10px] font-black uppercase text-slate-400">Skala Usaha</label>
                  <select id="comp-size" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600">
                    <option value="">Pilih Skala</option>
                    {COMPANY_SIZE_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-web" className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><Globe size={12}/> Website</label>
                <input id="comp-web" type="url" placeholder="https://..." value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 p-4 font-bold outline-none focus:border-blue-600" />
              </div>

              <div className="space-y-2">
                <label htmlFor="comp-loc" className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><MapPin size={12}/> Lokasi Kantor Pusat</label>
                <select id="comp-loc" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-white p-4 font-bold outline-none focus:border-blue-600">
                  <option value="">Pilih Kota</option>
                  {INDONESIA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* SEKSI 2: RISET KARYAWAN & DATA AKOMODASI */}
        <section className="space-y-12 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <Users size={24} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-tight">Statistik Karyawan</h2>
              </div>
              <div className="grid grid-cols-1 gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-8">
                <div className="space-y-2">
                  <label htmlFor="total-emp" className="text-[10px] font-black uppercase text-slate-400">Total Seluruh Pegawai</label>
                  <input id="total-emp" type="number" value={formData.total_employees} onChange={e => setFormData({...formData, total_employees: parseInt(e.target.value) || 0})} className="w-full rounded-2xl border-2 border-slate-200 p-4 text-xl font-black outline-none focus:border-blue-600" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dis-emp" className="text-[10px] font-black uppercase text-slate-400">Pegawai Disabilitas Saat Ini</label>
                  <input id="dis-emp" type="number" value={formData.total_employees_with_disability} onChange={e => setFormData({...formData, total_employees_with_disability: parseInt(e.target.value) || 0})} className="w-full rounded-2xl border-2 border-slate-200 p-4 text-xl font-black text-blue-600 outline-none focus:border-blue-600" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="mb-2 flex items-center gap-3 text-slate-900">
                <FileText size={24} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-tight">Visi & Komitmen Inklusi</h2>
              </div>
              <div className="space-y-2">
                <label htmlFor="comp-desc" className="ml-2 text-[10px] font-black uppercase text-slate-400">Profil / Bio Instansi</label>
                <textarea id="comp-desc" rows={8} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 p-4 text-sm font-medium outline-none focus:border-blue-600 shadow-inner" placeholder="Jelaskan bagaimana budaya kerja di instansi Anda..." />
              </div>
            </div>
          </div>

          {/* FASILITAS */}
          <div className="space-y-6 border-t pt-10">
            <div className="flex items-center gap-3">
              <Accessibility size={24} className="text-emerald-600" />
              <div>
                <h2 className="text-sm font-black uppercase italic tracking-tighter">Master Fasilitas Inklusi</h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Data ini membantu talenta dalam memilih lingkungan kerja yang sesuai</p>
              </div>
            </div>
            
            <fieldset>
              <legend className="sr-only">Daftar Fasilitas Akomodasi</legend>
              <div className="flex flex-wrap gap-3">
                {ACCOMMODATION_TYPES.map((acc) => {
                  const isChecked = formData.master_accommodations_provided.includes(acc);
                  return (
                    <label key={acc} className="cursor-pointer group">
                      <input type="checkbox" className="peer sr-only" checked={isChecked} onChange={() => handleToggleFeature(acc)} />
                      <div className={`rounded-2xl border-2 px-6 py-3 text-[10px] font-black uppercase transition-all 
                        ${isChecked ? "border-emerald-600 bg-emerald-600 text-white shadow-md scale-105" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-emerald-200"}
                      `}>
                        {acc}
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </section>

        {/* SUBMIT */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-slate-100 pt-10 md:flex-row">
          <p className="text-[9px] font-black uppercase italic text-slate-400 max-w-sm">
            * Menyimpan data ini berarti Anda menyatakan informasi di atas adalah benar untuk keperluan riset ketenagakerjaan inklusif.
          </p>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex w-full items-center justify-center gap-3 rounded-[2.5rem] bg-slate-900 px-16 py-6 text-sm font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50 md:w-auto"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {loading ? "MENYIMPAN..." : "SIMPAN & AJUKAN VERIFIKASI"}
          </button>
        </div>
      </form>
    </div>
  );
}