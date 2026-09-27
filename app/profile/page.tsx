'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Sliders,
  Sparkles,
  Train,
  Bus,
  Footprints,
  Save,
  CheckCircle2,
  Clock,
  IndianRupee,
  Shuffle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, updatePreferences } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex Commuter');
  const [email, setEmail] = useState(user?.email || 'commuter@smarttransit.com');

  // Locations
  const [homeName, setHomeName] = useState(user?.homeLocation?.name || 'Greenwood Heights, Sector 14');
  const [workName, setWorkName] = useState(user?.workLocation?.name || 'Cyber Tech Park, Gate 3');
  const [collegeName, setCollegeName] = useState(user?.collegeLocation?.name || 'University North Campus');

  // Preferences
  const [preferredModes, setPreferredModes] = useState<string[]>(
    user?.preferences?.preferredModes || ['metro', 'bus', 'walk']
  );
  const [maxTravelTime, setMaxTravelTime] = useState(user?.preferences?.maxTravelTime || 60);
  const [maxBudget, setMaxBudget] = useState(user?.preferences?.maxBudget || 100);
  const [preferFastest, setPreferFastest] = useState(user?.preferences?.preferFastest ?? true);
  const [preferCheapest, setPreferCheapest] = useState(user?.preferences?.preferCheapest ?? false);
  const [avoidCrowds, setAvoidCrowds] = useState(user?.preferences?.avoidCrowds ?? true);
  const [avoidTransfers, setAvoidTransfers] = useState(user?.preferences?.avoidTransfers ?? false);
  const [minimizeWalking, setMinimizeWalking] = useState(user?.preferences?.minimizeWalking ?? false);

  // Algorithm Weights
  const [weightTime, setWeightTime] = useState(user?.preferences?.weightTime || 35);
  const [weightCost, setWeightCost] = useState(user?.preferences?.weightCost || 20);
  const [weightCrowd, setWeightCrowd] = useState(user?.preferences?.weightCrowd || 25);
  const [weightTransfers, setWeightTransfers] = useState(user?.preferences?.weightTransfers || 10);
  const [weightWalking, setWeightWalking] = useState(user?.preferences?.weightWalking || 10);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.homeLocation) setHomeName(user.homeLocation.name);
      if (user.workLocation) setWorkName(user.workLocation.name);
      if (user.collegeLocation) setCollegeName(user.collegeLocation.name);
      if (user.preferences) {
        setPreferredModes(user.preferences.preferredModes || ['metro', 'bus', 'walk']);
        setMaxTravelTime(user.preferences.maxTravelTime || 60);
        setMaxBudget(user.preferences.maxBudget || 100);
        setPreferFastest(user.preferences.preferFastest ?? true);
        setPreferCheapest(user.preferences.preferCheapest ?? false);
        setAvoidCrowds(user.preferences.avoidCrowds ?? true);
        setAvoidTransfers(user.preferences.avoidTransfers ?? false);
        setMinimizeWalking(user.preferences.minimizeWalking ?? false);
        setWeightTime(user.preferences.weightTime || 35);
        setWeightCost(user.preferences.weightCost || 20);
        setWeightCrowd(user.preferences.weightCrowd || 25);
        setWeightTransfers(user.preferences.weightTransfers || 10);
        setWeightWalking(user.preferences.weightWalking || 10);
      }
    }
  }, [user]);

  const toggleMode = (mode: string) => {
    if (preferredModes.includes(mode)) {
      if (preferredModes.length > 1) {
        setPreferredModes(preferredModes.filter((m) => m !== mode));
      }
    } else {
      setPreferredModes([...preferredModes, mode]);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const profileData = {
      name,
      homeLocation: { name: homeName, latitude: 28.6139, longitude: 77.209 },
      workLocation: { name: workName, latitude: 28.4595, longitude: 77.0266 },
      collegeLocation: { name: collegeName, latitude: 28.6892, longitude: 77.2104 },
      preferences: {
        preferredModes,
        maxTravelTime,
        maxBudget,
        preferFastest,
        preferCheapest,
        avoidCrowds,
        avoidTransfers,
        minimizeWalking,
        weightTime,
        weightCost,
        weightCrowd,
        weightTransfers,
        weightWalking,
      },
    };

    await updateProfile(profileData);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                User Configuration
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Profile & Travel Preferences
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Customize your locations, speed/cost priorities, and recommendation algorithm weights.
            </p>
          </div>

          {savedSuccess && (
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Preferences Saved to MongoDB!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveAll} className="space-y-6">
          {/* Section 1: Personal Info */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Frequently Used Locations */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Frequently Used Locations</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  🏠 Home Location
                </label>
                <input
                  type="text"
                  value={homeName}
                  onChange={(e) => setHomeName(e.target.value)}
                  placeholder="Home Station/Address"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  🏢 Work / Office
                </label>
                <input
                  type="text"
                  value={workName}
                  onChange={(e) => setWorkName(e.target.value)}
                  placeholder="Office Tech Hub"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  🎓 College / Campus
                </label>
                <input
                  type="text"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="University Gate"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Transportation Mode Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Train className="w-4 h-4 text-emerald-600" />
              <span>Preferred Transportation Modes</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { id: 'metro', label: 'Metro Rail', icon: Train },
                { id: 'bus', label: 'City Bus', icon: Bus },
                { id: 'train', label: 'Local Train', icon: Train },
                { id: 'taxi', label: 'Auto / Taxi', icon: Sparkles },
                { id: 'walk', label: 'Walking Link', icon: Footprints },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = preferredModes.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMode(m.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold">{m.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Recommendation Engine Weights Customizer */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recommendation Engine Algorithm Weights
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fine-tune the scoring importance for route ranking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  <span>Travel Speed Weight</span>
                  <span className="text-emerald-600">{weightTime}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weightTime}
                  onChange={(e) => setWeightTime(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  <span>Fare & Cost Weight</span>
                  <span className="text-emerald-600">{weightCost}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weightCost}
                  onChange={(e) => setWeightCost(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  <span>Crowd Avoidance Weight</span>
                  <span className="text-emerald-600">{weightCrowd}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weightCrowd}
                  onChange={(e) => setWeightCrowd(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  <span>Fewer Transfers Weight</span>
                  <span className="text-emerald-600">{weightTransfers}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weightTransfers}
                  onChange={(e) => setWeightTransfers(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Preferences...' : 'Save & Update Commuter Profile'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
