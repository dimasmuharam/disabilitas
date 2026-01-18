import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, MapPin, Building2, Users2, 
  MessageSquare, Globe, ArrowUpRight, Award, Info 
} from "lucide-react";

// KONFIGURASI EDGE RUNTIME (PENTING AGAR CEPAT & HEMAT RESOURCE)
export const runtime = "edge";

interface Props {
  params: { id: string };
}

// 1. GENERATE METADATA (SEO FRIENDLY)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: gov } = await supabase
    .from("government")
    .select("name, location")
    .eq("id", params.id)
    .single();

  const title = `${gov?.name || 'Unit Layanan Disabilitas'} - Portal Karir Inklusif`;
  const description = `Profil resmi ${gov?.name} di ${gov?.location}. Pantau statistik penyerapan tenaga kerja disabilitas dan kemitraan industri inklusif secara real-time.`;

  return {
    title,
    description,
    keywords: [`ULD ${gov?.location}`, "Kerja Disabilitas", "Ekosistem Inklusi", "Pemerintah Inklusif"],
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

// 2. MAIN COMPONENT (SERVER COMPONENT BY DEFAULT)
export default async function GovernmentPublicProfile({ params }: Props) {
  // Fetch Data Instansi
  const { data: govData } = await supabase
    .from("government")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!govData) return <div className="p-20 text-center font-black">PROFIL TIDAK DITEMUKAN</div>;

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 selection:bg-blue-200">
      
      {/* HEADER SECTION */}
      <header className="relative border-b-8 border-slate-900 bg-blue-600 py-24 text-white shadow-[0_8px_0_0_rgba(15,23,42,1)]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-end">
            {/* Logo Instansi */}
            <div className="size-40 shrink-0 rounded-[3rem] border-4 border-slate-900 bg-white p-6 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
              <img 
                src={govData.official_seal_url || "/gov-placeholder.png"} 
                alt={`Stempel Resmi ${govData.name}`} 
                className="size-full object-contain text-slate-300"
              />
            </div>
            
            <div className="text-center md:text-left">
              <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
                <div className="rounded-full bg-emerald-400 p-1 text-slate-900">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100">
                  Verified Government Authority
                </span>
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter md:text-7xl">
                {govData.name}
              </h1>
              <div className="mt-6 flex flex-wrap justify-center gap-6 md:justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-blue-700/50 px-4 py-2 text-sm font-bold">
                  <MapPin size={18} className="text-emerald-400" /> {govData.location}
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-blue-700/50 px-4 py-2 text-sm font-bold">
                  <Globe size={18} className="text-emerald-400" /> ID: {govData.location_id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STATISTIC GRID */}
      <section className="container mx-auto -mt-12 px-6" aria-label="Statistik Publik">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <StatCard label="Talenta Terdaftar" value="---" color="bg-white" />
          <StatCard label="Mitra Perusahaan" value="---" color="bg-white" />
          <StatCard label="Loker Inklusif" value="---" color="bg-white" />
          <StatCard label="Wilayah Otoritas" value={govData.location} color="bg-emerald-400" />
        </div>
      </section>

      {/* BODY CONTENT */}
      <div className="container mx-auto grid gap-16 px-6 py-24 md:grid-cols-3">
        
        {/* Deskripsi Otoritas */}
        <article className="space-y-12 md:col-span-2">
          <section>
            <h2 className="mb-8 flex items-center gap-3 text-3xl font-black uppercase italic tracking-tight">
              <Info className="text-blue-600" size={32} /> Tentang Otoritas
            </h2>
            <div className="border-l-8 border-slate-100 pl-8 text-xl font-medium italic leading-relaxed text-slate-600">
              {govData.description || "Instansi ini belum memperbarui deskripsi publik."}
            </div>
          </section>

          <section className="rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(59,130,246,1)]">
            <h3 className="mb-4 flex items-center gap-3 text-2xl font-black uppercase italic">
              <Award className="text-blue-400" /> Mandat Inklusi
            </h3>
            <p className="text-lg leading-relaxed opacity-80">
              Berdasarkan mandat yurisdiksi {govData.location}, {govData.name} mengawasi dan memfasilitasi pemenuhan hak atas pekerjaan bagi penyandang disabilitas sesuai dengan regulasi nasional.
            </p>
          </section>
        </article>

        {/* Kontak Sidebar */}
        <aside className="sticky top-10 h-fit space-y-8">
          <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
            <h3 className="mb-8 text-xl font-black uppercase italic tracking-widest text-slate-400">Hubungi Kami</h3>
            
            <a 
              href={`https://wa.me/${govData.whatsapp_official}`}
              className="group flex items-center justify-between rounded-2xl border-4 border-slate-900 bg-emerald-400 p-5 shadow-none transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-0"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="text-slate-900" />
                <span className="font-black uppercase italic text-slate-900">WhatsApp ULD</span>
              </div>
              <ArrowUpRight size={20} className="text-slate-900 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>

            <div className="mt-8 border-t-2 border-slate-100 pt-8">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Email Korespondensi</p>
              <p className="break-all font-bold text-slate-900">{govData.email || 'Belum tersedia'}</p>
            </div>
          </div>
          
          <div className="cursor-default p-6 text-center opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0">
             <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Data Partner</p>
             <p className="font-black italic text-slate-900">RESEARCH ECOSYSTEM BRIN</p>
          </div>
        </aside>

      </div>
    </main>
  );
}

// Reusable Stat Card Component
function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div className={`rounded-3xl border-4 border-slate-900 ${color} p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]`}>
      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter text-slate-900">{value}</p>
    </div>
  );
}