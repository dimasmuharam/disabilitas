"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile } from "@/lib/actions/talent";
import { 
  Award, Cpu, CheckCircle2, AlertCircle, Save, 
  Plus, X, Star, Zap, ExternalLink, BadgeCheck, ShieldCheck
} from "lucide-react";
import { SKILLS_LIST } from "@/lib/data-static";

interface SkillsCertificationsProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function SkillsCertifications({ user, profile, onSuccess }: SkillsCertificationsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // State Keahlian
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState("");

  // State Sertifikasi (Gabungan Manual + Otomatis)
  const [certifications, setCertifications] = useState<any[]>(profile?.certifications || []);
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState({
    name: "",
    issuer: "",
    year: "",
    link: "",
    is_verified: false // Flag untuk input manual
  });

  // EFEEK: Ambil data pelatihan yang LULUS dari tabel 'trainees' secara otomatis
  useEffect(() => {
    const fetchVerifiedCerts = async () => {
      const { data, error } = await supabase
        .from("trainees")
        .select(`
          status,
          trainings (title, updated_at, profiles (full_name))
        `)
        .eq("profile_id", user.id)
        .eq("status", "completed");

      if (data) {
        const autoCerts = data.map(c => ({
          name: c.trainings.title,
          issuer: c.trainings.profiles.full_name,
          year: new Date(c.trainings.updated_at).getFullYear().toString(),
          link: "", // Bisa diarahkan ke URL sertifikat digital nanti
          is_verified: true
        }));

        // Gabungkan dengan yang sudah ada di profil (hindari duplikasi nama)
        setCertifications(prev => {
          const manualOnly = prev.filter(p => !p.is_verified);
          return [...autoCerts, ...manualOnly];
        });
      }
    };

    fetchVerifiedCerts();
  }, [user.id]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddCert = () => {
    if (newCert.name && newCert.issuer) {
      setCertifications([...certifications, { ...newCert, is_verified: false }]);
      setNewCert({ name: "", issuer: "", year: "", link: "", is_verified: false });
      setShowCertForm(false);
    }
  };

  const removeCert = (index: number) => {
    // Hanya boleh hapus yang tidak terverifikasi
    if (certifications[index].is_verified) {
      alert("Sertifikat resmi sistem tidak dapat dihapus manual.");
      return;
    }
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await updateTalentProfile(user.id, {
      skills,
      certifications
    });
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Data Kompetensi & Sertifikasi Berhasil Disinkronkan!" });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: `Gagal: ${result.error}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <Award className="text-purple-600" size={36} />
          {"Keahlian & Sertifikat"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
          {"Verifikasi kompetensi otomatis dari pelatihan disabilitas.com dan input mandiri."}
        </p>
      </header>

      {/* NOTIFIKASI */}
      {message.text && (
        <div role="status" aria-live="polite" className={`mb-8 mx-4 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      <div className="space-y-12">
        {/* SEKSI 1: SKILLS */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <Cpu className="text-purple-600" size={20} />
            <h3 className="text-xs font-black uppercase tracking-[0.2em]">{"Manajemen Keahlian"}</h3>
          </div>
          <form onSubmit={handleAddSkill} className="flex gap-4">
            <input 
              type="text" list="skill-suggestions"
              placeholder="Ketik keahlian Anda..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-purple-600 transition-all"
            />
            <datalist id="skill-suggestions">
              {SKILL_CATEGORIES.map((cat: any) => cat.skills.map((s: string) => <option key={s} value={s} />))}
            </datalist>
            <button type="submit" className="bg-purple-600 text-white px-8 rounded-2xl hover:bg-slate-900 transition-all shadow-lg shadow-purple-100">
              <Plus size={24} />
            </button>
          </form>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <div key={skill} className="bg-slate-900 border-2 border-slate-800 px-5 py-2 rounded-xl flex items-center gap-3 group">
                <span className="text-[10px] font-black uppercase text-white tracking-wider">{skill}</span>
                <button onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400"><X size={14} /></button>
              </div>
            ))}
          </div>
        </section>

        {/* SEKSI 2: SERTIFIKASI (OFFICIAL VS MANUAL) */}
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-amber-600">
              <Star size={20} fill="currentColor" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">{"Daftar Sertifikasi"}</h3>
            </div>
            <button 
              onClick={() => setShowCertForm(!showCertForm)}
              className="text-[10px] font-black uppercase bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border-2 border-slate-100 hover:bg-blue-600 hover:text-white transition-all"
            >
              {showCertForm ? "Batal" : "Input Mandiri"}
            </button>
          </div>

          {showCertForm && (
            <div className="bg-blue-50/50 p-8 rounded-[2rem] border-2 border-dashed border-blue-200 space-y-6 animate-in fade-in zoom-in-95">
              <div className="grid md:grid-cols-2 gap-6">
                <input placeholder="Nama Sertifikat" value={newCert.name} onChange={(e) => setNewCert({...newCert, name: e.target.value})} className="p-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none font-bold" />
                <input placeholder="Penerbit" value={newCert.issuer} onChange={(e) => setNewCert({...newCert, issuer: e.target.value})} className="p-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none font-bold" />
                <input placeholder="Tahun" value={newCert.year} onChange={(e) => setNewCert({...newCert, year: e.target.value})} className="p-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none font-bold" />
                <input placeholder="Link (Opsional)" value={newCert.link} onChange={(e) => setNewCert({...newCert, link: e.target.value})} className="p-4 rounded-xl border-2 border-white focus:border-blue-500 outline-none font-bold" />
              </div>
              <button onClick={handleAddCert} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">{"Simpan Draft Sertifikat"}</button>
            </div>
          )}

          <div className="grid gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all ${
                cert.is_verified ? "bg-emerald-50/50 border-emerald-100 shadow-sm" : "bg-slate-50 border-slate-100"
              }`}>
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl ${cert.is_verified ? "bg-emerald-600 text-white" : "bg-white text-slate-400 shadow-sm"}`}>
                    {cert.is_verified ? <ShieldCheck size={24} /> : <Award size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black uppercase text-slate-900 text-sm leading-tight">{cert.name}</h4>
                      {cert.is_verified && <BadgeCheck size={16} className="text-emerald-600" />}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                      {cert.issuer} • {cert.year} {cert.is_verified && <span className="text-emerald-600 ml-1">{"(Official Partner)"}</span>}
                    </p>
                  </div>
                </div>
                {!cert.is_verified && (
                  <button onClick={() => removeCert(i)} className="p-3 text-slate-300 hover:text-red-500"><X size={18} /></button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FINAL SAVE */}
        <div className="flex justify-end pt-6 px-4">
          <button 
            onClick={handleSubmit} disabled={loading}
            className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-4 hover:bg-purple-600 transition-all shadow-2xl"
          >
            {loading ? "Sinkronisasi..." : <><Zap size={20} /> {"Simpan Perubahan"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
