"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, BookOpen, CheckCircle2, FileText, 
  Building2, GraduationCap, ArrowRight, Timer,
  Accessibility, MessageCircle, LayoutDashboard, Target, Zap, Clock, AlertTriangle
} from "lucide-react";
import Link from "next/link";

export default function TrainingContent({ training, partner, accommodations, skills }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return "Belum ditentukan";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    if (!userId) {
      window.location.href = "/masuk";
      return;
    }

    setIsSubmitting(true);
    try {
      // --- INTEGRASI & SINKRONISASI DATA RISET ---
      const { error } = await supabase
        .from("trainees")
        .insert([{
          profile_id: userId,
          training_id: training.id,
          partner_id: training.partner_id, // Menghubungkan pendaftaran dengan Mitra terkait
          status: "pending",
          applied_at: new Date().toISOString() // Pencatatan waktu pendaftaran talenta
        }]);

      if (error) throw error;
      
      // Jika berhasil, tampilkan state sukses (halaman instruksi)
      setShowSuccess(true);
    } catch (err: any) {
      // Tampilkan pesan di UI secara aksesibel (bukan alert pop-up)
      setErrorMessage(err.message || "Terjadi kesalahan pada sistem pendaftaran.");
      setTimeout(() => {
        errorRef.current?.focus();
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (showSuccess && successHeadingRef.current) {
      successHeadingRef.current.focus();
    }
  }, [showSuccess]);

  // --- TAMPILAN 1: HALAMAN KONFIRMASI SUKSES & INSTRUKSI ---
  if (showSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center text-white font-sans selection:bg-emerald-500">
        <div className="max-w-2xl space-y-10 animate-in fade-in zoom-in duration-500" role="alert" aria-live="assertive">
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
            <CheckCircle2 size={48} />
          </div>
          
          <div className="space-y-4">
            <h1 
              ref={successHeadingRef} 
              tabIndex={-1} 
              className="text-4xl font-black uppercase italic tracking-tighter outline-none md:text-6xl"
            >
              Pendaftaran Berhasil!
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-400 italic">Program diselenggarakan oleh {partner?.name}</p>
          </div>

          <div className="rounded-[3rem] border-2 border-slate-700 bg-slate-800/50 p-10 text-left space-y-6 shadow-2xl">
            <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-400">
              <MessageCircle size={18} /> Instruksi Pasca Pendaftaran:
            </h2>
            <div className="text-xl font-medium leading-relaxed italic text-slate-200">
              {training?.registration_instructions || "Silakan cek dashboard secara berkala untuk pembaruan status pendaftaran Anda."}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link href="/dashboard" className="flex items-center justify-center gap-3 rounded-[2rem] bg-white py-6 text-xs font-black uppercase italic text-slate-900 transition-all hover:bg-blue-600 hover:text-white">
              <LayoutDashboard size={18} /> Kembali ke Dashboard
            </Link>
            <Link href="/pelatihan" className="flex items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-700 py-6 text-xs font-black uppercase italic text-white transition-all hover:bg-slate-800">
              Cari Pelatihan Lain
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: HALAMAN RINCIAN (NORMAL) ---
  const isExpired = training?.registration_deadline ? new Date(training.registration_deadline) < new Date() : false;

  return (
    <>
      <header className="border-b-4 border-slate-900 bg-white px-6 pt-16 pb-20 text-left">
        <div className="mx-auto max-w-6xl flex flex-col items-start gap-12 lg:flex-row lg:items-center">
          <div className="flex size-28 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <GraduationCap size={48} />
          </div>
          <div className="flex-1 space-y-6">
            <span className="rounded-full bg-blue-50 border-2 border-blue-100 px-4 py-1 text-[10px] font-black uppercase text-blue-600 italic tracking-widest">
              Program {training?.is_online ? "Daring (Online)" : "Luring (Offline)"}
            </span>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl text-slate-900 leading-none">
              {training?.title}
            </h1>
            <div className="flex flex-wrap items-center gap-8 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg"><Building2 size={18} /></div>
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 leading-none">Penyelenggara</p>
                  <span className="text-sm font-black uppercase italic">{partner?.name || "Mitra"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-blue-600" />
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 leading-none">Lokasi Pelaksanaan</p>
                  <span className="text-sm font-black uppercase italic">{training?.is_online ? "Seluruh Indonesia (Remote)" : (training?.location || "Lokasi Global")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20 text-left grid grid-cols-1 gap-16 lg:grid-cols-3 font-sans">
        <div className="lg:col-span-2 space-y-20">
          <section aria-labelledby="desc-heading" className="space-y-6">
            <h2 id="desc-heading" className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              <FileText className="text-blue-600" size={32} /> Tentang Program
            </h2>
            <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-xl font-medium italic leading-relaxed text-slate-700 shadow-sm whitespace-pre-line">
              {training?.description}
            </div>
          </section>

          {skills?.length > 0 && (
            <section aria-labelledby="skill-heading" className="space-y-8">
              <h2 id="skill-heading" className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                <Target className="text-blue-600" size={32} /> Skill Yang Didapat
              </h2>
              <div className="flex flex-wrap gap-4">
                {skills.map((s: string) => (
                  <div key={s} className="rounded-2xl border-2 border-slate-900 bg-white px-6 py-4 text-xs font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-transform hover:-translate-y-1">
                    <Zap size={16} className="inline mr-2 text-blue-600 fill-blue-600" /> {s}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="syllabus-heading" className="space-y-8">
            <h2 id="syllabus-heading" className="flex items-center gap-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              <BookOpen className="text-blue-600" size={32} /> Kurikulum Pembelajaran
            </h2>
            <div className="grid gap-4">
              {training?.syllabus?.split('\n').filter((s: string) => s.trim() !== "").map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-6 rounded-3xl border-2 border-slate-50 bg-white p-6 hover:border-blue-600 transition-all group shadow-sm">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white group-hover:bg-blue-600 transition-colors">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-black uppercase italic text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <section aria-labelledby="reg-heading" className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl border-t-[12px] border-blue-600">
            <h2 id="reg-heading" className="mb-8 flex items-center gap-2 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest italic text-blue-400 leading-none">
              <Clock size={16} /> Panel Pendaftaran
            </h2>
            
            <div className="space-y-6">
              {errorMessage && (
                <div ref={errorRef} tabIndex={-1} role="alert" className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-[10px] font-bold text-red-400 outline-none">
                  <AlertTriangle size={16} className="shrink-0" />
                  <p>Gagal Mendaftar: {errorMessage}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-left">
                  <p className="text-[8px] font-black uppercase opacity-60 mb-1 italic leading-none">Masa Pendaftaran</p>
                  <p className="text-[11px] font-bold text-emerald-400 leading-tight">BUKA: {formatFullDate(training?.registration_start)}</p>
                  <p className="text-[11px] font-bold text-red-400 uppercase leading-tight">TUTUP: {formatFullDate(training?.registration_deadline)}</p>
                </div>

                {!isExpired ? (
                  <button 
                    onClick={handleRegister} 
                    disabled={isSubmitting}
                    aria-label={isSubmitting ? "Sedang memproses pendaftaran" : "Klik untuk mendaftar pelatihan ini sekarang"}
                    className="w-full rounded-2xl bg-blue-600 py-6 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {isSubmitting ? "MENYINKRONKAN..." : "DAFTAR SEKARANG"}
                  </button>
                ) : (
                  <div className="rounded-2xl bg-slate-800 p-6 text-center border border-white/10 italic">
                    <p className="text-[10px] font-black uppercase text-slate-500">Masa Pendaftaran Berakhir</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="schedule-heading" className="rounded-[3.5rem] bg-blue-600 p-10 text-white shadow-xl space-y-8 text-left">
            <h3 id="schedule-heading" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic border-b border-blue-400 pb-4 leading-none">
              <Timer size={16} /> Jadwal Pelaksanaan
            </h3>
            <div className="space-y-4">
              <p className="text-base font-black italic uppercase leading-tight">
                {formatFullDate(training?.start_date)} - {formatFullDate(training?.end_date)}
              </p>
              {training?.start_time && (
                <div className="border-t border-blue-400 pt-4">
                   <p className="text-[8px] font-black uppercase opacity-60 mb-1 leading-none italic">Waktu Belajar (WIB)</p>
                   <p className="text-xl font-black italic">{training.start_time.substring(0, 5)} - {training.end_time?.substring(0, 5)}</p>
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="inclusion-heading" className="rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] space-y-8 text-left">
            <h3 id="inclusion-heading" className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-slate-900 leading-none">
              <Accessibility className="text-blue-600" size={24} /> Fasilitas Inklusi
            </h3>
            <ul className="space-y-4" aria-label="Akomodasi yang disediakan oleh penyelenggara">
              {accommodations?.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 p-4 shadow-sm transition-all hover:bg-white">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-[11px] font-black uppercase text-emerald-950 italic leading-tight">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </main>
    </>
  );
}