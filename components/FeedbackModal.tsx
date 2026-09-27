'use client';

import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeId?: string;
  routeName?: string;
}

export function FeedbackModal({
  isOpen,
  onClose,
  routeId = 'MTR-BLU-01',
  routeName = 'Metro Blue Line (Rapid Transit)',
}: FeedbackModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [crowdFeedback, setCrowdFeedback] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [delayFeedbackMinutes, setDelayFeedbackMinutes] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [punctualityRating, setPunctualityRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId,
          routeName,
          rating,
          crowdFeedback,
          delayFeedbackMinutes,
          cleanlinessRating,
          punctualityRating,
          comment,
          userName: user?.name || 'Commuter',
          userEmail: user?.email || '',
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 2000);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feedback Received!</h3>
            <p className="text-xs text-slate-500">
              Thank you! Your commute ratings help refine AI recommendation scoring and crowd models.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Commuter Feedback
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Rate Your Trip on {routeName}
              </h3>
              <p className="text-xs text-slate-500">
                Help fellow commuters with real-time crowd and punctuality ratings
              </p>
            </div>

            {/* Overall Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Overall Experience Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 text-amber-400 focus:outline-none"
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Crowd Level Feedback */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Actual Crowd Level Encountered
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: '🟢 Low (Seats)', desc: 'Empty seats' },
                  { id: 'moderate', label: '🟡 Moderate', desc: 'Comfortable stand' },
                  { id: 'high', label: '🔴 High (Packed)', desc: 'Heavy rush' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCrowdFeedback(item.id as any)}
                    className={`p-2 rounded-xl text-left border text-xs font-medium transition-all ${
                      crowdFeedback === item.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Delays experienced */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Delay experienced (Minutes)
                </label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {delayFeedbackMinutes === 0 ? 'On Time (0 min)' : `+${delayFeedbackMinutes} mins`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="2"
                value={delayFeedbackMinutes}
                onChange={(e) => setDelayFeedbackMinutes(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Comments */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Share any insights about AC, seating, platform crowd or punctuality..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Trip Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;
