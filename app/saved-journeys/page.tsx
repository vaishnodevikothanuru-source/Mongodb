'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Navigation,
  Plus,
  Trash2,
  Edit2,
  Clock,
  IndianRupee,
  Train,
  Bus,
  MapPin,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function SavedJourneysPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [savedList, setSavedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [preferredMode, setPreferredMode] = useState('metro');
  const [departureTimePreference, setDepartureTimePreference] = useState('08:30 AM');
  const [tag, setTag] = useState('Daily Commute');

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/saved-journeys');
      const data = await res.json();
      if (data.savedJourneys) {
        setSavedList(data.savedJourneys);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setOrigin(user?.homeLocation?.name || 'Greenwood Heights');
    setDestination(user?.workLocation?.name || 'Cyber Tech Park');
    setPreferredMode('metro');
    setDepartureTimePreference('08:30 AM');
    setTag('Daily Commute');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditId(item.id || item._id);
    setName(item.name);
    setOrigin(item.origin);
    setDestination(item.destination);
    setPreferredMode(item.preferredMode || 'metro');
    setDepartureTimePreference(item.departureTimePreference || '08:30 AM');
    setTag(item.tags?.[0] || 'Daily Commute');
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/saved-journeys/${id}`, { method: 'DELETE' });
      setSavedList((prev) => prev.filter((s) => s.id !== id && s._id !== id));
    } catch (e) {}
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        // Edit
        await fetch(`/api/saved-journeys/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            origin,
            destination,
            preferredMode,
            departureTimePreference,
            tags: [tag],
          }),
        });
      } else {
        // Add
        await fetch('/api/saved-journeys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name || `${origin} → ${destination}`,
            origin,
            destination,
            preferredMode,
            departureTimePreference,
            tags: [tag],
          }),
        });
      }
      setModalOpen(false);
      await fetchSaved();
    } catch (e) {}
  };

  const handlePlanJourney = (item: any) => {
    const query = new URLSearchParams({
      origin: item.origin,
      destination: item.destination,
      mode: item.preferredMode || 'all',
    }).toString();
    router.push(`/routes?${query}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Personalized Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Saved Journeys & Routines
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Quick 1-click commute planning with real-time crowd and delay alerts for your regular routes.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Save New Journey</span>
          </button>
        </div>

        {/* Saved List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedList.map((item) => {
            const itemId = item.id || item._id;
            return (
              <div
                key={itemId}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">
                      {item.tags?.[0] || 'Daily Commute'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.departureTimePreference || '08:30 AM'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {item.origin} → {item.destination}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span>~{item.estimatedTime || 35} mins</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                      <span>₹{item.estimatedFare || 40}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handlePlanJourney(item)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Plan Journey</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(itemId)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editId ? 'Edit Saved Journey' : 'Save New Journey'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Nickname / Label
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Home → Tech Office"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Origin Station
                </label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Destination Station
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Preferred Mode
                  </label>
                  <select
                    value={preferredMode}
                    onChange={(e) => setPreferredMode(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="metro">Metro Rail</option>
                    <option value="bus">City Bus</option>
                    <option value="train">Local Train</option>
                    <option value="mixed">Mixed Multimodal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Daily Schedule
                  </label>
                  <input
                    type="text"
                    value={departureTimePreference}
                    onChange={(e) => setDepartureTimePreference(e.target.value)}
                    placeholder="08:30 AM"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Daily Commute, Campus, Gym, Express"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95"
                >
                  {editId ? 'Save Changes' : 'Create Saved Journey'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
