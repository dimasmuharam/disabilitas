import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { 
  User, GraduationCap, Briefcase, Award, MapPin, 
  Linkedin, Globe, FileText, Youtube, CheckCircle2 
} from "lucide-react"

export const revalidate = 60 // Refresh data setiap menit

async function getTalentProfile(id: string) {
  const { data } = await supabase
    .from('profiles')
    .select('*, certifications(*)')
    .eq('id', id)
    .single()
  return data
}

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getTalentProfile(params.id)

  if (!profile) return notFound()

  // Extract YouTube ID untuk Embed jika ada
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }
  const videoId = profile.video_intro_url ? getYoutubeId(profile.video_intro_url) : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* HEADER / BANNER AREA */}
      <div className="bg-slate-900 text-white pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl font-black mb-6 shadow-2xl border-4 border-white/10">
            {profile.full_name?.substring(0, 2).toUpperCase()}
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            {profile.full_name}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-black uppercase tracking-widest text-blue-300">
              #{profile.disability_type}
            </span>
            <span className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-400"/> Verified Talent
            </span>
          </div>
          <p className="text-slate-400 font-medium flex items-center gap-2 uppercase tracking-widest text-xs">
            <MapPin size={14}/> {profile.city || "Indonesia"}
          </p>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-20 space-y-8">
        
        {/* VIDEO INTRO SECTION (If available) */}
        {videoId && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-inner">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}`} 
                title="Video Perkenalan Diri"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <p className="mt-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Youtube size={16} className="text-red-600"/> Video Perkenalan Profesional
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* KIRI: DETAIL UTAMA */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
                <Briefcase size={18}/> Keahlian & Kompetensi
              </h2>
              <div className="flex flex-wrap gap-3">
                {profile.skills?.map((skill: string) => (
                  <span key={skill} className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 mb-8 flex items-center gap-2">
                <GraduationCap size={20}/> Latar Belakang Pendidikan
              </h2>
              <div className="space-y-6">
                <div className="relative pl-6 border-l-4 border-purple-100 dark:border-slate-800">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{profile.education_level}</p>
                  <h3 className="text-xl font-black tracking-tight">{profile.university}</h3>
                  <p className="text-sm text-slate-500 font-medium">{profile.education_model} • Lulus Tahun {profile.graduation_year || "-"}</p>
                </div>
              </div>
            </section>

            {profile.certifications?.length > 0 && (
              <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-orange-600 mb-8 flex items-center gap-2">
                  <Award size={20}/> Sertifikasi & Pelatihan
                </h2>
                <div className="grid gap-4">
                  {profile.certifications.map((cert: any) => (
                    <div key={cert.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <h3 className="font-black text-sm uppercase mb-1">{cert.name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cert.issuing_organization}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* KANAN: KONTAK & AKOMODASI */}
          <div className="space-y-6">
            <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Hubungi Talenta</h2>
              <div className="space-y-4">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                    <Linkedin size={18} className="text-blue-400"/>
                    <span className="text-xs font-black uppercase tracking-widest">LinkedIn</span>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                    <Globe size={18} className="text-emerald-400"/>
                    <span className="text-xs font-black uppercase tracking-widest">Portfolio</span>
                  </a>
                )}
                {profile.resume_url && (
                  <a href={profile.resume_url} target="_blank" className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                    <FileText size={18} className="text-red-400"/>
                    <span className="text-xs font-black uppercase tracking-widest">Download CV</span>
                  </a>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2 tracking-widest">Preferensi Komunikasi</p>
                <p className="text-sm font-bold italic text-blue-400">{profile.communication_preference || "WhatsApp"}</p>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Aksesibilitas Kerja</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Alat Bantu</p>
                  <p className="text-xs font-bold">{profile.used_assistive_tools?.join(", ") || "-"}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Akomodasi</p>
                  <p className="text-xs font-bold">{profile.preferred_accommodations?.join(", ") || "Standar"}</p>
                </div>
              </div>
            </section>

            <div className="p-6 text-center">
              <img src="/logo.png" alt="Disabilitas.com" className="h-6 opacity-30 mx-auto grayscale" />
              <p className="text-[8px] font-black text-slate-400 uppercase mt-2 tracking-[0.2em]">Verified Talent ID: {profile.id.substring(0,8)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
