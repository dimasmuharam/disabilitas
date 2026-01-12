"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Microscope, Link as LinkIcon, Search, ChevronDown
} from "lucide-react";

import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES_LIST, 
  TRAINING_PARTNERS, 
  NONPROFIT_ORG_LIST,
  UNIVERSITIES,
  SKILL_ACQUISITION_METHODS,
  TRAINING_ACCESSIBILITY_SCORES,
  SKILL_IMPACT_LEVELS,
  TRAINING_ORGANIZER_CATEGORIES
} from "@/lib/data-static";

interface SkillsCertificationsProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function SkillsCertifications({ user, profile, onSuccess }: SkillsCertificationsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [globalSkills, setGlobalSkills] = useState<string[]>(profile?.skills || []);
  const [certs, setCerts] = useState<any[]>([]);

  // State untuk search di ComboBox Skill Utama
  const [skillSearch, setSkillSearch] = useState("");

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data } = await supabase
          .from("certifications")
          .select("*")
          .eq("profile_id", user.id)
          .order("year", { ascending: false });
        if (data) setCerts(data);
      } catch (err) {
        console.error("Error load data:", err);
      }
    };
    if (user?.id) fetchCerts();
  }, [user.id]);

  const addCertsItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      name: "",
      organizer_category: "",
      organizer_name: "",
      manual_organizer: "",
      year: new Date().getFullYear().toString(),
      certificate_url: "",
      is_verified: false
    };
    setCerts([newItem, ...certs]);
  };

  const updateCertField = (id: string, field: string, value: any) => {
    setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCert = async (id: string) => {
    if (id.toString().startsWith("temp-")) {
      setCerts(certs.filter(c => c.id !== id));
      return;
    }
    if (!confirm("Hapus riwayat pelatihan ini?")) return;
    const { error } = await supabase.from("certifications").delete().eq("id", id);
    if (!error) setCerts(certs.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await updateTalentProfile(user.id, { 
        skills: globalSkills,
        skill_acquisition_method: profile.skill_acquisition_method,
        training_accessibility_rating: profile.training_accessibility_rating,
        skill_impact_rating: profile.skill_impact_rating
      });

      for (const cert of certs) {
        const isTemp = cert.id.toString().startsWith("temp-");
        const finalName = cert.organizer_name === "LAINNYA" ? cert.manual_organizer : cert.organizer_name;
        
        // Simpan log jika manual
        if (cert.organizer_name === "LAINNYA" && cert.manual_organizer) {
          await supabase.from("manual_input_logs").insert([{
            field_name: "organizer_name",
            input_value: cert.manual_organizer
          }]);
        }

        const { id, manual_organizer, ...certData } = cert;
        const payload = { ...certData, organizer_name: finalName, profile_id: user.id };

        if (isTemp) {
          await supabase.from("certifications").insert([payload]);
        } else {
          await supabase.from("certifications").update(payload).eq("id", id);
        }
      }

      setMessage({ type: "success", text: "Data Berhasil Disinkronisasi ke Riset Nasional!" });
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: `Gagal: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Logika Filter untuk ComboBox
  const getFilteredOptions = (category: string, search: string) => {
    let baseList: string[] = [];
    if (category === "Pemerintah") baseList = GOVERNMENT_AGENCIES_LIST;
    else if (category === "Perguruan Tinggi") baseList = UNIVERSITIES;
    else if (category === "Mitra Pelatihan (LKP/LPK)") baseList = TRAINING_PARTNERS;
    else if (category === "Organisasi / Komunitas Disabilitas") baseList = NONPROFIT_ORG_LIST;

    const filtered = baseList.filter(item => 
      item.toLowerCase().includes(search.toLowerCase())
    );
    return [...filtered, "LAINNYA"];
  };

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      <div className="sr-only" aria-live="assertive">{message.text}</div>

      <header className="mb-10 px-4 text-left">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <Zap className="text-purple-600" size={36} /> Keahlian & Pelatihan
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Gunakan daftar baku untuk sinkronisasi data alumni dan mitra
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        
        {/* SKILLS UTAMA DENGAN SEARCHABLE COMBOBOX */}
        <section className="space-y-6 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm text-left">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Daftar Keahlian Utama</h2>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="skill-search" className="ml-2 text-[10px] font-black uppercase text-slate-400">Cari & Pilih Keahlian</label>
              <div className="relative mt-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  id="skill-search"
                  type="text"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded="false"
                  aria-haspopup="listbox"
                  placeholder="Ketik keahlian (contoh: Desain, Web...)"
                  className="w-full rounded-2xl bg-slate-50 p-4 pl-12 font-bold outline-none border-2 border-transparent focus:border-purple-600"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
              </div>
              
              {skillSearch && (
                <ul role="listbox" className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-2xl border-2 border-slate-100 bg-white shadow-2xl">
                  {SKILLS_LIST.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase())).map(skill => (
                    <li 
                      key={skill}
                      role="option"
                      onClick={() => {
                        if (!globalSkills.includes(skill)) setGlobalSkills([...globalSkills, skill]);
                        setSkillSearch("");
                      }}
                      className="cursor-pointer p-4 text-sm font-bold hover:bg-purple-50 hover:text-purple-600"
                    >
                      {skill}
                    </li>
                  ))}
                  <li 
                    onClick={() => {
                      if (!globalSkills.includes(skillSearch)) setGlobalSkills([...globalSkills, skillSearch]);
                      setSkillSearch("");
                    }}
                    className="cursor-pointer p-4 text-sm font-black italic text-blue-600 hover:bg-blue-50"
                  >
                    + Tambahkan "{skillSearch}" (Input Manual)
                  </li>
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2" role="list" aria-label="Keahlian yang dipilih">
              {globalSkills.map(s => (
                <span key={s} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white shadow-md">
                  {s}
                  <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`Hapus ${s}`}>
                    <X size={14}/>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* RIWAYAT PELATIHAN */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} /> Riwayat Sertifikasi
            </h2>
            <button type="button" onClick={addCertsItem} className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl">
              <Plus size={16} /> Tambah Pelatihan
            </button>
          </div>

          <div className="space-y-8">
            {certs.map((cert, index) => (
              <section key={cert.id} className="relative space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-left shadow-sm animate-in slide-in-from-top-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <span className="text-[10px] font-black uppercase text-slate-300 italic">Item Pelatihan #{certs.length - index}</span>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-600"><Trash2 size={20} /></button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Judul Program</label>
                    <input 
                      value={cert.name}
                      onChange={(e) => updateCertField(cert.id, "name", e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 p-4 font-bold border-2 border-transparent focus:border-blue-600 outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Kategori Penyelenggara</label>
                    <select 
                      value={cert.organizer_category}
                      onChange={(e) => {
                        updateCertField(cert.id, "organizer_category", e.target.value);
                        updateCertField(cert.id, "organizer_name", "");
                      }}
                      className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none"
                    >
                      <option value="">Pilih Kategori</option>
                      {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Institusi Penyelenggara (Daftar Baku)</label>
                    <div className="relative mt-1">
                      <select 
                        disabled={!cert.organizer_category}
                        value={cert.organizer_name}
                        onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)}
                        className="w-full rounded-2xl bg-slate-50 p-4 font-bold outline-none border-2 border-transparent focus:border-blue-600 disabled:opacity-50 appearance-none"
                      >
                        <option value="">-- Cari & Pilih dari Daftar Resmi --</option>
                        {getFilteredOptions(cert.organizer_category, "").map(inst => (
                          <option key={inst} value={inst}>{inst === "LAINNYA" ? "+ INSTITUSI TIDAK TERDAFTAR (INPUT MANUAL)" : inst}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>

                  {cert.organizer_name === "LAINNYA" && (
                    <div className="md:col-span-2 space-y-2 animate-in zoom-in-95">
                      <label className="ml-2 text-[10px] font-black uppercase text-pink-600 italic">Nama Institusi Baru (Mohon tulis lengkap tanpa singkatan)</label>
                      <input 
                        value={cert.manual_organizer}
                        onChange={(e) => updateCertField(cert.id, "manual_organizer", e.target.value)}
                        className="w-full rounded-2xl bg-pink-50 p-4 font-bold border-2 border-pink-200 outline-none"
                        placeholder="Contoh: LPK Maju Terus Pantang Mundur"
                      />
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? "Menyimpan Data Riset..." : <><Save size={20} /> Simpan Seluruh Keahlian & Pelatihan</>}
        </button>
      </form>
    </div>
  );
}
