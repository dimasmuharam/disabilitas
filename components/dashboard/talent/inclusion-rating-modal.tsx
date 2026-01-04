"use client";

import React, { useState } from "react";
import { Star, Send, X } from "lucide-react";
import { postInclusionRating } from "@/lib/actions/ratings";
import { INCLUSION_RATING_QUESTIONS } from "@/lib/data-static";

interface RatingModalProps {
  job: any;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InclusionRatingModal({ job, userId, onClose, onSuccess }: RatingModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({
    score_accessibility: 0,
    score_culture: 0,
    score_management: 0,
    score_onboarding: 0
  });
  const [comment, setComment] = useState("");
  const [issubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (Object.values(ratings).some(v => v === 0)) {
      alert("Mohon isi semua kriteria penilaian.");
      return;
    }

    setIsSubmitting(true);
    const result = await postInclusionRating({
      talentId: userId,
      companyId: job.jobs.company_id,
      jobId: job.id,
      accessibility: ratings.score_accessibility,
      culture: ratings.score_culture,
      management: ratings.score_management,
      onboarding: ratings.score_onboarding,
      comment: comment
    });

    if (result.success) {
      onSuccess();
    } else {
      alert(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[3rem] border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{"Audit Inklusi"}</h3>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{(job.jobs as any)?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {INCLUSION_RATING_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{q.label}</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatings(prev => ({ ...prev, [q.id]: star }))}
                    className={`p-2 rounded-xl transition-all ${ratings[q.id] >= star ? "bg-blue-600 text-white shadow-md" : "bg-slate-50 text-slate-300 border border-slate-100"}`}
                  >
                    <Star size={20} fill={ratings[q.id] >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2 pt-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{"Kesan Tambahan (Opsional & Anonim)"}</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-slate-100 text-sm italic focus:border-blue-600 outline-none"
              placeholder="Tuliskan pengalaman Anda..."
              rows={3}
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t-2 border-slate-100">
          <button 
            onClick={handleSubmit}
            disabled={issubmitting}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-blue-600 transition-all"
          >
            {issubmitting ? "MENGIRIM..." : <><Send size={18}/> {"Kirim Penilaian"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
