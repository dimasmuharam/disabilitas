"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, BookOpen, Calendar, MapPin, 
  Trash2, Save, ArrowLeft, CheckCircle2, AlertCircle,
  Zap, ListChecks, ChevronDown, Info, Users, X, Link as LinkIcon
} from "lucide-react";
import { 
  DISABILITY_TYPES, 
  SKILLS_LIST, 
  INDONESIA_CITIES,
  ACCOMMODATION_TYPES
} from "@/lib/data-static";

interface ProgramManagerProps {
  partnerId: string;
  onBack: () => void;
}

export default function ProgramManager({ partnerId, onBack }: ProgramManagerProps) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ text: "", isError: false });
  const [isCustomCity, setIsCustomCity] = useState(false);
  
  const manualCityRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: "",
    title: "",
    description: "",
    syllabus: "",
    participant_requirements: "",
    provided_skills: [] as string[],
    start_date: "",
    end_date: "",
    location: "",
    max_quota: 0,
    registration_instructions: "",
    is_online: false,
    is_published: true,
    target_disability: [] as string[],
    training_accommodations: [] as string[],
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

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const handleMultiToggle = (field: string, value: string) => {
    setFormData((prev: any) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((v: string) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: "Sinkronisasi database...", isError: false });

    try {
      const payload = {
        ...formData,
        partner_id: partnerId,
        updated_at: new Date()
      };

      let error;
      if (formData.id) {
        const { error: err } = await supabase.from("trainings").update(payload).eq("id", formData.id);
        error = err;
      } else {
        const { id, ...newPayload } = payload;
        const { error: err } = await supabase.from("trainings").insert([newPayload]);
        error = err;
      }

      if (error) throw error;

      setStatusMsg({ text: "Program Berhasil Disimpan!", isError: false });
      setTimeout(() => {
        setIsEditing(false);
        fetchPrograms();
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ text: `Gagal: ${err.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <button onClick={() => setIsEditing(false)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
        <ArrowLeft size={16} /> Batal & Kembali
      </button>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              <Zap className="text-blue-600" /> Informasi Utama
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label htmlFor="title" className="ml-1 text-[10px] font-black uppercase text-slate-400">Judul Pelatihan</label>
                <input 
                  id="title" required value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white"
                  placeholder="Contoh: Digital Literacy for Deaf Community"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 text-left">
                  <label htmlFor="start_date" className="ml-1 text-[10px] font-black uppercase text-slate-400">Tanggal Mulai</label>
                  <input id="start_date" type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900" />
                </div>
                <div className="space-y-2 text-left">
                  <label htmlFor="end_date" className="ml-1 text-[10px] font-black uppercase text-slate-400">Estimasi Selesai</label>
                  <input id="end_date" type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 text-left">
                  <label htmlFor="loc-select" className="ml-1 text-[10px] font-black uppercase text-slate-400">Lokasi Kota</label>
                  {!isCustomCity ? (
                    <div className="relative">
                      <select 
                        id="loc-select" value={formData.location} 
                        onChange={e => {
                          if (e.target.value === "LAINNYA") {
                            setIsCustomCity(true);
                            setFormData({...formData, location: ""});
                            setTimeout(() => manualCityRef.current?.focus(), 100);
                          } else {
                            setFormData({...formData, location: e.target.value});
                          }
                        }}
                        className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900"
                      >
                        <option value="">-- Pilih Kota --</option>
                        {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="LAINNYA" className="text-blue-600 font-black italic">+ KOTA LAINNYA</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in zoom-in-95">
                      <input ref={manualCityRef} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full rounded-2xl border-2 border-blue-100 bg-blue-50 p-4 font-bold outline-none" placeholder="Ketik Nama Kota..." />
                      <button type="button" onClick={() => setIsCustomCity(false)} className="text-[9px] font-black uppercase text-blue-600 underline">Pilih dari Daftar</button>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-left">
                  <label htmlFor="quota" className="ml-1 text-[10px] font-black uppercase text-slate-400">Kuota Peserta (0 = Unlimited)</label>
                  <input 
                    id="quota" type="number" value={formData.max_quota} 
                    onChange={e => setFormData({...formData, max_quota: parseInt(e.target.value) || 0})}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900" 
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              <BookOpen className="text-blue-600" /> Kurikulum & Syarat
            </h2>
            <div className="space-y-6">
              <div className="space-y-2 text-left">
                <label htmlFor="desc" className="ml-1 text-[10px] font-black uppercase text-slate-400">Deskripsi Singkat Program</label>
                <textarea id="desc" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900" placeholder="Jelaskan tujuan pelatihan..." />
              </div>
              <div className="space-y-2 text-left">
                <label htmlFor="syllabus" className="ml-1 text-[10px] font-black uppercase text-slate-400">Silabus / Materi Pelatihan</label>
                <textarea id="syllabus" rows={3} value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900" placeholder="Detail materi per pertemuan..." />
              </div>
              <div className="space-y-2 text-left">
                <label htmlFor="req" className="ml-1 text-[10px] font-black uppercase text-slate-400">Syarat Peserta (Isian Bebas)</label>
                <textarea id="req" rows={3} value={formData.participant_requirements} onChange={e => setFormData({...formData, participant_requirements: e.target.value})} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900" placeholder="Misal: Memiliki laptop, Bisa baca tulis, dsb." />
              </div>
            </div>
          </section>

          <section className="rounded-[3rem] border-4 border-slate-900 bg-blue-600 p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] text-white space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
               Instruksi Pasca Daftar
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl bg-blue-700/50 p-6 border-2 border-blue-400">
                <Info className="shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest text-left">
                  Tuliskan langkah selanjutnya bagi peserta. Informasi ini akan otomatis muncul di layar talenta setelah mereka klik &quot;Daftar&quot;. 
                  (Contoh: Link grup WhatsApp, Link Zoom, atau No. HP Contact Person).
                </p>
              </div>
              <textarea 
                id="reg_instructions" rows={3} required value={formData.registration_instructions} 
                onChange={e => setFormData({...formData, registration_instructions: e.target.value})}
                className="w-full rounded-2xl border-2 border-blue-400 bg-blue-700 p-6 font-bold text-white placeholder:text-blue-300 outline-none focus:border-white"
                placeholder="Misal: Silakan gabung grup WhatsApp melalui link: bit.ly/..."
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl text-left">
            <legend className="sr-only">Ragam Disabilitas Sasaran</legend>
            <h3 id="dis-q" className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-blue-400">
              <Users size={18} /> Ragam Sasaran
            </h3>
            <div className="space-y-3">
              {DISABILITY_TYPES.map((type, idx) => (
                <label key={type} className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-blue-500/30 ${formData.target_disability.includes(type) ? 'border-blue-500 bg-blue-600/20' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}>
                  <input 
                    type="checkbox" 
                    aria-labelledby={`dis-q dis-opt-${idx}`}
                    checked={formData.target_disability.includes(type)}
                    onChange={() => handleMultiToggle("target_disability", type)}
                    className="size-5 accent-blue-500"
                  />
                  <span id={`dis-opt-${idx}`} className="text-[10px] font-bold uppercase">{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl text-left">
            <legend className="sr-only">Akomodasi yang Disediakan</legend>
            <h3 id="acc-q" className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-emerald-400">
              <ListChecks size={18} /> Akomodasi Tersedia
            </h3>
            <div className="space-y-3">
              {ACCOMMODATION_TYPES.map((acc, idx) => (
                <label key={acc} className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-emerald-500/30 ${formData.training_accommodations.includes(acc) ? 'border-emerald-500 bg-emerald-600/20' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}>
                  <input 
                    type="checkbox" 
                    aria-labelledby={`acc-q acc-opt-${idx}`}
                    checked={formData.training_accommodations.includes(acc)}
                    onChange={() => handleMultiToggle("training_accommodations", acc)}
                    className="size-5 accent-emerald-500"
                  />
                  <span id={`acc-opt-${idx}`} className="text-[10px] font-bold uppercase">{acc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
               <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} className="size-5 accent-slate-900" />
               <span className="text-[10px] font-black uppercase italic">Publish ke Halaman Publik</span>
            </label>

            {statusMsg.text && (
              <div aria-live="polite" className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase ${statusMsg.isError ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                {statusMsg.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {statusMsg.text}
              </div>
            )}

            <button 
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-6 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "MENYIMPAN..." : <><Save size={20} /> PUBLIKASIKAN PROGRAM</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 text-left">
      <div className="mb-10 flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end">
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Program Manager</h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Otomasi Alur Pelatihan & Registrasi</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: "", title: "", description: "", syllabus: "", participant_requirements: "", provided_skills: [], start_date: "", end_date: "", location: "", max_quota: 0, registration_instructions: "", is_online: false, is_published: true, target_disability: [], training_accommodations: [] });
            setIsEditing(true);
          }}
          className="flex items-center justify-center gap-3 rounded-[2rem] bg-blue-600 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl hover:bg-slate-900 transition-all"
        >
          <Plus size={20} /> Tambah Program
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {programs.map(prog => (
          <div key={prog.id} className="group relative flex flex-col justify-between rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] transition-all hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-[8px] font-black uppercase ${prog.is_published ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {prog.is_published ? "Published" : "Draft"}
                </span>
                <div className="flex gap-2">
                   <button onClick={() => { setFormData({...prog}); setIsEditing(true); }} className="text-slate-300 hover:text-blue-600 transition-colors"><BookOpen size={16} /></button>
                   <button onClick={async () => {
                      if(confirm("Hapus program ini secara permanen?")) {
                        await supabase.from("trainings").delete().eq("id", prog.id);
                        fetchPrograms();
                      }
                   }} className="text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900">{prog.title}</h3>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-600">
                    <Users size={14} /> {prog.current_participants || 0} / {prog.max_quota === 0 ? "∞" : prog.max_quota}
                 </div>
                 {prog.max_quota !== 0 && prog.current_participants >= prog.max_quota && (
                   <span className="rounded-md bg-red-50 px-2 py-1 text-[8px] font-black uppercase text-red-600">Kuota Penuh</span>
                 )}
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t-2 border-slate-50 pt-6 text-left">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
                <MapPin size={12} className="text-blue-600" /> {prog.is_online ? "Remote" : prog.location}
              </div>
              <button onClick={() => { setFormData({...prog}); setIsEditing(true); }} className="text-[10px] font-black uppercase italic text-blue-600 underline underline-offset-4">Edit Detail</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
