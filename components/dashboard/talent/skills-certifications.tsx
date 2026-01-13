"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Zap, Trash2, Link as LinkIcon, ChevronDown, BadgeCheck
} from "lucide-react";

import { 
  SKILLS_LIST, 
  GOVERNMENT_AGENCIES_LIST, 
  TRAINING_PARTNERS, 
  NONPROFIT_ORG_LIST,
  UNIVERSITIES
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

  // Menggabungkan semua institusi untuk pencarian yang rapi
  const ALL_INSTITUTIONS = [
    ...TRAINING_PARTNERS,
    ...UNIVERSITIES,
    ...GOVERNMENT_AGENCIES_LIST,
    ...NONPROFIT_ORG_LIST
  ].sort();

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
      // 1. Update Profile (Skills)
      await updateTalentProfile(user.id, { 
        skills: globalSkills
      });

      // 2. Update/Insert Certifications
      for (const cert of certs) {
        const isTemp = cert.id.toString().startsWith("temp-");
        const finalName = cert.organizer_name === "LAINNYA" ? cert.manual_organizer : cert.organizer_name;
        
        // Log manual input untuk dashboard super admin
        if (cert.organizer_name === "LAINNYA" && cert.manual_organizer) {
          await supabase.from("manual_input_logs").insert([{
            field_name: "organizer_name",
            input_value: cert.manual_organizer
          }]);
        }

        const { id, manual_organizer, ...certData } = cert;
        // Jangan sertakan organizer_category karena sudah tidak ada di table
        const payload = { 
          name: certData.name,
          organizer_name: finalName,
          year: certData.year,
          certificate_url: certData.certificate_url,
          profile_id: user.id 
        };

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

  return (
    <div className="mx-auto max-w-4xl pb-20 text-slate-900">
      <header className="mb-10 px-4 text-left">
        <h1 className="flex items-center gap-4 text-4xl font-black uppercase italic tracking-tighter">
          <Zap className="text-purple-600" size={36} /> Keahlian & Pelatihan
        </h1>
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sinkronisasi data riwayat pelatihan untuk validasi riset
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12 px-4">
        {/* SECTION SKILLS */}
        <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-6">
          <div className="flex items-center gap-3 text-purple-600">
            <Cpu size={24} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Daftar Keahlian Utama</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <select 
                id="skill-select"
                className="flex-1 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-purple-600"
                value={selectedSkillFromList}
                onChange={(e) => setSelectedSkillFromList(e.target.value)}
              >
                <option value="">-- Pilih Keahlian --</option>
                {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button 
                type="button"
                onClick={() => addSkill(selectedSkillFromList)}
                className="rounded-2xl bg-purple-600 px-8 text-white transition-all hover:bg-slate-900"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {globalSkills.map(s => (
                <span key={s} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white">
                  {s}
                  <button type="button" onClick={() => setGlobalSkills(globalSkills.filter(x => x !== s))}>
                    <X size={14}/>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION CERTIFICATIONS */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="text-amber-500" size={20} /> Riwayat Pelatihan & Sertifikasi
            </h2>
            <button 
              type="button" 
              onClick={addCertsItem} 
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-xl hover:bg-slate-900 transition-all"
            >
              <Plus size={16} /> Tambah Pelatihan
            </button>
          </div>

          <div className="space-y-10">
            {certs.map((cert, index) => (
              <section 
                key={cert.id} 
                className="relative rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8 animate-in slide-in-from-top-4"
              >
                <div className="flex items-center justify-between border-b-2 border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase italic text-slate-300 italic">Data #{certs.length - index}</span>
                    {cert.is_verified && (
                      <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600">
                        <BadgeCheck size={12} /> Verified by Platform
                      </span>
                    )}
                  </div>
                  <button type="button" onClick={() => removeCert(cert.id)} className="text-slate-300 hover:text-red-600 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Judul Pelatihan / Sertifikasi</label>
                    <input 
                      ref={(el) => { certNameRefs.current[cert.id] = el; }}
                      value={cert.name}
                      onChange={(e) => updateCertField(cert.id, "name", e.target.value)}
                      placeholder="Contoh: Digital Marketing Specialist"
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Pilih Penyelenggara (Daftar Resmi)</label>
                    <div className="relative">
                      <select 
                        value={cert.organizer_name}
                        onChange={(e) => updateCertField(cert.id, "organizer_name", e.target.value)}
                        className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                      >
                        <option value="">-- Pilih Penyelenggara --</option>
                        {ALL_INSTITUTIONS.map(inst => (
                          <option key={inst} value={inst}>{inst}</option>
                        ))}
                        <option value="LAINNYA" className="text-blue-600 font-black italic">+ LEMBAGA TIDAK TERDAFTAR</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-2 text-[10px] font-black uppercase text-slate-400">Tahun Lulus</label>
                    <input 
                      type="number"
                      value={cert.year}
                      onChange={(e) => updateCertField(cert.id, "year", e.target.value)}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    />
                  </div>

                  {cert.organizer_name === "LAINNYA" && (
                    <div className="space-y-2 md:col-span-2 animate-in zoom-in-95">
                      <label className="ml-2 text-[10px] font-black uppercase italic text-blue-600">Input Nama Lembaga Baru</label>
                      <input 
                        value={cert.manual_organizer}
                        onChange={(e) => updateCertField(cert.id, "manual_organizer", e.target.value)}
                        className="w-full rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 font-bold outline-none focus:border-blue-600"
                        placeholder="Masukkan nama lengkap lembaga penyelenggara..."
                      />
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <label className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      <LinkIcon size={12} /> Tautan Sertifikat (Cloud / Google Drive)
                    </label>
                    <input 
                      type="url"
                      value={cert.certificate_url}
                      onChange={(e) => updateCertField(cert.id, "certificate_url", e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        {message.text && (
          <div className={`rounded-2xl border-2 p-4 text-center text-[10px] font-black uppercase animate-in zoom-in-95 ${message.type === 'success' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="flex w-full items-center justify-center gap-4 rounded-[2.5rem] bg-slate-900 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Menyinkronkan Data..." : <><Save size={20} /> Simpan Seluruh Riwayat & Keahlian</>}
        </button>
      </form>
    </div>
  );
}
