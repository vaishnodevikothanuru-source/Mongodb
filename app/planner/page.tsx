'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  MapPin,
  Calendar,
  Clock,
  Search,
  Train,
  Bus,
  Footprints,
  Sparkles,
  Shuffle,
  ShieldCheck,
  Zap,
  Sliders,
  ArrowRightLeft,
  DollarSign,
  Users,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function PlannerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [origin, setOrigin] = useState(user?.homeLocation?.name || 'Dwarka Sector 21');
  const [destination, setDestination] = useState(user?.workLocation?.name || 'Cyber Tech Park');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('08:30');
  const [timingType, setTimingType] = useState<'depart' | 'arrive'>('depart');

  // Selected modes
  const [selectedModes, setSelectedModes] = useState<string[]>(['metro', 'bus', 'walk']);

  // Commuter preferences
  const [maxTime, setMaxTime] = useState(user?.preferences?.maxTravelTime || 60);
  const [maxBudget, setMaxBudget] = useState(user?.preferences?.maxBudget || 100);
  const [preferFastest, setPreferFastest] = useState(true);
  const [preferCheapest, setPreferCheapest] = useState(false);
  const [avoidCrowds, setAvoidCrowds] = useState(true);
  const [avoidTransfers, setAvoidTransfers] = useState(false);
  const [minimizeWalking, setMinimizeWalking] = useState(false);
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [acOnly, setAcOnly] = useState(false);

  const toggleMode = (mode: string) => {
    if (selectedModes.includes(mode)) {
      if (selectedModes.length > 1) {
        setSelectedModes(selectedModes.filter((m) => m !== mode));
      }
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      origin,
      destination,
      date,
      time,
      timingType,
      modes: selectedModes.join(','),
      maxTime: maxTime.toString(),
      maxBudget: maxBudget.toString(),
      preferFastest: preferFastest.toString(),
      preferCheapest: preferCheapest.toString(),
      avoidCrowds: avoidCrowds.toString(),
      avoidTransfers: avoidTransfers.toString(),
      minimizeWalking: minimizeWalking.toString(),
      wheelchair: wheelchairOnly.toString(),
      ac: acOnly.toString(),
    }).toString();

    router.push(`/routes?${query}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Multimodal Commute Planner
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Plan Your Ideal Journey
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure departure timing, mode preferences, budget, and crowd filters for tailored transit routes.
          </p>
        </div>

        {/* Planner Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin & Destination */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
              <div className="md:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Starting Point (Origin)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    placeholder="e.g. Greenwood Heights / Sector 14"
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex justify-center pt-5">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="md:col-span-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-500">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    placeholder="e.g. Cyber City / Noida Tech Park"
                    className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Date & Time Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Travel Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Timing Option
                </label>
                <div className="flex bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTimingType('depart')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      timingType === 'depart'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Depart At
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimingType('arrive')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      timingType === 'arrive'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Arrive By
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Transportation Modes Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Allowed Transportation Modes
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'metro', label: 'Metro Rail', icon: Train, color: 'text-blue-500' },
                  { id: 'bus', label: 'City Bus', icon: Bus, color: 'text-amber-500' },
                  { id: 'train', label: 'Local Train', icon: Train, color: 'text-purple-500' },
                  { id: 'taxi', label: 'Auto / Taxi', icon: Sparkles, color: 'text-yellow-500' },
                  { id: 'walk', label: 'Walking Link', icon: Footprints, color: 'text-emerald-500' },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isChecked = selectedModes.includes(mode.id);
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => toggleMode(mode.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isChecked ? mode.color : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{mode.label}</span>
                      </div>
                      {isChecked && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Constraints & Personalization Preferences */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Recommendation Priorities & Constraints</span>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Max Travel Time</span>
                    <span className="text-emerald-600 font-bold">{maxTime} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="5"
                    value={maxTime}
                    onChange={(e) => setMaxTime(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span>Max Fare Budget</span>
                    <span className="text-emerald-600 font-bold">₹{maxBudget}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {[
                  { label: 'Fastest Route', state: preferFastest, set: setPreferFastest },
                  { label: 'Cheapest Route', state: preferCheapest, set: setPreferCheapest },
                  { label: 'Avoid High Crowds', state: avoidCrowds, set: setAvoidCrowds },
                  { label: 'Fewer Transfers', state: avoidTransfers, set: setAvoidTransfers },
                  { label: 'Minimize Walking', state: minimizeWalking, set: setMinimizeWalking },
                  { label: 'AC Coaches Only', state: acOnly, set: setAcOnly },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => item.set(!item.state)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      item.state
                        ? 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-black">{item.state ? 'ON' : 'OFF'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base shadow-xl shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>Search & Rank Personalized Routes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
