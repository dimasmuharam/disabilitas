"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, BookOpen, Calendar, MapPin, 
  ChevronRight, Trash2, Edit3, Globe,
  CheckCircle2, AlertTriangle, X
} from "lucide-react";
import { DISABILITY_TYPES, SKILLS_LIST } from "@/lib/data-static";

interface ProgramManagerProps {
  partnerId: string;
  onBack: () => void;
}

export default function ProgramManager({ partnerId, onBack }: ProgramManagerProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    syllabus: "",
    category: "Pelatihan Keahlian",
    target_disability: [] as string[],
    provided_skills: [] as string[],
    start_date: "",
    end_date: "",
    location: "Online / Remote",
    is_published: true
  });

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("trainings")
      .select("*")
      .eq("partner_id", partnerId)
      .order("created_at", { ascending: false });
    
    if (data) setPrograms(data);
    setLoading(false);
  }, [partnerId]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("trainings")
      .insert([{ ...formData, partner_id: partnerId }]);

    if (!error) {
      setIsAdding(false);
      fetchPrograms();
      // Reset Form
      setFormData({
        title: "", description: "", syllabus: "", category: "Pelatihan Keahlian",
        target_disability: [], provided_skills: [], start_date: "", end_date: "",
        location: "Online / Remote", is_published: true
      });
    }
  }

  return (
    <div className="space-y-8 duration-500 animate-in fade-in">
      {/* HEADER MODUL */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Kelola Program Pelatihan</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Publikasikan program pengembangan SDM inklusif Anda</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase text-white shadow-lg transition-all hover:bg-blue-600"
          >
            <Plus size={16} /> Buat Program Baru
          </button>
        )}
      </div>

      {isAdding ? (
        /* FORM TAMBAH PROGRAM */
        <form onSubmit={handleSubmit} className="space-y-8 rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-2xl shadow-slate-100">
          <div className="flex items-center justify-between border-b pb-6">
            <h3 className="text-lg font-black uppercase italic text-blue-600">Formulir Program Baru</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400 transition-colors hover:text-red-500">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Kolom Kiri: Informasi Dasar */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Judul Program</label>
                <input 
                  required
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                  placeholder="Contoh: Pelatihan Digital Marketing Inklusif"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Mulai</label>
                  <input 
                    type="date" required
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Selesai</label>
                  <input 
                    type="date" required
                    className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lokasi / Link Pertemuan</label>
                <input 
                  className="w-full rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 font-bold"
                  placeholder="Contoh: Zoom / Alamat Kantor"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* Kolom Kanan: Target & Skills */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Ragam Disabilitas</label>
                <div className="no-scrollbar grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-2xl border-2 border-slate-50 bg-slate-50 p-4">
                  {DISABILITY_TYPES.map(type => (
                    <label key={type} className="flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase text-slate-600 hover:text-slate-900">
                      <input 
                        type="checkbox"
                        checked={formData.target_disability.includes(type)}
                        onChange={(e) => {
                          const val = e.target.checked 
                            ? [...formData.target_disability, type]
                            : formData.target_disability.filter(t => t !== type);
                          setFormData({...formData, target_disability: val});
                        }}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skill yang Akan Didapat</label>
                <div className="flex flex-wrap gap-2 rounded-2xl border-2 border-slate-50 bg-slate-50 p-4">
                  {SKILLS_LIST.slice(0, 10).map(skill => (
                    <button
                      key={skill} type="button"
                      onClick={() => {
                        const val = formData.provided_skills.includes(skill)
                          ? formData.provided_skills.filter(s => s !== skill)
                          : [...formData.provided_skills, skill];
                        setFormData({...formData, provided_skills: val});
                      }}
                      className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase transition-all ${
                        formData.provided_skills.includes(skill) ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deskripsi & Silabus Singkat</label>
            <textarea 
              rows={4}
              className="w-full rounded-[2rem] border-2 border-slate-50 bg-slate-50 p-6 font-medium text-slate-700 outline-none"
              placeholder="Jelaskan apa yang akan dipelajari dan manfaat program ini..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full rounded-[2rem] bg-blue-600 py-5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 transition-all hover:bg-slate-900">
            Publikasikan Program Sekarang
          </button>
        </form>
      ) : (
        /* DAFTAR PROGRAM YANG ADA */
        <div className="grid grid-cols-1 gap-4">
          {programs.length > 0 ? programs.map((prog) => (
            <div key={prog.id} className="group flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-2 border-slate-50 bg-white p-6 transition-all hover:border-slate-200 md:flex-row">
              <div className="flex items-center gap-6">
                <div className="rounded-3xl bg-slate-100 p-4 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase italic leading-tight tracking-tighter text-slate-900">{prog.title}</h4>
                  <div className="mt-1 flex flex-wrap gap-4">
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400"><Calendar size={12}/> {prog.start_date} - {prog.end_date}</span>
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400"><MapPin size={12}/> {prog.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="rounded-full bg-slate-50 p-3 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900">
                  <Edit3 size={18} />
                </button>
                <button className="rounded-full bg-slate-50 p-3 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
                <button className="ml-4 flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                  Detail Pendaftar <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-[4rem] border-4 border-dashed border-slate-100 p-20 text-center">
              <p className="font-black uppercase italic tracking-tighter text-slate-300">Belum ada program pelatihan yang dibuat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
