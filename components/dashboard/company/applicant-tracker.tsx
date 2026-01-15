"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, FileDown, ExternalLink, CheckCircle, XCircle, 
  Clock, Activity, Download, CheckSquare, Square, ArrowRight,
  UserCheck, Calendar, Briefcase, Ban, ThumbsUp
} from "lucide-react";

// Import helper dari file eksternal
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

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select(`*, jobs(id, title), profiles(*)`)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (!error) setApplicants(data || []);
    setLoading(false);
  }, [company?.id]);

  useEffect(() => {
    if (company?.id) fetchApplicants();
  }, [company?.id, fetchApplicants]);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: null }), 5000);
  };

  const handleUpdateStatus = async (appId: string, newStatus: string, note?: string) => {
    // Sinkronisasi dengan Enum Database (hired, accepted, interview, reviewing, applied, rejected)
    const { error } = await supabase
      .from("applications")
      .update({ 
        status: newStatus.toLowerCase(), 
        hrd_notes: note || null 
      })
      .eq("id", appId);
      
    if (!error) {
      showToast(`Status diperbarui ke tahap ${newStatus.toUpperCase()}`, "success");
      setNoteModal({ isOpen: false, appId: "", name: "", status: "" });
      setHrdNote("");
      fetchApplicants();
    } else {
      showToast("Gagal memperbarui status. Pastikan koneksi stabil.", "error");
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

  // LOGIKA TOMBOL PINTAR (SMART ACTION)
  const renderSmartButtons = (app: any) => {
    const status = app.status?.toLowerCase();
    const p = app.profiles;

    if (status === 'hired') return <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl text-center italic border border-emerald-100">TALENTA SUDAH BEKERJA</div>;
    if (status === 'rejected') return <div className="text-[10px] font-black text-red-600 bg-red-50 px-4 py-3 rounded-xl text-center italic border border-red-100">LAMARAN DITOLAK</div>;

    return (
      <div className="flex w-full flex-col gap-2">
        {/* Step 1: applied -> reviewing */}
        {status === 'applied' && (
          <button 
            onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'reviewing' })}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-[9px] font-black uppercase text-white hover:bg-slate-900 transition-all"
          >
            <Search size={14} /> PROSES REVIEW
          </button>
        )}

        {/* Step 2: reviewing -> interview */}
        {status === 'reviewing' && (
          <button 
            onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'interview' })}
            className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-[9px] font-black uppercase text-white hover:bg-slate-900 transition-all"
          >
            <Calendar size={14} /> JADWALKAN INTERVIEW
          </button>
        )}

        {/* Step 3: interview -> accepted (Lolos Seleksi) */}
        {status === 'interview' && (
          <button 
            onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'accepted' })}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-[9px] font-black uppercase text-white hover:bg-slate-900 transition-all"
          >
            <ThumbsUp size={14} /> LOLOSKAN SELEKSI (ACCEPT)
          </button>
        )}

        {/* Step 4: accepted -> hired (Mulai Kerja) */}
        {status === 'accepted' && (
          <button 
            onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'hired' })}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-[9px] font-black uppercase text-white hover:bg-slate-900 transition-all"
          >
            <UserCheck size={14} /> KONFIRMASI MULAI KERJA (HIRE)
          </button>
        )}

        {/* Tombol Reject Selalu Ada */}
        <button 
          onClick={() => setNoteModal({ isOpen: true, appId: app.id, name: p?.full_name, status: 'rejected' })}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white px-4 py-2 text-[9px] font-black uppercase text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
        >
          <Ban size={14} /> Tolak Pelamar
        </button>
      </div>
    );
  };

  if (loading) return <div role="status" className="p-20 text-center font-black animate-pulse text-slate-400 uppercase italic">Sinkronisasi Pusat Riset...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-32 text-left">
      
      {/* Toast Notification (Accessible) */}
      <div aria-live="polite" role="status" className="fixed bottom-10 right-10 z-[100]">
        {toast.msg && (
          <div className={`rounded-3xl border-4 p-6 font-black uppercase italic shadow-2xl animate-in slide-in-from-right-10 ${
            toast.type === "success" ? "border-slate-900 bg-emerald-500 text-white" : "border-slate-900 bg-red-500 text-white"
          }`}>
            {toast.msg}
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
          <Users className="mr-2 inline text-blue-600" aria-hidden="true" /> Applicant Tracker
        </h2>
        <button 
          onClick={() => exportApplicantsToExcel(filteredApplicants, company.name)}
          className="rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase italic text-white hover:bg-blue-600 transition-all shadow-lg"
        >
          <Download size={16} className="mr-2 inline" /> Export Data Riset (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid gap-4 rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 md:grid-cols-3">
        <input 
          aria-label="Cari nama talenta"
          placeholder="CARI NAMA TALENTA..." 
          className="rounded-xl border-2 border-slate-50 bg-slate-50 px-6 py-3 text-[10px] font-black outline-none focus:border-slate-900 transition-all"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select aria-label="Filter status" onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase outline-none focus:border-slate-900">
          <option value="all">SEMUA STATUS</option>
          <option value="applied">BARU MASUK</option>
          <option value="reviewing">SEDANG DIREVIEW</option>
          <option value="interview">TAHAP INTERVIEW</option>
          <option value="accepted">LOLOS SELEKSI</option>
          <option value="hired">SUDAH BEKERJA</option>
          <option value="rejected">DITOLAK</option>
        </select>
        <select aria-label="Filter lowongan" onChange={(e) => setFilterJob(e.target.value)} className="rounded-xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase outline-none focus:border-slate-900">
          <option value="all">SEMUA LOWONGAN</option>
          {Array.from(new Set(applicants.map(a => a.jobs?.title))).filter(Boolean).map(t => (
            <option key={t as string} value={t as string}>{t as string}</option>
          ))}
        </select>
      </div>

      {/* Main List */}
      <div className="space-y-4" role="list">
        {filteredApplicants.map(app => {
          const p = app.profiles;
          const skills = Array.isArray(p?.skills) ? p.skills : [];
          
          return (
            <article key={app.id} className={`flex flex-col items-start gap-6 rounded-[3rem] border-2 p-8 transition-all md:flex-row md:items-center ${selectedIds.includes(app.id) ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-slate-900'}`}>
              
              {/* Checkbox Aksesibel Screen Reader */}
              <div className="relative shrink-0">
                <input 
                  type="checkbox"
                  id={`check-${app.id}`}
                  checked={selectedIds.includes(app.id)}
                  onChange={() => toggleSelect(app.id)}
                  className="peer sr-only"
                />
                <label htmlFor={`check-${app.id}`} className="cursor-pointer text-slate-200 peer-checked:text-blue-600 transition-colors" aria-label={`Pilih ${p?.full_name}`}>
                  {selectedIds.includes(app.id) ? <CheckSquare size={32} /> : <Square size={32} />}
                </label>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-black uppercase italic text-slate-900">{p?.full_name}</h3>
                  <span className={`rounded-full px-3 py-1 text-[8px] font-black uppercase italic ${
                    app.status === 'hired' ? 'bg-emerald-100 text-emerald-600' : 
                    app.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                    app.status === 'accepted' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Posisi: {app.jobs?.title}</p>
                
                {/* Deskripsi Lengkap Sesuai Permintaan */}
                <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-sm font-medium italic text-slate-700 leading-relaxed border border-slate-100 shadow-sm">
                  <p>Lulusan <strong>{p?.education_level} {p?.major}</strong> dari <strong>{p?.university}</strong> tahun <strong>{p?.graduation_date || "-"}</strong>.</p>
                  <p className="mt-1">Berdomisili di <strong>{p?.city || "Lokasi tidak diketahui"}</strong>.</p>
                  {skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {skills.slice(0, 5).map((s: string, i: number) => (
                        <span key={i} className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-[8px] font-bold not-italic text-slate-500 uppercase shadow-sm">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Area */}
              <div className="flex w-full flex-col gap-3 md:w-64">
                {renderSmartButtons(app)}
                <div className="mt-2 flex gap-2">
                  <button onClick={() => generateProfessionalCV(app, company)} title="Cetak CV Audit" className="flex-1 rounded-xl bg-slate-50 p-3 text-slate-400 hover:text-blue-600 transition-all border border-slate-100"><FileDown size={22} className="mx-auto" /></button>
                  <a href={`/talent/${p?.id}`} target="_blank" title="Buka Profil Lengkap" className="flex-1 rounded-xl bg-slate-50 p-3 text-slate-400 hover:text-slate-900 transition-all border border-slate-100"><ExternalLink size={22} className="mx-auto" /></a>
                </div>
              </div>

            </article>
          );
        })}
      </div>

      {/* Accessible Note Modal */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Konfirmasi Status</h2>
            <p className="mt-2 text-[10px] font-black uppercase italic text-slate-400">Update {noteModal.name} ke: {noteModal.status}</p>
            <textarea 
              autoFocus 
              className="mt-6 h-32 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 text-sm font-medium italic outline-none focus:border-blue-600 transition-all" 
              placeholder="Catatan riset internal (Opsional)..." 
              value={hrdNote} 
              onChange={(e) => setHrdNote(e.target.value)} 
            />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setNoteModal({ ...noteModal, isOpen: false })} className="flex-1 rounded-xl border-2 border-slate-100 py-4 text-[10px] font-black uppercase hover:bg-slate-50 transition-all">BATAL</button>
              <button onClick={() => handleUpdateStatus(noteModal.appId, noteModal.status, hrdNote)} className="flex-1 rounded-xl bg-slate-900 py-4 text-[10px] font-black uppercase italic text-white hover:bg-blue-600 shadow-xl transition-all">KONFIRMASI</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}