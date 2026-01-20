import { Metadata } from "next";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, MapPin, Building2, 
  MessageSquare, Globe, ArrowUpRight, Award, Info,
  BookOpen, Scale
} from "lucide-react";

export const runtime = "edge";

interface Props {
  params: { id: string };
}

// 1. GENERATE METADATA (Fokus pada Branding Otoritas)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: gov } = await supabase
    .from("government")
    .select("name, category")
    .eq("id", params.id)
    .single();

  const title = `${gov?.name} - Otoritas Sektoral Inklusi Disabilitas`;
  const description = `Profil resmi ${gov?.name}. Informasi otoritas, kebijakan sektoral, dan komitmen pelayanan inklusi disabilitas nasional.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function GovernmentPublicProfile({ params }: Props) {
  // Hanya ambil data dari tabel government (Data Statis/Profil)
  const { data: govData } = await supabase
    .from("government")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!govData) return <div className="p-20 text-center font-black">PROFIL TIDAK DITEMUKAN</div>;

  const isPusat = govData.location === "Nasional" || govData.category === "Kementerian/Lembaga";

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900">
      
      {/* HEADER: Fokus pada Identitas Instansi */}
      <header className="relative border-b-8 border-slate-900 bg-indigo-700 py-24 text-white shadow-[0_8px_0_0_rgba(15,23,42,1)]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-end">
            <div className="size-44 shrink-0 rounded-[3rem] border-4 border-slate-900 bg-white p-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
              <Image 
                src={govData.official_seal_url || "/gov-placeholder.png"} 
                alt={`Stempel Resmi ${govData.name}`} 
                width={176}
                height={176}
                className="size-full object-contain"
              />
            </div>
            
            <div className="text-center md:text-left">
              <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">
                   {govData.category} Verified
                </span>
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter md:text-7xl">
                {govData.name}
              </h1>
              <div className="mt-6 flex flex-wrap justify-center gap-4 md:justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-indigo-800/50 px-4 py-2 text-xs font-black uppercase italic text-indigo-100">
                  <Globe size={16} /> Otoritas {isPusat ? 'Nasional' : 'Sektoral'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STAT CARD: Data Statis/Identitas (Bukan Data Dinamis Database) */}
      <section className="container mx-auto -mt-12 px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard label="Level Layanan" value={govData.category} icon={<Building2 size={16}/>} />
          <StatCard label="Cakupan Kerja" value={govData.location} icon={<MapPin size={16}/>} />
          <StatCard label="Status Verifikasi" value="Sistem Terpadu" icon={<ShieldCheck size={16}/>} />
        </div>
      </section>

      {/* BODY: Deskripsi dan Mandat */}
      <div className="container mx-auto grid gap-16 px-6 py-24 md:grid-cols-3">
        <article className="space-y-12 md:col-span-2">
          <section>
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-black uppercase italic tracking-tight text-indigo-900">
              <Info size={32} /> Deskripsi Layanan
            </h2>
            <div className="border-l-8 border-slate-200 pl-8 text-xl font-medium italic leading-relaxed text-slate-600">
              {govData.description || "Instansi pusat ini belum memperbarui informasi layanan publik."}
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <Scale className="mb-4 text-indigo-600" />
              <h3 className="text-lg font-black uppercase italic">Landasan Hukum</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-400">
                Menjalankan fungsi pengawasan dan fasilitasi sesuai dengan UU No. 8 Tahun 2016 tentang Penyandang Disabilitas.
              </p>
            </div>
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-indigo-900 p-8 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <BookOpen className="mb-4 text-emerald-400" />
              <h3 className="text-lg font-black uppercase italic">Visi Inklusi</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed opacity-70">
                Mendorong terciptanya lingkungan kerja yang adaptif dan suportif bagi talenta disabilitas di sektor publik dan swasta.
              </p>
            </div>
          </div>
        </article>

        {/* SIDEBAR KONTAK */}
        <aside className="sticky top-10 h-fit space-y-6">
          <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-400">Saluran Resmi</h3>
            
            <a 
              href={`https://wa.me/${govData.whatsapp_official}`}
              className="group flex items-center justify-between rounded-2xl border-4 border-slate-900 bg-emerald-400 p-5 shadow-none transition-all hover:bg-emerald-300"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="text-slate-900" />
                <span className="font-black uppercase italic text-slate-900">WhatsApp</span>
              </div>
              <ArrowUpRight size={20} className="text-slate-900" />
            </a>

            <div className="mt-8 space-y-4 border-t-2 border-slate-100 pt-8">
              <div>
                <p className="text-[9px] font-black uppercase italic tracking-widest text-slate-400">Surel Korespondensi</p>
                <p className="break-all font-bold text-slate-900">{govData.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-100 p-6 text-center">
            <Award className="mx-auto mb-2 text-indigo-600" size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Portal</p>
            <p className="text-[10px] font-bold italic text-slate-400">Disabilitas.com Ecosystem</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, color = "bg-white" }: { label: string; value: any; icon: React.ReactNode; color?: string }) {
  return (
    <div className={`rounded-[2rem] border-4 border-slate-900 ${color} p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]`}>
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black italic tracking-tighter text-slate-900">{value}</p>
    </div>
  );
}