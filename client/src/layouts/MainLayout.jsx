import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Film } from 'lucide-react';

export const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center animate-bounce shadow-xl shadow-brand-500/30">
          <Film className="w-7 h-7 text-black font-bold" />
        </div>
        <p className="text-sm font-semibold text-slate-400 tracking-wide">
          Connecting to CineVault MongoDB...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col">
      {/* Header */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Viewport */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col justify-between">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 glass-panel py-6 px-4 sm:px-8 text-xs text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                © 2026 <span className="text-white font-bold">CineVault</span> • Advanced Personal Movie Library & Recommendation Platform
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>MongoDB Primary Persistent Storage</span>
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
