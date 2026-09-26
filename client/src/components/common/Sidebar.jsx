import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Bookmark,
  Sparkles,
  Compass,
  FolderHeart,
  History,
  Scale,
  Dices,
  BarChart3,
  FileSpreadsheet,
  Sliders,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'My Library', path: '/library', icon: Film },
  { label: 'Watchlist', path: '/watchlist', icon: Bookmark },
  { label: 'Recommended', path: '/recommendations', icon: Sparkles, badge: 'AI' },
  { label: 'Discover', path: '/discover', icon: Compass },
  { label: 'Collections', path: '/collections', icon: FolderHeart },
  { label: 'Watch History', path: '/history', icon: History },
  { label: 'Compare', path: '/compare', icon: Scale },
  { label: 'Random Picker', path: '/picker', icon: Dices },
  { label: 'Analytics', path: '/statistics', icon: BarChart3 },
  { label: 'Import / Export', path: '/data', icon: FileSpreadsheet },
  { label: 'Preferences', path: '/profile', icon: Sliders },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 w-64 glass-panel border-r border-slate-800/80 p-4 z-40 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="space-y-1">
          <div className="flex items-center justify-between lg:hidden pb-3 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 hidden lg:block">
            Menu
          </p>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 shadow-md shadow-brand-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-brand-500 text-black">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Database Status Indicator */}
        <div className="pt-4 border-t border-slate-800/80 mt-6">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <p className="font-semibold text-slate-200">MongoDB Connected</p>
              <p className="text-[10px] text-slate-400">Persistent Source of Truth</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
