'use client';

import React from 'react';
import Link from 'next/link';
import {
  Navigation,
  Sparkles,
  Zap,
  ShieldCheck,
  Radio,
  Users,
  Clock,
  Compass,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Leaf,
  Layers,
  MapPin,
  Train,
  Bus,
  Footprints,
} from 'lucide-react';
import QuickJourneyPlanner from '@/components/QuickJourneyPlanner';
import InteractiveMap from '@/components/InteractiveMap';
import CrowdIndicator from '@/components/CrowdIndicator';
import { useAuth } from '@/lib/context/AuthContext';

export default function LandingPage() {
  const { loginAsDemo, isAuthenticated } = useAuth();

  const features = [
    {
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      title: 'Smart Route Recommendations',
      description:
        'Multi-factor scoring algorithm dynamically customizes route suggestions based on your personal budget, travel time, and preferred transit modes.',
    },
    {
      icon: Radio,
      color: 'from-blue-500 to-cyan-500',
      title: 'Real-Time Transit Updates',
      description:
        'Live tracking of metro lines, city buses, and local trains with instant delay alerts, headway countdowns, and platform announcements.',
    },
    {
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      title: 'Live Crowd Monitoring',
      description:
        'Know station and carriage crowd density (Low 🟢, Moderate 🟡, High 🔴) before you board to guarantee comfortable seats.',
    },
    {
      icon: Zap,
      color: 'from-purple-500 to-indigo-500',
      title: 'Dynamic Alternative Routes',
      description:
        'When delays or disruptions occur, the assistant automatically suggests optimal bypass routes to keep your schedule on track.',
    },
    {
      icon: Compass,
      color: 'from-rose-500 to-pink-500',
      title: 'Personalized Preferences',
      description:
        'Tailor travel priorities: fastest route, lowest fare, fewer transfers, minimal walking, or air-conditioned coach preferences.',
    },
    {
      icon: Leaf,
      color: 'from-emerald-600 to-green-500',
      title: 'Green Commute Analytics',
      description:
        'Track your weekly carbon offset, money saved vs. driving private cabs, and calories burned with active walking links.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Enter Destination',
      desc: 'Type your origin & destination or choose from quick shortcuts like Home, Office, or Campus.',
    },
    {
      step: '02',
      title: 'AI Multi-Factor Analysis',
      desc: 'We analyze live schedules, road traffic, passenger density, fares, and your personal profile.',
    },
    {
      step: '03',
      title: 'Compare & Choose',
      desc: 'Review side-by-side matrices with clear "Why this route?" explanations and step-by-step maps.',
    },
    {
      step: '04',
      title: 'Effortless Commuting',
      desc: 'Receive proactive alerts for delays or crowd surges with 1-click alternative route bypasses.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-400/15 dark:bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-teal-400/15 dark:bg-teal-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Public Transportation Assistant</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none">
              Plan smarter.{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                Travel better.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Get personalized public transportation recommendations based on live route conditions,
              travel time, cost, crowd levels, and your personal commuter preferences.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/planner"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
              >
                <Navigation className="w-4 h-4" />
                <span>Plan My Journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/live-transit"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
              >
                <Radio className="w-4 h-4 text-emerald-500" />
                <span>Explore Live Transit</span>
              </Link>

              {!isAuthenticated && (
                <button
                  onClick={() => loginAsDemo('commuter')}
                  className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs hover:bg-emerald-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant Demo Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Planner Hero Embed */}
          <div className="max-w-4xl mx-auto">
            <QuickJourneyPlanner />
          </div>

          {/* Network Live KPIs Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Network Punctuality', val: '97.4%', sub: 'On-time operations' },
              { label: 'Active Transit Lines', val: '28+ Corridors', sub: 'Metro, Bus & Train' },
              { label: 'Crowd Accuracy', val: '94.8%', sub: 'Real-time sensor feed' },
              { label: 'Avg Time Saved', val: '18 Mins', sub: 'Per daily commuter' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm text-center backdrop-blur-md"
              >
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {stat.val}
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Showcase Section */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                <Radio className="w-4 h-4" /> Real-Time Network Visualizer
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Interactive Transit Radar & Crowd Maps
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Explore live transit corridors, click stations to inspect crowd density, and view smart bypass routes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <CrowdIndicator level="low" size="sm" />
              <CrowdIndicator level="moderate" size="sm" />
              <CrowdIndicator level="high" size="sm" />
            </div>
          </div>

          <InteractiveMap heightClass="h-[480px]" />
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
              Cutting-Edge Transit Tech
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
              Engineered for Modern City Commuters
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Everything you need for seamless, stress-free public transportation navigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-100 dark:bg-teal-950 px-3 py-1 rounded-full">
              Seamless 4-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-3">
              How the Smart Assistant Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From entering a destination to stepping off at your stop with guaranteed seats.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl font-black text-emerald-500/30 dark:text-emerald-400/20 block mb-2">
                    {s.step}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready for a smarter daily commute?
          </h2>
          <p className="mt-3 text-emerald-100 text-sm max-w-xl mx-auto">
            Join thousands of daily commuters saving time, avoiding crowded coaches, and lowering their carbon footprint.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/planner"
              className="px-6 py-3.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-xl transition-all active:scale-95"
            >
              Plan Your Route Now
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-900 text-white font-bold text-sm border border-emerald-500 shadow-xl transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-white">SmartTransit Assistant</span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm">
                Empowering urban commuters with real-time crowd analytics, multi-criteria recommendation algorithms, and reliable transit schedules.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/planner" className="hover:text-white">Journey Planner</Link></li>
                <li><Link href="/routes" className="hover:text-white">Route Search</Link></li>
                <li><Link href="/live-transit" className="hover:text-white">Live Transit Map</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Commuter Analytics</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Account</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Register</Link></li>
                <li><Link href="/saved-journeys" className="hover:text-white">Saved Commutes</Link></li>
                <li><Link href="/profile" className="hover:text-white">User Profile</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Admin & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/admin" className="hover:text-white">Admin Command</Link></li>
                <li><span className="hover:text-white cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-white cursor-pointer">API Integration</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Smart Public Transportation Assistant. “Your Smarter Way to Commute”. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Next.js • TypeScript • TailwindCSS • MongoDB Atlas</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
