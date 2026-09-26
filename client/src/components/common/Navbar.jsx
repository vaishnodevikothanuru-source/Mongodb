import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Film, Plus, Heart, User, LogOut, Settings, Menu, Sparkles } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-black font-bold" />
          </div>
          <span className="font-display font-black text-xl tracking-tight text-white hidden sm:inline-block">
            CINE<span className="text-brand-400">VAULT</span>
          </span>
        </Link>
      </div>

      {/* Center: Quick Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search titles, directors, cast, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-all"
          />
        </div>
      </form>

      {/* Right: Quick actions & User menu */}
      <div className="flex items-center gap-3">
        <Link
          to="/discover"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/30 rounded-lg hover:bg-brand-500/20 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Discover & Import</span>
        </Link>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full border border-slate-700 hover:border-brand-400/60 transition-all focus:outline-none"
            >
              <img
                src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-56 glass-panel border border-slate-700/80 rounded-xl shadow-2xl py-2 z-20 animate-fade-in text-sm">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <User className="w-4 h-4 text-brand-400" />
                    <span>Profile & Preferences</span>
                  </Link>

                  <Link
                    to="/statistics"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-brand-400" />
                    <span>Watch Analytics</span>
                  </Link>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 text-sm font-semibold text-black bg-brand-400 hover:bg-brand-300 rounded-lg transition-colors shadow-lg shadow-brand-400/20"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
