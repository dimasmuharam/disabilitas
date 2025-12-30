import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { 
  User, GraduationCap, Briefcase, Award, MapPin, 
  Linkedin, Globe, FileText, Youtube, CheckCircle, 
  Building2, Calendar, ShieldCheck, Mail, MessageSquare
} from "lucide-react"

export const runtime = 'edge';
export const revalidate = 60 

/**
 * GENERATE METADATA & CANONICAL 
 * Sesuai instruksi untuk optimasi SEO dan identitas website.
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, disability_type')
    .eq('id', params.id)
    .single()

  if (!profile) return {}

  return {
    title: `${profile.full_name} | Profil Profesional Talenta Inklusif`,
    description: `Lihat profil profesional ${profile.full_name}, talenta ${profile.disability_type} di disabilitas.com. Pelajari keahlian dan rekam jejak karirnya.`,
    alternates: {
      canonical: `https://www.disabilitas.com/talent/${params.id}`,
    },
  }
}

async function getTalentProfile(id: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*, certifications(*), work_experiences(*)')
    .eq('id', id)
    .single()
  return data
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getTalentProfile(params.id)

  if (!profile) return notFound()

  // Helper untuk Video Intro
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }
  const videoId = profile.video_intro_url ? getYoutubeId(profile.video_intro_url) : null

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HEADER / BANNER AREA */}
      <div className="bg-slate-900 text-white pt-24 pb-36 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black mb-6 shadow-2xl border-4 border-white/10 uppercase">
            {profile.full_name?.substring(0, 2)}
          </div>
          
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 leading-none flex items-center gap-3">
            {profile.full_name}
            {/* Hanya tampil jika sudah diverifikasi Admin (Mas Dimas) */}
            {profile.is_verified && (
              <ShieldCheck size={32} className="text-blue-400 fill-blue-400/20" />
            )}
          </h1>

          <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center gap-2">
            <Briefcase size={14}/> {profile.career_status || "Talenta Inklusif"}
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-300">
              {"#"}{profile.disability_type}
            </span>
            {profile.is_verified && (
              <span className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <CheckCircle size={14} className="text-green-400"/> {"Verified Profile"}
              </span>
            )}
          </div>

          <p className="text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
            <MapPin size={14} className="text-blue-500"/> {profile.city || "Indonesia"}
          </p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-20 space-y-8">
        
        {/* VIDEO SECTION */}
        {videoId && (
          <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl border border-slate-200">
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner bg-black">
              <iframe 
                width="100%" height="100%" 
                src={`https://www.youtube.com/embed/${videoId}`} 
                title="Video Perkenalan" frameBorder="0" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            
            {/* PENGALAMAN KERJA */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
                <Briefcase size={18}/> {"Riwayat Karir & Profesional"}
              </h2>
              <div className="space-y-8">
                {profile.work_experiences?.length > 0 ? profile.work_experiences.map((work: any) => (
                  <div key={work.id} className="relative pl-8 border-l-2 border-slate-100">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                    <h3 className="text-lg font-black uppercase tracking-tight leading-none mb-1">{work.position}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold mb-2">
                      <Building2 size={12}/> {work.company_name}
                      {work.is_current_work && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[8px] font-black uppercase">{"Aktif"}</span>
                      )}
                    </div>
                    {work.description && <p className="text-sm text-slate-600 leading-relaxed">{work.description}</p>}
                  </div>
                )) : (
                  <p className="text-sm italic text-slate-400 uppercase font-medium tracking-widest">{"Belum ada riwayat pekerjaan yang ditampilkan."}</p>
                )}
              </div>
            </section>

            {/* SKILLS */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6 flex items-center gap-2">
                <Award size={18}/> {"Keahlian & Spesialisasi"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill: string) => (
                  <span key={skill} className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-black text-slate-700 uppercase tracking-tighter border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* PENDIDIKAN - SINKRONISASI DATA RISET */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 mb-6 flex items-center gap-2">
                <GraduationCap size={20}/> {"Latar Belakang Pendidikan"}
              </h2>
              <div className="relative pl-6 border-l-4 border-purple-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{profile.education_level}</p>
                <h3 className="text-xl font-black tracking-tight uppercase leading-none">{profile.university}</h3>
                {/* Menampilkan Jurusan (Major) */}
                <p className="text-blue-600 font-bold uppercase text-xs mt-1">{profile.major || "General Studies"}</p>
                <p className="text-xs text-slate-500 font-bold mt-3 italic">
                  {"Model Pendidikan: "}{profile.education_model}
                </p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* CONTACT & LINKS (PRIVACY PROTECTED) */}
            <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-6">{"Hubungi Profesional"}</h2>
              <div className="space-y-3">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                    <Linkedin size={18} className="text-blue-400"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{"LinkedIn"}</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                    <Globe size={18} className="text-emerald-400"/>
                    <span className="text-[10px] font-black uppercase tracking-widest">{"Portfolio"}</span>
                  </a>
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-widest">{"Metode Komunikasi"}</p>
                <p className="text-xs font-bold italic text-blue-400">
                  {profile.communication_preference || "Hubungi via Dashboard"}
                </p>
              </div>
            </section>

            {/* AKOMODASI & AKSES - SINKRON ARRAY */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6">{"Akomodasi & Akses"}</h2>
              <div className="space-y-5">
                <div>
                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1 tracking-widest">{"Alat Bantu Asistif"}</p>
                  <p className="text-xs font-bold leading-relaxed italic">
                    {Array.isArray(profile.used_assistive_tools) && profile.used_assistive_tools.length > 0 
                      ? profile.used_assistive_tools.join(", ") 
                      : "Informasi Tidak Tersedia"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1 tracking-widest">{"Preferensi Kerja"}</p>
                  <p className="text-xs font-bold leading-relaxed">{profile.work_preference || "Fleksibel"}</p>
                </div>
              </div>
            </section>

            {/* FOOTER INFO */}
            <div className="text-center px-6">
              <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">{"DISABILITAS.COM PROFESSIONAL ID"}</p>
              <p className="text-[6px] text-slate-400 italic leading-tight">
                {"Seluruh data yang ditampilkan telah melalui persetujuan (Informed Consent) talenta terkait untuk keperluan pengembangan karir inklusif."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
