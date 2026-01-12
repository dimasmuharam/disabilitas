import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  Calendar, MapPin, BookOpen, ShieldCheck, 
  CheckCircle2, Clock, Users, ArrowLeft, 
  Globe, Zap, FileText, Share2, Building2,
  GraduationCap, ArrowRight
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: training } = await supabase
    .from("trainings")
    .select("title, category, partners(name)")
    .eq("id", params.id)
    .single();

  if (!training) return { title: "Pelatihan Tidak Ditemukan" };
  const partnerName = (training.partners as any)?.name || "Partner";

  return {
    title: `${training.title} | Program Pelatihan ${partnerName} - Disabilitas.com`,
    description: `Ikuti program ${training.category} inklusif: ${training.title} yang diselenggarakan oleh ${partnerName}.`,
    alternates: { canonical: `https://disabilitas.com/pelatihan/${params.id}` },
  };
}

export default async function TrainingDetail({ params }: { params: { id: string } }) {
  const { data: training } = await supabase
    .from("trainings")
    .select("*, partners(id, name, location, inclusion_score, category)")
    .eq("id", params.id)
    .single();

  if (!training) notFound();
  const partner = training.partners as any;
  const isExpired = new Date(training.end_date || '') < new Date();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 font-sans">
      <div className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 p-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/pelatihan" className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400 transition-colors hover:text-blue-600">
            <ArrowLeft size={16} /> Kembali ke Jelajah Pelatihan
          </Link>
          <button className="text-slate-400 transition-colors hover:text-slate-900"><Share2 size={18} /></button>
        </div>
      </div>

      <header className="border-b-2 border-slate-100 bg-white px-4 pt-12 pb-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-start gap-10 md:flex-row">
            <div className="shrink-0">
              <div className="flex size-24 items-center justify-center rounded-[2rem] bg-slate-900 text-white shadow-2xl">
                <GraduationCap size={44} />
              </div>
            </div>
            <div className="flex-1 space-y-4 text-left">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-600 px-4 py-1 text-[9px] font-black uppercase text-white">{training.category}</span>
                {training.is_online && <span className="rounded-full border border-purple-100 bg-purple-50 px-4 py-1 text-[9px] font-black uppercase text-purple-600">Online</span>}
              </div>
              <h1 className="text-4xl font-black uppercase italic leading-tight tracking-tighter md:text-5xl">{training.title}</h1>
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <Link href={`/partner/${partner.id}`} className="group flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-900 transition-colors group-hover:bg-blue-600 group-hover:text-white"><Building2 size={16} /></div>
                  <span className="border-b-2 border-transparent text-xs font-black uppercase italic tracking-tight transition-all group-hover:border-blue-600">{partner.name}</span>
                </Link>
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400"><MapPin size={16} className="text-blue-600" /> {training.is_online ? "Seluruh Indonesia" : training.location}</div>
              </div>
            </div>
            <div className="w-full md:w-auto">
              {!isExpired ? (
                <button className="flex w-full items-center justify-center gap-4 rounded-3xl bg-slate-900 px-10 py-6 text-sm font-black uppercase italic tracking-widest text-white shadow-2xl transition-all hover:-translate-y-1 hover:bg-blue-600 md:w-auto">
                  <Zap size={20} /> Daftar Sekarang
                </button>
              ) : (
                <div className="rounded-3xl bg-slate-100 px-10 py-6 text-center"><p className="text-[10px] font-black uppercase text-slate-400">Batch Berakhir</p></div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="space-y-12 text-left lg:col-span-2">
            <section className="space-y-4">
              <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600"><FileText size={20} /> Deskripsi Program</h2>
              <div className="max-w-none text-lg font-medium italic leading-relaxed text-slate-700">{training.description}</div>
            </section>
            <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
              <h2 className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900"><BookOpen size={20} className="text-blue-600" /> Kurikulum</h2>
              <div className="grid gap-6">
                {training.syllabus?.split('\n').map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 border-b border-slate-50 pb-4 last:border-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">{idx + 1}</span>
                    <p className="text-[13px] font-bold uppercase leading-tight tracking-tight text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Clock size={16} /> Pelaksanaan</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Calendar size={20} /></div>
                  <div><p className="text-[8px] font-black uppercase text-slate-400">Masa Program</p><p className="mt-1 text-xs font-black uppercase">{new Date(training.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(training.end_date).toLocaleDateString('id-ID', { year: 'numeric' })}</p></div>
                </div>
              </div>
            </div>
            <div className="rounded-[3rem] bg-slate-900 p-8 text-left text-white shadow-2xl">
              <div className="mb-6 flex items-center gap-3"><ShieldCheck className="text-emerald-400" size={24} /><h3 className="text-xs font-black uppercase italic tracking-widest">Inclusion Guarantee</h3></div>
              <div className="space-y-3">
                {training.training_accommodations?.map((acc: string) => (
                  <div key={acc} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"><CheckCircle2 size={14} className="shrink-0 text-emerald-400" /><span className="text-[9px] font-black uppercase tracking-tight text-slate-200">{acc}</span></div>
                ))}
              </div>
            </div>
            <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-8 text-left">
              <p className="mb-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Penyelenggara</p>
              <h4 className="text-lg font-black uppercase italic leading-tight tracking-tighter">{partner.name}</h4>
              <Link href={`/partner/${partner.id}`} className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 text-[9px] font-black uppercase italic text-slate-900 shadow-sm transition-all hover:bg-slate-900 hover:text-white">
                Profil Institusi <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
