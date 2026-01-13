"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Plus, BookOpen, Calendar, MapPin, 
  Trash2, Save, ArrowLeft, CheckCircle2, AlertCircle,
  Zap, ListChecks, ChevronDown, Info, Users, X, 
  Search, Laptop, Building, Globe, Clock, CalendarDays, Timer
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
  const [skillSearch, setSkillSearch] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Offline");

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
    start_time: "", // Baru: Jam Mulai
    end_time: "",   // Baru: Jam Selesai
    registration_start: "", 
    registration_deadline: "", 
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

  const handleEdit = (prog: any) => {
    setFormData(prog);
    if (prog.is_online && (prog.location === "Remote / Online" || !prog.location)) {
      setDeliveryMethod("Online");
    } else if (prog.is_online && prog.location && prog.location !== "Remote / Online") {
      setDeliveryMethod("Hybrid");
    } else {
      setDeliveryMethod("Offline");
    }
    setIsEditing(true);
  };

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
      const finalPayload = {
        ...formData,
        partner_id: partnerId,
        is_online: deliveryMethod === "Online" || deliveryMethod === "Hybrid",
        location: deliveryMethod === "Online" ? "Remote / Online" : formData.location,
        updated_at: new Date()
      };

      let error;
      if (formData.id) {
        const { error: err } = await supabase.from("trainings").update(finalPayload).eq("id", formData.id);
        error = err;
      } else {
        const { id, ...newPayload } = finalPayload;
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

  const filteredSkills = SKILLS_LIST.filter(s => 
    s.toLowerCase().includes(skillSearch.toLowerCase())
  ).slice(0, 15);

  if (isEditing) return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <button onClick={() => setIsEditing(false)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
        <ArrowLeft size={16} /> Batal & Kembali
      </button>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-12 lg:grid-cols-3 text-left">
        <div className="lg:col-span-2 space-y-10">
          {/* SEKSI 1: IDENTITAS */}
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              <Zap className="text-blue-600" /> Informasi Utama
            </h2>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="title" className="ml-1 text-[10px] font-black uppercase text-slate-400">Judul Kegiatan / Pelatihan</label>
                <input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900 focus:bg-white" placeholder="Webinar / Workshop / Kursus..." />
              </div>

              {/* TIMELINE SECTION - REVISED FOR FLEXIBILITY */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-3xl border-2 border-blue-50 bg-blue-50/30 p-6">
                  <h3 className="flex items-center gap-2 text-[11px] font-black uppercase italic text-blue-600">
                    <Clock size={16} /> Periode Pendaftaran
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label htmlFor="reg_start" className="ml-1 text-[9px] font-black uppercase text-slate-400">Buka</label>
                      <input id="reg_start" type="date" required value={formData.registration_start} onChange={e => setFormData({...formData, registration_start: e.target.value})} className="w-full rounded-xl border-2 border-white bg-white p-3 text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="reg_deadline" className="ml-1 text-[9px] font-black uppercase text-slate-400">Tutup</label>
                      <input id="reg_deadline" type="date" required value={formData.registration_deadline} onChange={e => setFormData({...formData, registration_deadline: e.target.value})} className="w-full rounded-xl border-2 border-white bg-white p-3 text-xs font-bold" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border-2 border-emerald-50 bg-emerald-50/30 p-6">
                  <h3 className="flex items-center gap-2 text-[11px] font-black uppercase italic text-emerald-600">
                    <CalendarDays size={16} /> Waktu Pelaksanaan
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label htmlFor="start_date" className="ml-1 text-[9px] font-black uppercase text-slate-400">Tanggal Mulai</label>
                      <input id="start_date" type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value, end_date: e.target.value})} className="w-full rounded-xl border-2 border-white bg-white p-3 text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="end_date" className="ml-1 text-[9px] font-black uppercase text-slate-400">Tanggal Selesai</label>
                      <input id="end_date" type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full rounded-xl border-2 border-white bg-white p-3 text-xs font-bold" />
                    </div>
                    {/* INPUT JAM - PENTING UNTUK WEBINAR/WORKSHOP */}
                    <div className="space-y-2">
                      <label htmlFor="start_time" className="ml-1 text-[9px] font-black uppercase text-slate-400">Jam Mulai</label>
                      <input id="start_time" type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full rounded-xl border-2 border-white bg-white p-3 text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="end_time" className="ml-1 text-[9px] font-black uppercase text-slate-400">Jam Selesai</label>
                      <input id="end_time" type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full rounded-xl border-2 border-white bg-white p-3 text-xs font-bold" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <fieldset className="space-y-3">
                  <legend className="ml-1 text-[10px] font-black uppercase text-slate-400">Metode Pelaksanaan</legend>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ id: 'Offline', icon: Building, label: 'Luring' }, { id: 'Online', icon: Laptop, label: 'Daring' }, { id: 'Hybrid', icon: Globe, label: 'Hybrid' }].map((m) => (
                      <label key={m.id} className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-blue-100 ${deliveryMethod === m.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}>
                        <input type="radio" name="method" value={m.id} checked={deliveryMethod === m.id} onChange={() => setDeliveryMethod(m.id)} className="sr-only" />
                        <m.icon size={20} className={deliveryMethod === m.id ? "text-blue-600" : "text-slate-400"} />
                        <span className="text-[9px] font-black uppercase">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <label htmlFor="loc-select" className="ml-1 text-[10px] font-black uppercase text-slate-400">Lokasi / Kota Utama</label>
                  {deliveryMethod === "Online" ? (
                    <input disabled value="Remote / Online" className="w-full rounded-2xl border-2 border-slate-100 bg-slate-100 p-4 font-bold italic text-slate-400" />
                  ) : !isCustomCity ? (
                    <div className="relative">
                      <select id="loc-select" value={formData.location} onChange={e => {
                        if (e.target.value === "LAINNYA") {
                          setIsCustomCity(true);
                          setFormData({...formData, location: ""});
                          setTimeout(() => manualCityRef.current?.focus(), 100);
                        } else {
                          setFormData({...formData, location: e.target.value});
                        }
                      }} className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900">
                        <option value="">-- Pilih Kota --</option>
                        {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        <option value="LAINNYA" className="text-blue-600 font-black italic">+ KOTA LAINNYA</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input ref={manualCityRef} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full rounded-2xl border-2 border-blue-100 bg-blue-50 p-4 font-bold outline-none" placeholder="Ketik Nama Kota..." />
                      <button type="button" onClick={() => setIsCustomCity(false)} className="text-[9px] font-black uppercase text-blue-600 underline">Pilih dari Daftar</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="quota" className="ml-1 text-[10px] font-black uppercase text-slate-400">Kuota Peserta (0 = Unlimited)</label>
                <div className="relative max-w-[200px]">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input id="quota" type="number" value={formData.max_quota} onChange={e => setFormData({...formData, max_quota: parseInt(e.target.value) || 0})} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 pl-12 font-bold outline-none focus:border-slate-900" />
                </div>
              </div>
            </div>
          </section>

          {/* SEKSI 2: KURIKULUM & SKILLS */}
          <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              <BookOpen className="text-blue-600" /> Kurikulum & Output
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="desc" className="ml-1 text-[10px] font-black uppercase text-slate-400">Deskripsi Singkat</label>
                <textarea id="desc" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900" placeholder="Jelaskan tujuan kegiatan ini..." />
              </div>

              <fieldset className="space-y-4">
                <legend id="skills-title" className="ml-1 text-[10px] font-black uppercase text-slate-400">Pilih Output Keahlian</legend>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Cari keahlian..." className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-3 pl-12 text-xs font-bold outline-none focus:border-blue-600" value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto rounded-2xl border-2 border-slate-50 bg-slate-50 p-4 no-scrollbar">
                   {filteredSkills.map((skill, idx) => (
                      <label key={skill} className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-white p-2 transition-all hover:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
                        <input type="checkbox" aria-labelledby={`skills-title skill-opt-${idx}`} checked={formData.provided_skills.includes(skill)} onChange={() => handleMultiToggle("provided_skills", skill)} className="size-4 accent-blue-600" />
                        <span id={`skill-opt-${idx}`} className="text-[9px] font-black uppercase tracking-tight text-slate-600">{skill}</span>
                      </label>
                   ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <label htmlFor="syllabus" className="ml-1 text-[10px] font-black uppercase text-slate-400">Silabus / Agenda Utama</label>
                <textarea id="syllabus" rows={3} value={formData.syllabus} onChange={e => setFormData({...formData, syllabus: e.target.value})} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900" placeholder="Misal: Agenda Sesi 1, Sesi 2..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="req" className="ml-1 text-[10px] font-black uppercase text-slate-400">Syarat Peserta</label>
                <textarea id="req" rows={3} value={formData.participant_requirements} onChange={e => setFormData({...formData, participant_requirements: e.target.value})} className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 p-6 font-medium outline-none focus:border-slate-900" placeholder="Punya laptop, Domisili Jabar, dll..." />
              </div>
            </div>
          </section>

          {/* SEKSI 3: INSTRUKSI OTOMATIS */}
          <section className="rounded-[3rem] border-4 border-slate-900 bg-blue-600 p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] text-white space-y-6">
            <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
               Instruksi Pasca Daftar
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-2xl bg-blue-700/50 p-6 border-2 border-blue-400">
                <Info className="shrink-0" />
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                   Link grup WA / Link Zoom / Instruksi khusus yang muncul setelah talenta klik &quot;Daftar&quot;.
                </p>
              </div>
              <textarea id="reg_instructions" rows={3} required value={formData.registration_instructions} onChange={e => setFormData({...formData, registration_instructions: e.target.value})} className="w-full rounded-2xl border-2 border-blue-400 bg-blue-700 p-6 font-bold text-white placeholder:text-blue-300 outline-none focus:border-white" placeholder="Link grup WA / Zoom..." />
            </div>
          </section>
        </div>

        {/* KOLOM KANAN: RISET & PUBLISH */}
        <div className="space-y-8">
          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl text-left">
            <legend className="sr-only">Ragam Disabilitas Sasaran</legend>
            <h3 id="dis-title" className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-blue-400">
              <Users size={18} /> Ragam Sasaran
            </h3>
            <div className="space-y-3">
              {DISABILITY_TYPES.map((type, idx) => (
                <label key={type} className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-blue-500/30 ${formData.target_disability.includes(type) ? 'border-blue-500 bg-blue-600/20' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}>
                  <input type="checkbox" aria-labelledby={`dis-title dis-opt-${idx}`} checked={formData.target_disability.includes(type)} onChange={() => handleMultiToggle("target_disability", type)} className="size-5 accent-blue-500" />
                  <span id={`dis-opt-${idx}`} className="text-[10px] font-bold uppercase">{type}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl text-left">
            <legend className="sr-only">Akomodasi Pelatihan</legend>
            <h3 id="acc-title" className="mb-6 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest italic text-emerald-400">
              <ListChecks size={18} /> Akomodasi Tersedia
            </h3>
            <div className="space-y-3">
              {ACCOMMODATION_TYPES.map((acc, idx) => (
                <label key={acc} className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all focus-within:ring-4 focus-within:ring-emerald-500/30 ${formData.training_accommodations.includes(acc) ? 'border-emerald-500 bg-emerald-600/20' : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'}`}>
                  <input type="checkbox" aria-labelledby={`acc-title acc-opt-${idx}`} checked={formData.training_accommodations.includes(acc)} onChange={() => handleMultiToggle("training_accommodations", acc)} className="size-5 accent-emerald-500" />
                  <span id={`acc-opt-${idx}`} className="text-[10px] font-bold uppercase">{acc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
               <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} className="size-5 accent-slate-900" />
               <span className="text-[10px] font-black uppercase italic">Publish ke Publik</span>
            </label>

            {statusMsg.text && (
              <div aria-live="polite" className={`flex items-center gap-3 rounded-2xl border-2 p-5 text-[10px] font-black uppercase ${statusMsg.isError ? 'border-red-100 bg-red-50 text-red-600' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
                {statusMsg.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {statusMsg.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 rounded-[2rem] bg-slate-900 py-7 text-xs font-black uppercase italic tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-blue-600 disabled:opacity-50 active:scale-95">
              {loading ? "SINKRONISASI..." : <><Save size={20} /> SIMPAN PROGRAM</>}
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
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">Program Manager</h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 italic">Pengelolaan Kegiatan & Data Riset v2.1</p>
        </div>
        <button onClick={() => { setFormData({ id: "", title: "", description: "", syllabus: "", participant_requirements: "", provided_skills: [], start_date: "", end_date: "", start_time: "", end_time: "", registration_start: "", registration_deadline: "", location: "", max_quota: 0, registration_instructions: "", is_online: false, is_published: true, target_disability: [], training_accommodations: [] }); setDeliveryMethod("Offline"); setIsEditing(true); }} className="flex items-center justify-center gap-3 rounded-[2rem] bg-blue-600 px-8 py-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl hover:bg-slate-900 transition-all">
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
                   <button onClick={() => handleEdit(prog)} aria-label={`Edit program ${prog.title}`} className="text-slate-300 hover:text-blue-600 transition-all"><BookOpen size={16} /></button>
                   <button onClick={async () => { if(confirm(`Hapus program ${prog.title}?`)) { await supabase.from("trainings").delete().eq("id", prog.id); fetchPrograms(); } }} aria-label={`Hapus program ${prog.title}`} className="text-slate-300 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900">{prog.title}</h3>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600">
                    <Users size={14} /> {prog.current_participants || 0} / {prog.max_quota === 0 ? "∞" : prog.max_quota}
                 </div>
                 {/* INFO WAKTU DI CARD */}
                 <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-slate-400">
                    <Timer size={12} /> {prog.start_date === prog.end_date ? 'Single Day' : 'Multi Days'}
                 </div>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between border-t-2 border-slate-50 pt-6">
              <div className="flex flex-col gap-1">
                 <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-500">
                   <MapPin size={12} className="text-blue-600" /> {prog.location}
                 </div>
                 <div className="flex items-center gap-1 text-[8px] font-bold uppercase text-slate-300 italic">
                    Deadline: {prog.registration_deadline}
                 </div>
              </div>
              <button onClick={() => handleEdit(prog)} className="text-[10px] font-black uppercase italic text-blue-600 underline underline-offset-4">Edit Detail</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
