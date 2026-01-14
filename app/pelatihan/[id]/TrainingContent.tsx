"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, BookOpen, CheckCircle2, FileText, 
  Building2, GraduationCap, ArrowRight, Timer,
  Accessibility, MessageCircle, LayoutDashboard, Target, Zap
} from "lucide-react";
import Link from "next/link";

export default function TrainingContent({ training, partner, accommodations, skills }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  // Helper Tanggal yang Aman
  const formatFullDate = (dateStr: string) => {
    if (!dateStr || dateStr === "") return "Tanggal belum ditentukan";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch (e) { return "Format tanggal salah"; }
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1200);
  };

  useEffect(() => {
    if (showSuccess && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [showSuccess]);

  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
        <div className="max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500" role="alert" aria-live="assertive">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-4">
            <h1 ref={successHeadingRef} tabIndex={-1} className="text-4xl font-black uppercase italic tracking-tighter outline-none md:text-6xl">Pendaftaran Berhasil!</h1>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Program diselenggarakan oleh {partner?.name || 'Mitra'}</p>
          </div>
          <div className="rounded-[3rem] border-2 border-slate-700 bg-slate-800/50 p-10 text-left space-y-6">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-400"><MessageCircle size={18} /> Instruksi:</h2>
            <div className="text-xl font-medium italic text-slate-200">
              {training?.registration_instructions || "Instruksi akan dikirimkan ke email Anda."}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-slate-900">
            <Link href="/dashboard/talent" className="flex items-center justify-center gap-3 rounded-[2rem] bg-white py-6 text-xs font-black uppercase italic">
              <LayoutDashboard size={18} /> Dashboard Saya
            </Link>
            <Link href="/pelatihan" className="flex items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-700 py-6 text-xs font-black uppercase italic text-white">
              Cari Program Lain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = training?.registration_deadline ? new Date(training.registration_deadline) < new Date() : false;

  return (
    <>
      <header className="border-b-4 border-slate-900 bg-white px-6 pt-16 pb-20 text-left">
        <div className="mx-auto max-w-6xl flex flex-col items-start gap-12 lg:flex-row lg:items-center">
          <div className="flex size-28 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <GraduationCap size={48} />
          </div>
          <div className="flex-1 space-y-6">
            <span className="rounded-full bg-blue-50 border-2 border-blue-100 px-4 py-1 text-[10px] font-black uppercase text-blue-600">
              {training?.is_online ? "Daring (Online)" : "Luring (Offline)"}
            </span>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl text-slate-900">{training?.title}</h1>
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white"><Building2 size={18} /></div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Penyelenggara</p>
                  <span className="text-sm font-black uppercase italic">{partner?.name || "Mitra"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-blue-600" />
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Lokasi</p>
                  <span className="text-sm font-black uppercase italic">{training?.is_online ? "Seluruh Indonesia" : (training?.location || "N/A")}</span>
                </div>
              </div>
            </div>
          </div>
          {!isExpired ? (
            <button onClick={handleRegister} disabled={isSubmitting} className="w-full lg:w-auto rounded-[2rem] border-4 border-slate-900 bg-slate-900 px-12 py-8 text-sm font-black text-white hover:bg-blue-600 transition-all">
              {isSubmitting ? "PROSES..." : "DAFTAR SEKARANG"}
            </button>
          ) : (
            <div className="rounded-[2rem] border-4 border-slate-200 bg-slate-50 px-12 py-8 text-xs font-black uppercase italic text-slate-400">Pendaftaran Tutup</div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20 text-left grid grid-cols-1 gap-16 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-20">
          <section className="space-y-6">
            <h2 className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter"><FileText className="text-blue-600" size={32} /> Tentang</h2>
            <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-xl font-medium italic text-slate-700">{training?.description || "Tidak ada deskripsi."}</div>
          </section>

          {skills.length > 0 && (
            <section className="space-y-8">
              <h2 className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter"><Target className="text-blue-600" size={32} /> Skill Output</h2>
              <div className="flex flex-wrap gap-4">
                {skills.map((s: string) => (
                  <div key={s} className="rounded-2xl border-2 border-slate-900 bg-white px-6 py-4 text-xs font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <Zap size={16} className="inline mr-2 text-blue-600 fill-blue-600" /> {s}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-8">
            <h2 className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter"><BookOpen className="text-blue-600" size={32} /> Silabus</h2>
            <div className="grid gap-4">
              {training?.syllabus?.split('\n').filter((s: string) => s.trim() !== "").map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-6 rounded-3xl border-2 border-slate-50 bg-white p-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">{idx + 1}</span>
                  <p className="text-sm font-black uppercase italic text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-12">
          <section className="rounded-[3.5rem] bg-blue-600 p-10 text-white shadow-2xl space-y-8">
            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic border-b border-blue-400 pb-4"><Timer size={16} /> Jadwal</h3>
            <div className="space-y-4">
              <p className="text-[8px] font-black uppercase opacity-60">Mulai - Selesai</p>
              <p className="text-base font-black italic uppercase leading-tight">
                {formatFullDate(training?.start_date)} - {formatFullDate(training?.end_date)}
              </p>
              {training?.start_time && (
                <p className="text-xl font-black italic border-t border-blue-400 pt-4">
                  {training.start_time.substring(0, 5)} - {training.end_time?.substring(0, 5)} WIB
                </p>
              )}
            </div>
          </section>
          
          <section className="rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] space-y-8">
            <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter"><Accessibility className="text-blue-600" size={24} /> Inklusi</h3>
            <ul className="space-y-4">
              {accommodations.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 p-4">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-[11px] font-black uppercase text-emerald-950">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </>
  );
}