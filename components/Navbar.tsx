'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Navigation,
  Compass,
  MapPin,
  Radio,
  Bookmark,
  BarChart3,
  Bell,
  Shield,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import NotificationDrawer from './NotificationDrawer';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      })
      .catch(() => {});
  }, [pathname]);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: Compass },
    { label: 'Planner', href: '/planner', icon: Navigation },
    { label: 'Routes', href: '/routes', icon: MapPin },
    { label: 'Live Transit', href: '/live-transit', icon: Radio, badge: 'Live' },
    { label: 'Saved', href: '/saved-journeys', icon: Bookmark },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    ...(user?.role === 'admin' ? [{ label: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center text-white">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                    SmartTransit
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded">
                    Assistant
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Your Smarter Way to Commute
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {!isAuthPage && (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher when not logged in */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mr-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Demo:</span>
                </div>
                <button
                  onClick={() => loginAsDemo('commuter')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 transition-colors"
                >
                  Commuter
                </button>
                <button
                  onClick={() => loginAsDemo('admin')}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 transition-colors"
                >
                  Admin
                </button>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow hover:bg-emerald-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <button
                  onClick={() => setIsNotifOpen(true)}
                  className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:block text-left pr-1">
                      <div className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                        {user?.name || 'Commuter'}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">{user?.role || 'user'}</div>
                    </div>
                  </button>

                  {userDropdownOpen && user && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        My Profile & Preferences
                      </Link>
                      <Link
                        href="/saved-journeys"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        Saved Commutes
                      </Link>
                      <Link
                        href="/history"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                        Journey History & Logs
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          Admin Command Center
                        </Link>
                      )}
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Slide-out Notification Center */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}

export default Navbar;
