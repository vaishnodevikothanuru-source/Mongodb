'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  IndianRupee,
  Leaf,
  Train,
  Shuffle,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => setAnalyticsData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = analyticsData?.metrics || {
    totalJourneys: 28,
    avgTravelTime: 36,
    avgFare: 35,
    totalSpend: 890,
    totalCO2SavedKg: 24.6,
    mostUsedMode: 'Metro Rail',
    mostUsedRoute: 'Metro Blue Line → Bus 42',
    punctualityScore: 94,
    caloriesBurned: 1420,
  };

  const weeklyData = analyticsData?.weeklyJourneysData || [
    { day: 'Mon', journeys: 4, minutes: 128, spend: 110, co2: 6.2 },
    { day: 'Tue', journeys: 3, minutes: 98, spend: 85, co2: 4.8 },
    { day: 'Wed', journeys: 4, minutes: 135, spend: 115, co2: 6.5 },
    { day: 'Thu', journeys: 2, minutes: 64, spend: 60, co2: 3.2 },
    { day: 'Fri', journeys: 5, minutes: 160, spend: 140, co2: 7.9 },
    { day: 'Sat', journeys: 2, minutes: 55, spend: 50, co2: 2.8 },
    { day: 'Sun', journeys: 1, minutes: 30, spend: 30, co2: 1.4 },
  ];

  const modeData = analyticsData?.modeDistributionData || [
    { name: 'Metro', value: 16 },
    { name: 'Bus', value: 8 },
    { name: 'Train', value: 4 },
    { name: 'Mixed', value: 6 },
  ];

  const spendData = analyticsData?.monthlySpendingData || [
    { month: 'Apr', spend: 840, budget: 1200 },
    { month: 'May', spend: 920, budget: 1200 },
    { month: 'Jun', spend: 1100, budget: 1200 },
    { month: 'Jul', spend: 890, budget: 1200 },
    { month: 'Aug', spend: 960, budget: 1200 },
    { month: 'Sep', spend: 780, budget: 1200 },
  ];

  const timeSavingsData = analyticsData?.timeSavingsData || [
    { route: 'Home → Office', publicTransit: 38, privateCar: 65 },
    { route: 'Home → Campus', publicTransit: 45, privateCar: 55 },
    { route: 'Airport Run', publicTransit: 19, privateCar: 52 },
    { route: 'Central Hub', publicTransit: 28, privateCar: 48 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Personal Commute Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
            Travel Analytics & Green Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive insights into your weekly journeys, transit expenditures, and carbon savings.
          </p>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Journeys
              </span>
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Shuffle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {metrics.totalJourneys} Trips
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Avg ~{metrics.avgTravelTime} mins per trip</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Average Fare
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ₹{metrics.avgFare}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Total spend: ₹{metrics.totalSpend}</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Carbon Offset
              </span>
              <div className="p-2 rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400 mt-2">
              ~{metrics.totalCO2SavedKg} kg
            </div>
            <p className="text-[11px] text-slate-500 mt-1">CO2 saved vs single-occupant cabs</p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Mode
              </span>
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                <Train className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-2 truncate">
              {metrics.mostUsedMode}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{metrics.mostUsedRoute}</p>
          </div>
        </div>

        {/* Recharts Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Weekly Journeys Area Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Weekly Commute Activity & Travel Minutes
                </h3>
                <p className="text-[11px] text-slate-500">Daily transit time distribution</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">Minutes</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMinutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Mode Breakdown Donut Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transportation Mode Distribution
                </h3>
                <p className="text-[11px] text-slate-500">Breakdown of chosen transit types</p>
              </div>
              <span className="text-xs font-bold text-blue-600">Share %</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {modeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Travel Time Savings vs Private Driving */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Public Transit vs. Private Road Traffic
                </h3>
                <p className="text-[11px] text-slate-500">Door-to-door minutes comparison</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">Bypass Traffic</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSavingsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="route" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="publicTransit" name="Public Transit" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="privateCar" name="Private Car in Traffic" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Monthly Spend vs Budget Line Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Commute Spend vs. Budget Limit
                </h3>
                <p className="text-[11px] text-slate-500">Cost efficiency tracking in ₹</p>
              </div>
              <span className="text-xs font-bold text-blue-600">INR (₹)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    name="Actual Spend"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    name="Budget Cap"
                    stroke="#94a3b8"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
