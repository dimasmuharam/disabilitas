"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Microscope, Link as LinkIcon, ChevronDown, BadgeCheck
} from "lucide-react";

import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES_LIST, 
  TRAINING_PARTNERS, 
  NONPROFIT_ORG_LIST,
  UNIVERSITIES,
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
  const [selectedSkillFromList, setSelectedSkillFromList] = useState("");
  
  const certNameRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const orgNameRefs = useRef<Record<string, HTMLSelectElement | null>>({});

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

  const addSkill = (skillName: string) => {
    if (skillName && !globalSkills.includes(skillName)) {
      setGlobalSkills([...globalSkills, skillName]);
      setSelectedSkillFromList("");
      setMessage({ type: "success", text: `Keahlian ${skillName} ditambahkan` });
    }
  };

  const addCertsItem = () => {
    const newId = `temp-${Date.now()}`;
    const newItem = {
      id: newId,
      name: "",
      organizer_category: "",
      organizer_name: "",
      manual_organizer: "",
      year: new Date().getFullYear().toString(),
      certificate_url: "",
      is_verified: false
    };
    setCerts([newItem, ...certs]);
    setTimeout(() => {
      certNameRefs.current[newId]?.focus();
    }, 100);
  };

  const updateCertField = (id: string, field: string, value: any) => {
    setCerts(certs.map(c => c.id === id ? { ...c, [field]: value } : c));
    
    if (field === "organizer_category" && value !== "") {
      setTimeout(() => {
        orgNameRefs.current[id]?.focus();
      }, 100);
    }
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
        skill_acquisition_method: profile?.skill_acquisition_method,
        training_accessibility_rating: profile?.training_accessibility_rating,
        skill_impact_rating: profile?.skill_impact_rating
      });

      for (const cert of certs) {
        const isTemp = cert.id.toString().startsWith("temp-");
        const finalName = cert.organizer_name === "LAINNYA" ? cert.manual_organizer : cert.organizer_name;
        
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

      setMessage({ type: "success", text: "Data Berhasil Disimpan!" });
      if (onSuccess) setTimeout(onSuccess, 1500);
    } catch (error: any) {
      setMessage({ type: "error", text: `Gagal: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionList = (category: string) => {
    let baseList: string[] = [];
    if (category === "Pemerintah") baseList = GOVERNMENT_AGENCIES_LIST;
    else if (category === "Perguruan Tinggi") baseList = UNIVERSITIES;
    else if (category === "Mitra Pelatihan (LKP/LPK)") baseList = TRAINING_PARTNERS;
    else if (category === "Organisasi / Komunitas Disabilitas") baseList = NONPROFIT_ORG_LIST;
    return [...baseList, "LAINNYA"];
  };return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      <div className="sr-only" aria-live="assertive">{message.text}</div>

      <header className="mb-10 px-4 text-left">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <Zap className="text-purple-600" size={36} /> Keahlian & Pelatihan
        </h1>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Sinkronisasi data riwayat pelatihan untuk validasi riset
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-left shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Daftar Keahlian Utama</h2>
          </div>
          
          <div className="space-y-4">
            <label htmlFor="skill-select" className="ml-2 text-[10px] font-black uppercase italic text-slate-400">Pilih keahlian yang Anda kuasai</label>
            <div className="flex gap-3">
              <select 
                id="skill-select"
                className="flex-1 rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-purple-600"
                value={selectedSkillFromList}
                onChange={(e) => setSelectedSkillFromList(e.target.value)}
              >
                <option value="">-- Lihat Daftar Keahlian --</option>
                {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button 
                type="button"
                onClick={() => addSkill(selectedSkillFromList)}
                className="rounded-2xl bg-purple-600 px-8 text-white transition-all hover:bg-slate-900"
                aria-label="Klik untuk tambahkan keahlian yang dipilih"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2" role="list" aria-label="Daftar keahlian saya">
              {globalSkills.map(s => (
                <span key={s} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white shadow-md">
                  {s}
                  <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))} aria-label={`Hapus keahlian ${s}`}>
                    <X size={14}/>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} /> Riwayat Sertifikasi
            </h2>
            <button 
              type="button" 
              onClick={addCertsItem} 
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900"
            >
              <Plus size={16} /> Tambah Data Baru
            </button>
          </div>

          <div className="space-y-10">
            {certs.map((cert, index) => (
              <section 
                key={cert.id} 
                className="relative rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-left shadow-sm space-y-8 animate-in slide-in-from-top-4"
                aria-label={`Formulir pelatihan nomor ${certs.length - index}`}
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase italic text-slate-300">Data #{certs.length - index}</span>
                    {cert.is_verified && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600">
                        <BadgeCheck size={12} /> Terverifikasi
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 transition-colors hover:text-red-600" aria-label={`Hapus data pelatihan nomor ${certs.length - index}`}><Trash2 size={20} /></button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor={`name-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">Judul Pelatihan</label>
                    <input 
                      ref={(el) => { certNameRefs.current[cert.id] = el; }}
                      id={`name-${cert.id}`}
                      value={cert.name}
                      onChange={(e) => updateCertField(cert.id, "name", e.target.value)}
                      placeholder="Contoh: Pelatihan Administrasi Perkantoran"
                      className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`year-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun</label>
                    <input 
                      id={`year-${cert.id}`}
                      type="number"
                      value={cert.year}
                      onChange={(e) => updateCertField(cert.id, "year", e.target.value)}
                      className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`cat-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">Kategori Institusi</label>
                    <select 
                      id={`cat-${cert.id}`}
                      value={cert.organizer_category}
                      onChange={(e) => updateCertField(cert.id, "organizer_category", e.target.value)}
                      className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {TRAINING_ORGANIZER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`org-${cert.id}`} className="ml-2 text-[10px] font-black uppercase text-slate-400">Nama Institusi Resmi</label>
                    <div className="relative">
                      <select 
                        ref={(el) => { orgNameRefs.current[cert.id] = el; }}
                        id={`org-${cert.id}`}
                        disabled={!cert.organizer_category}
                        value={cert.organizer_name}
                        onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)}
                        className="w-full appearance-none rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600 disabled:opacity-50"
                      >
                        <option value="">-- Pilih Nama Institusi --</option>
                        {getInstitutionList(cert.organizer_category).map(inst => (
                          <option key={inst} value={inst}>{inst === "LAINNYA" ? "+ INSTITUSI TIDAK TERDAFTAR" : inst}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 text-slate-400 -translate-y-1/2" size={18} />
                    </div>
                  </div>

                  {cert.organizer_name === "LAINNYA" && (
                    <div className="space-y-2 md:col-span-2 animate-in zoom-in-95">
                      <label htmlFor={`manual-${cert.id}`} className="ml-2 text-[10px] font-black uppercase italic text-pink-600">Input Manual Nama Institusi</label>
                      <input 
                        id={`manual-${cert.id}`}
                        value={cert.manual_organizer}
                        onChange={(e) => updateCertField(cert.id, "manual_organizer", e.target.value)}
                        className="w-full rounded-2xl border-2 border-pink-200 bg-pink-50 p-4 font-bold outline-none focus:border-pink-600"
                        placeholder="Ketik nama lengkap institusi..."
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor={`url-${cert.id}`} className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      <LinkIcon size={12} /> Tautan Sertifikat (Opsional)
                    </label>
                    <input 
                      id={`url-${cert.id}`}
                      type="url"
                      value={cert.certificate_url}
                      onChange={(e) => updateCertField(cert.id, "certificate_url", e.target.value)}
                      placeholder="https://link-bukti-pelatihan.com"
                      className="w-full rounded-2xl border-2 border-transparent bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    />
                  </div>
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
          {loading ? "Menyimpan Data..." : <><Save size={20} /> Simpan Seluruh Keahlian & Pelatihan</>}
        </button>
      </form>
    </div>
  );
}
