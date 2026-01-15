"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, FileDown, ExternalLink, CheckCircle, XCircle, 
  Clock, Activity, Download, CheckSquare, Square, Filter
} from "lucide-react";
import { exportApplicantsToExcel, generateProfessionalCV } from "./export-helpers";

export default function ApplicantTracker({ company }: { company: any }) {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | null }>({ msg: "", type: null });
  const [noteModal, setNoteModal] = useState({ isOpen: false, appId: "", name: "", status: "" });
  const [hrdNote, setHrdNote] = useState("");

  useEffect(() => {
    if (company?.id) fetchApplicants();
  }, [company?.id]);

  async function fetchApplicants() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select(`*, jobs(id, title), profiles(*, work_experiences(*), certifications(*))`)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });
    if (!error) setApplicants(data || []);
    setLoading(false);
  }

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: null }), 5000);
  };

  const handleUpdateStatus = async (appId: string, newStatus: string, note?: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus, hrd_notes: note || null })
      .eq("id", appId);
    if (!error) {
      showToast(`Status diperbarui ke ${newStatus}`, "success");
      setNoteModal({ ...noteModal, isOpen: false });
      setHrdNote("");
      fetchApplicants();
    }
  };

  const handleBulkUpdate = async (newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .in("id", selectedIds);
    if (!error) {
      showToast(`${selectedIds.length} pelamar berhasil di-update`, "success");
      setSelectedIds([]);
      fetchApplicants();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    const matchJob = filterJob === "all" || app.jobs?.title === filterJob;
    return matchSearch && matchStatus && matchJob;
  });

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">MENYINKRONKAN...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-32 text-left">
      {/* ARIA-LIVE REGION */}
      <div aria-live="polite" role="status" className="fixed bottom-10 right-10 z-[100]">
        {toast.msg && (
          <div className={`rounded-3xl border-4 p-6 font-black uppercase italic shadow-2xl animate-in slide-in-from-right-10 ${
            toast.type === "success" ? "border-slate-900 bg-emerald-500 text-white" : "border-slate-900 bg-red-500 text-white"
          }`}>{toast.msg}</div>
        )}
      </div>

      {/* Header & Export */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          <Users className="mr-2 inline text-blue-600" /> Applicant Tracker
        </h2>
        <button 
          onClick={() => exportApplicantsToExcel(filteredApplicants, company.name)}
          className="rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase italic text-white hover:bg-blue-600 transition-all"
        >
          <Download size={16} className="mr-2 inline" /> Export Komparasi (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-4 rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 md:grid-cols-3">
        <input 
          aria-label="Cari nama pelamar" placeholder="CARI NAMA..." 
          className="rounded-xl border-2 border-slate-50 bg-slate-50 px-6 py-3 text-[10px] font-black outline-none focus:border-slate-900"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select aria-label="Filter status" onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase">
          <option value="all">SEMUA STATUS</option>
          <option value="applied">BARU MASUK</option>
          <option value="interview">INTERVIEW</option>
          <option value="hired">DITERIMA KERJA</option>
        </select>
<select 
  aria-label="Filter lowongan"
  onChange={(e) => setFilterJob(e.target.value)} 
  className="rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase"
>
  <option value="all">SEMUA LOWONGAN</option>
  {/* Perbaikan: Menggunakan Array.from untuk kompatibilitas build */}
  {Array.from(new Set(applicants.map(a => a.jobs?.title))).filter(Boolean).map(t => (
    <option key={t as string} value={t as string}>
      {t as string}
    </option>
  ))}
</select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-[2rem] bg-blue-600 p-6 text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          <p className="text-[10px] font-black uppercase italic">{selectedIds.length} Pelamar Terpilih</p>
          <div className="flex gap-2">
            <button onClick={() => handleBulkUpdate('interview')} className="rounded-xl bg-white/20 px-4 py-2 text-[9px] font-black uppercase hover:bg-white/40">SET INTERVIEW</button>
            <button onClick={() => handleBulkUpdate('rejected')} className="rounded-xl bg-red-500 px-4 py-2 text-[9px] font-black uppercase hover:bg-red-600">REJECT</button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {filteredApplicants.map(app => (
          <article key={app.id} className={`flex flex-col items-start gap-6 rounded-[3rem] border-2 p-8 transition-all md:flex-row md:items-center ${selectedIds.includes(app.id) ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-900'}`}>
            <button onClick={() => toggleSelect(app.id)} aria-label={`Pilih ${app.profiles?.full_name}`} className="shrink-0 transition-colors">
              {selectedIds.includes(app.id) ? <CheckSquare size={24} className="text-blue-600" /> : <Square size={24} className="text-slate-200" />}
            </button>
            <div className="flex-1">
              <h3 className="text-lg font-black uppercase italic text-slate-900">{app.profiles?.full_name}</h3>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">{app.jobs?.title}</p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs italic text-slate-600">
                {app.profiles?.university} | {app.profiles?.education_level} | {app.profiles?.city}
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-2 md:w-auto">
              <button onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: app.profiles?.full_name, status: 'interview' })} className="flex-1 rounded-xl bg-orange-50 px-4 py-3 text-[9px] font-black uppercase text-orange-600 hover:bg-orange-600 hover:text-white transition-colors">INTERVIEW</button>
              <button onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: app.profiles?.full_name, status: 'hired' })} className="flex-1 rounded-xl bg-emerald-50 px-4 py-3 text-[9px] font-black uppercase text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors">HIRE</button>
              <button onClick={() => generateProfessionalCV(app, company)} className="rounded-xl bg-slate-100 px-4 py-3 text-slate-400 hover:text-blue-600" title="Unduh CV Audit"><FileDown size={18} /></button>
            </div>
          </article>
        ))}
      </div>

      {/* Modal Note */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[3rem] bg-white p-10 shadow-2xl">
            <h2 className="text-xl font-black uppercase italic">Proses: {noteModal.status}</h2>
            <textarea autoFocus className="mt-6 h-32 w-full rounded-2xl border-2 border-slate-100 p-4 text-sm outline-none focus:border-blue-600" placeholder="Catatan internal riset (Opsional)..." value={hrdNote} onChange={(e) => setHrdNote(e.target.value)} />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setNoteModal({ ...noteModal, isOpen: false })} className="flex-1 rounded-xl border-2 border-slate-100 py-3 text-[10px] font-black">BATAL</button>
              <button onClick={() => handleUpdateStatus(noteModal.appId, noteModal.status, hrdNote)} className="flex-1 rounded-xl bg-slate-900 py-3 text-[10px] font-black text-white">KONFIRMASI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}