import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  Calendar, MapPin, BookOpen, ShieldCheck, 
  CheckCircle2, Clock, Users, ArrowLeft, 
  Globe, Zap, FileText, Share2, Building2
} from "lucide-react";
import Link from "next/link";

// --- SEO & CANONICAL ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: training } = await supabase
    .from("trainings")
    .select("title, category, partner_id, partners(name)")
    .eq("id", params.id)
    .single();

  if (!training) return { title: "Pelatihan Tidak Ditemukan" };

  const partnerName = (training.partners as any)?.name || "Partner";

  return {
    title: `${training.title} | Program Pelatihan ${partnerName} - Disabilitas.com`,
    description: `Ikuti program ${training.category} inklusif: ${training.title} yang diselenggarakan oleh ${partnerName} untuk meningkatkan potensi talenta disabilitas.`,
    alternates: {
      canonical: `https://disabilitas.com/pelatihan/${params.id}`,
    },
  };
}

export default async function TrainingDetail({ params }: { params: { id: string } }) {
  // 1. Fetch Data Pelatihan & Partner (Join)
  const { data: training } = await supabase
    .from("trainings")
    .select(`
      *,
      partners (
        id,
        name,
        location,
        inclusion_score,
        category
      )
    `)
    .eq("id", params.id)
    .single();

  if (!training) notFound();

  const partner = training.partners as any;
  const isExpired = new Date(training.end_date || '') < new Date();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* HEADER NAVIGATION */}
      <div className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/pelatihan" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 hover:text-blue-600 transition-colors">
            <ArrowLeft size={16} /> Kembali ke Jelajah Pelatihan
          </Link>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-slate-900 transition-colors" title="Bagikan">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* HERO SECTION - Bold & Informative */}
      <header className="bg-white px-4 pt-12 pb-16 border-b-2 border-slate-100">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Branding Institusi */}
            <div className="shrink-0">
              <div className="flex size-24 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-2xl">
                <GraduationCap size={44} />
              </div>
            </div>

            <div className="flex-1 space-y-4 text-left">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-600 px-4 py-1 text-[9px] font-black uppercase text-white">
                  {training.category}
                </span>
                {training.is_online && (
                  <span className="rounded-full bg-purple-50 px-4 py-1 text-[9px] font-black uppercase text-purple-600 border border-purple-100">
                    Online / Daring
                  </span>
                )}
                {isExpired && (
                  <span className="rounded-full bg-red-50 px-4 py-1 text-[9px] font-black uppercase text-red-600 border border-red-100 italic">
                    Pendaftaran Ditutup
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
                {training.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <Link href={`/partner/${partner.id}`} className="group flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Building2 size={16} />
                  </div>
                  <span className="text-xs font-black uppercase italic tracking-tight border-b-2 border-transparent group-hover:border-blue-600 transition-all">
                    {partner.name}
                  </span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                  <MapPin size={16} className="text-blue-600" /> {training.is_online ? "Seluruh Indonesia" : training.location}
                </div>
              </div>
            </div>

            {/* Quick Action Card */}
            <div className="w-full md:w-auto">
              {!isExpired ? (
                <button className="flex w-full md:w-auto items-center justify-center gap-4 rounded-3xl bg-slate-900 px-10 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:bg-blue-600 hover:-translate-y-1">
                  <Zap size={20} /> Daftar Sekarang
                </button>
              ) : (
                <div className="rounded-3xl bg-slate-100 px-10 py-6 text-center">
                  <p className="text-[10px] font-black uppercase text-slate-400">Batch ini telah berakhir</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* CONTENT GRID */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          
          {/* LEFT: DETAIL & SYLLABUS */}
          <div className="lg:col-span-2 space-y-12 text-left">
            {/* Deskripsi & Tujuan */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                <FileText size={20} /> Deskripsi & Tujuan Program
              </h2>
              <div className="prose prose-slate max-w-none text-lg font-medium leading-relaxed text-slate-700 italic">
                {training.description || "Institusi belum memberikan deskripsi detail untuk program ini."}
              </div>
            </section>

            {/* Silabus / Materi */}
            <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
              <h2 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                <BookOpen size={20} className="text-blue-600" /> Kurikulum Pengembangan
              </h2>
              <div className="grid gap-6">
                {training.syllabus?.split('\n').map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 border-b border-slate-50 pb-4 last:border-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
                      {idx + 1}
                    </span>
                    <p className="text-[13px] font-bold text-slate-700 uppercase leading-tight tracking-tight">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Skema Kompetensi (Provided Skills) */}
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                <Zap size={20} className="text-amber-500" /> Kompetensi yang Didapat
              </h2>
              <div className="flex flex-wrap gap-2">
                {training.provided_skills?.map((skill: string) => (
                  <span key={skill} className="rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 border-2 border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: ACCESSIBILITY & AUDIT (Inclusion Guarantee) */}
          <div className="space-y-8">
            {/* Timeline & Info Card */}
            <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Clock size={16} /> Informasi Pelaksanaan
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-400 leading-none">Masa Program</p>
                    <p className="mt-1 text-xs font-black uppercase">
                      {new Date(training.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(training.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase text-slate-400 leading-none">Target Disabilitas</p>
                    <p className="mt-1 text-xs font-black uppercase leading-tight">
                      {training.target_disability?.join(', ') || "Semua Ragam"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIT INKLUSI PELATIHAN (BEDA DARI PROFIL PARTNER) */}
            <div className="rounded-[3rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
              <div className="mb-6 flex items-center gap-3">
                <ShieldCheck className="text-emerald-400" size={24} />
                <h3 className="text-xs font-black uppercase italic tracking-widest text-white">Inclusion Guarantee</h3>
              </div>
              <p className="mb-6 text-[10px] font-medium leading-relaxed text-slate-400">
                Akomodasi khusus yang disediakan penyelenggara selama pelatihan berlangsung:
              </p>
              <div className="space-y-3">
                {training.training_accommodations?.map((acc: string) => (
                  <div key={acc} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 border border-white/10">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span className="text-[9px] font-black uppercase tracking-tight text-slate-200">{acc}</span>
                  </div>
                ))}
                {(!training.training_accommodations || training.training_accommodations.length === 0) && (
                  <p className="text-[9px] italic text-slate-500">Kontak penyelenggara untuk akomodasi khusus.</p>
                )}
              </div>
            </div>

            {/* Info Institusi Penyelenggara */}
            <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-8 text-left">
              <p className="mb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Penyelenggara Program</p>
              <div className="space-y-4">
                <h4 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 leading-tight">
                  {partner.name}
                </h4>
                <div className="flex items-center gap-2 rounded-full bg-emerald-100/50 px-3 py-1 text-[8px] font-black uppercase text-emerald-700 w-fit">
                  <ShieldCheck size={10} /> Skor Inklusi: {partner.inclusion_score}%
                </div>
                <Link 
                  href={`/partner/${partner.id}`}
                  className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 text-[9px] font-black uppercase italic text-slate-900 shadow-sm transition-all hover:bg-slate-900 hover:text-white"
                >
                  Lihat Profil Institusi <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Share & Report */}
            <div className="flex flex-col gap-4">
              <button className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors">
                <Share2 size={14} /> Bagikan Program Ini
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
