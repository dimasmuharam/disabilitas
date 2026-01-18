"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { GOV_INSTANSI_CATEGORIES } from "@/lib/data-static";
import { 
  Building2, MapPin, Search, Save, 
  Loader2, Globe, MessageSquare, Info,
  CheckCircle2, AlertCircle, X
} from "lucide-react";

interface GovProfileEditorProps {
  user: any;
}

export default function GovProfileEditor({ user }: GovProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: "", type: null });
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [regionResults, setRegionResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "ULD Ketenagakerjaan Kota/Kabupaten",
    description: "",
    location: "",
    location_id: "",
    whatsapp_official: "",
    official_seal_url: "",
    email: user?.email || ""
  });

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("government")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setFormData(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setFetching(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchProfile();
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setRegionResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchProfile]);

  const notify = (msg: string, type: 'success' | 'error') => {
    setMessage({ msg, type });
    setTimeout(() => setMessage({ msg: "", type: null }), 5000);
  };

  // Logika Pencarian Wilayah ke Database
  const handleSearchRegion = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setRegionResults([]);
      return;
    }

    setIsSearching(true);
    const isProvCategory = formData.category.includes("Provinsi");
    
    try {
      let dbQuery = supabase
        .from("regions")
        .select("id, name, type")
        .ilike("name", `%${query}%`);

      // Filter berdasarkan tipe wilayah agar tidak salah input
      if (isProvCategory) {
        dbQuery = dbQuery.eq("type", "PROVINCE");
      } else if (formData.category.includes("Kota")) {
        dbQuery = dbQuery.eq("type", "CITY");
      }

      const { data, error } = await dbQuery.limit(6);
      if (error) throw error;
      setRegionResults(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location_id) return notify("Harap pilih wilayah otoritas dari daftar", "error");

    setLoading(true);
    try {
      const { error } = await supabase
        .from("government")
        .upsert({
          id: user.id,
          ...formData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      notify("Profil Otoritas Berhasil Diperbarui", "success");
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex h-64 flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Data Otoritas...</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-10 duration-700 animate-in fade-in slide-in-from-bottom-4">
      
      {/* NOTIFIKASI */}
      {message.msg && (
        <div className={`fixed bottom-10 right-10 z-[60] flex items-center gap-3 rounded-2xl border-4 border-slate-900 px-6 py-4 font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.msg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-10">
        
        {/* SECTION 1: PENETAPAN OTORITAS WILAYAH */}
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-4">
            <MapPin className="text-blue-600" size={28} />
            <div>
              <h3 className="text-xl font-black uppercase italic tracking-tight">Cakupan Wilayah Kerja</h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Identitas administratif instansi pemerintah</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Kategori Level */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level Otoritas</label>
              <select 
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value, location: "", location_id: "" });
                  setSearchQuery("");
                }}
                className="w-full rounded-2xl border-4 border-slate-900 bg-slate-50 p-4 font-bold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                {GOV_INSTANSI_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Pencarian Wilayah Berbasis Database */}
            <div className="relative space-y-2" ref={searchRef}>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cari Wilayah (Input Minimal 2 Karakter)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder={formData.location || "Ketik nama kota/provinsi..."}
                  value={searchQuery}
                  onChange={(e) => handleSearchRegion(e.target.value)}
                  className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none transition-all focus:ring-4 focus:ring-blue-100"
                />
                {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-600" size={18} />}
              </div>

              {/* Dropdown Hasil Pencarian */}
              {regionResults.length > 0 && (
                <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border-4 border-slate-900 bg-white shadow-2xl duration-200 animate-in zoom-in-95">
                  {regionResults.map(region => (
                    <li 
                      key={region.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          location: region.name,
                          location_id: region.id,
                          name: `${formData.category} ${region.name}`
                        });
                        setSearchQuery("");
                        setRegionResults([]);
                      }}
                      className="group flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-slate-900"
                    >
                      <span className="font-black uppercase italic group-hover:text-white">{region.name}</span>
                      <span className="text-[9px] font-bold uppercase text-slate-400 group-hover:text-blue-400">{region.type}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Preview Nama Otomatis */}
          <div className="mt-8 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-6">
            <div className="mb-2 flex items-center gap-3 text-blue-700">
              <Building2 size={16} />
              <p className="text-[10px] font-black uppercase italic tracking-tighter">Nama Instansi Yang Akan Terdaftar:</p>
            </div>
            <p className="text-lg font-black uppercase text-slate-900">
              {formData.name || "Menunggu Pilihan Wilayah..."}
            </p>
          </div>
        </section>

        {/* SECTION 2: KONTAK & PUBLIKASI */}
        <section className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          <div className="mb-8 flex items-center gap-4 border-b-2 border-slate-100 pb-4">
            <Globe className="text-emerald-600" size={28} />
            <h3 className="text-xl font-black uppercase italic tracking-tight">Atribut Operasional</h3>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">WhatsApp Official (Gunakan 62)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={formData.whatsapp_official || ""} 
                  onChange={e => setFormData({...formData, whatsapp_official: e.target.value})}
                  placeholder="62812345678"
                  className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-emerald-50" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">URL Logo Resmi (.png / .jpg)</label>
              <input 
                type="text" 
                value={formData.official_seal_url || ""} 
                onChange={e => setFormData({...formData, official_seal_url: e.target.value})}
                placeholder="https://..."
                className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-emerald-50" 
              />
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deskripsi / Komitmen Inklusi</label>
            <textarea 
              value={formData.description || ""} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              rows={4}
              className="w-full rounded-2xl border-4 border-slate-900 p-4 font-bold outline-none focus:ring-4 focus:ring-emerald-50"
              placeholder="Tuliskan misi instansi Anda dalam mendukung penyerapan tenaga kerja disabilitas..."
            />
          </div>
        </section>

        {/* SAVE BUTTON */}
        <button 
          type="submit" 
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-4 rounded-[2rem] border-4 border-slate-900 bg-slate-900 py-6 text-xl font-black uppercase italic text-white shadow-[10px_10px_0px_0px_rgba(59,130,246,1)] transition-all hover:bg-blue-600 hover:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
          <span>Simpan Data Profil Otoritas</span>
        </button>

      </form>
    </div>
  );
}