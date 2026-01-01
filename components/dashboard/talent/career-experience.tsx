"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { updateTalentProfile, upsertWorkExperience } from "@/lib/actions/talent";
import { 
  Briefcase, DollarSign, Linkedin, FileText, 
  Plus, Trash2, Save, CheckCircle2, AlertCircle,
  Building2, Calendar, ShieldCheck, BadgeCheck
} from "lucide-react";
import { CAREER_STATUSES, WORK_MODES } from "@/lib/data-static";

interface CareerExperienceProps {
  user: any;
  profile: any;
  onSuccess?: () => void;
}

export default function CareerExperience({ user, profile, onSuccess }: CareerExperienceProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [profileData, setProfileData] = useState({
    bio: profile?.bio || "",
    career_status: profile?.career_status || "",
    work_preference: profile?.work_preference || "",
    linkedin_url: profile?.linkedin_url || "",
    expected_salary: profile?.expected_salary || "",
  });

  const [experiences, setExperiences] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newExp, setNewExp] = useState({
    position: "",
    company_name: "",
    duration: "",
    description: "",
    is_verified: false
  });

  useEffect(() => {
    if (user?.id) fetchExperiences();
  }, [user?.id]);

  async function fetchExperiences() {
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) setExperiences(data);
  }

  const handleAddExperience = async () => {
    if (!newExp.position || !newExp.company_name) {
      setMessage({ type: "error", text: "Posisi dan Perusahaan wajib diisi" });
      return;
    }
    setLoading(true);
    const result = await upsertWorkExperience({
      ...newExp,
      profile_id: user.id,
      is_verified: false // Input manual selalu false
    });
    setLoading(false);

    if (result.success) {
      setNewExp({ position: "", company_name: "", duration: "", description: "", is_verified: false });
      setShowForm(false);
      fetchExperiences();
      setMessage({ type: "success", text: "Pengalaman kerja berhasil ditambahkan!" });
    }
  };

  const handleDeleteExperience = async (id: string, isVerified: boolean) => {
    if (isVerified) {
      alert("Data terverifikasi sistem tidak dapat dihapus.");
      return;
    }
    if (!confirm("Hapus riwayat ini?")) return;

    const { error } = await supabase.from("work_experiences").delete().eq("id", id);
    if (!error) {
      fetchExperiences();
      setMessage({ type: "success", text: "Data berhasil dihapus." });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateTalentProfile(user.id, profileData);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "Profil Karir berhasil disimpan!" });
      if (onSuccess) onSuccess();
    } else {
      setMessage({ type: "error", text: `Gagal: ${result.error}` });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-10 px-4">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-4">
          <Briefcase className="text-blue-600" size={36} />
          {"Karir & Pengalaman"}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">
          {"Sinkronisasi otomatis untuk penempatan kerja via disabilitas.com aktif."}
        </p>
      </header>

      {message.text && (
        <div role="status" aria-live="polite" className={`mb-8 mx-4 p-6 rounded-[2rem] flex items-center gap-4 border-2 ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <p className="text-sm font-black uppercase italic tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8 mb-16">
        <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Status Karir (Wajib)"}</label>
              <select required value={profileData.career_status} onChange={(e) => setProfileData({...profileData, career_status: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 appearance-none">
                <option value="">{"Pilih Status"}</option>
                {CAREER_STATUSES.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Ekspektasi Gaji (Wajib)"}</label>
              <input required type="text" value={profileData.expected_salary} onChange={(e) => setProfileData({...profileData, expected_salary: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Model Kerja (Wajib)"}</label>
              <select required value={profileData.work_preference} onChange={(e) => setProfileData({...profileData, work_preference: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600 appearance-none">
                <option value="">{"Pilih Model"}</option>
                {WORK_MODES.map((m, i) => <option key={i} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"LinkedIn (Opsional)"}</label>
              <input type="url" value={profileData.linkedin_url} onChange={(e) => setProfileData({...profileData, linkedin_url: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold outline-none focus:border-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 px-2">{"Bio Profesional"}</label>
            <textarea rows={4} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-[2rem] font-medium outline-none focus:border-blue-600 italic" />
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100">
              <Save size={16} /> {"Simpan Profil Karir"}
            </button>
          </div>
        </section>
      </form>

      <section className="space-y-8 px-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">{"Riwayat Pekerjaan"}</h2>
          <button onClick={() => setShowForm(!showForm)} className={`p-4 rounded-2xl font-black uppercase text-[10px] border-2 transition-all ${showForm ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white"}`}>
            {showForm ? "Batal" : <><Plus size={18} className="inline mr-2" /> {"Tambah Pekerjaan"}</>}
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-50 border-4 border-dashed border-slate-200 p-10 rounded-[3rem] space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <input placeholder="Posisi" value={newExp.position} onChange={(e) => setNewExp({...newExp, position: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" />
              <input placeholder="Perusahaan" value={newExp.company_name} onChange={(e) => setNewExp({...newExp, company_name: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" />
              <input placeholder="Durasi (e.g. 2020 - 2022)" value={newExp.duration} onChange={(e) => setNewExp({...newExp, duration: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" />
            </div>
            <textarea placeholder="Deskripsi Tugas" value={newExp.description} onChange={(e) => setNewExp({...newExp, description: e.target.value})} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-blue-600" />
            <button onClick={handleAddExperience} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">{"Tambahkan ke Riwayat"}</button>
          </div>
        )}

        <div className="space-y-6">
          {experiences.length === 0 ? (
            <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px]">{"Belum ada riwayat kerja."}</p>
          ) : (
            experiences.map((exp) => (
              <div key={exp.id} className={`bg-white p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row justify-between md:items-center gap-6 transition-all ${exp.is_verified ? "border-emerald-100 bg-emerald-50/30" : "border-slate-100 hover:border-blue-600"}`}>
                <div className="flex gap-6 items-center">
                  <div className={`p-5 rounded-2xl shadow-lg ${exp.is_verified ? "bg-emerald-600 text-white" : "bg-slate-900 text-blue-400"}`}>
                    {exp.is_verified ? <ShieldCheck size={24} /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black uppercase text-slate-900 text-sm">{exp.position}</h4>
                      {exp.is_verified && <BadgeCheck size={16} className="text-emerald-600" />}
                    </div>
                    <p className="text-xs font-bold text-blue-600 uppercase italic">{exp.company_name}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-2">{exp.duration}</p>
                  </div>
                </div>
                {!exp.is_verified ? (
                  <button onClick={() => handleDeleteExperience(exp.id, false)} className="text-red-400 hover:text-red-600 transition-colors p-2"><Trash2 size={20}/></button>
                ) : (
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">{"Sistem Terverifikasi"}</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
