'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Radio,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Clock,
  Filter,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/all/read', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {}
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n))
      );
    } catch (e) {}
  };

  const deleteNotif = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
    } catch (e) {}
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'delay') return n.type === 'delay';
    if (filterType === 'alternative') return n.type === 'alternative';
    if (filterType === 'crowd') return n.type === 'crowd';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Alert Feed
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              Transit Notification Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Proactive advisories on delays, peak crowd surges, and smart bypass routes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={fetchNotifs}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'unread', label: 'Unread Only' },
            { id: 'delay', label: '⚠️ Delays' },
            { id: 'alternative', label: '✨ Alternatives' },
            { id: 'crowd', label: '👥 Crowd Advisories' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === f.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading alerts...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No notifications in this category.</p>
            </div>
          ) : (
            filtered.map((n) => {
              const notifId = n.id || n._id;
              let bgStyle = 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800';
              let icon = <Radio className="w-5 h-5 text-blue-500" />;

              if (n.type === 'delay' || n.severity === 'warning') {
                bgStyle = 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/60';
                icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
              } else if (n.type === 'alternative' || n.severity === 'success') {
                bgStyle = 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/60';
                icon = <Sparkles className="w-5 h-5 text-emerald-500" />;
              }

              return (
                <div
                  key={notifId}
                  className={`p-5 rounded-2xl border transition-all shadow-sm ${bgStyle} ${
                    !n.read ? 'ring-2 ring-emerald-500/20' : 'opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5">{icon}</div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          {n.title}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        {n.actionUrl ? (
                          <Link
                            href={n.actionUrl}
                            className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <span>{n.actionLabel || 'View Route Details'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">Informational broadcast</span>
                        )}

                        <div className="flex items-center gap-2">
                          {!n.read && (
                            <button
                              onClick={() => markRead(notifId)}
                              className="text-xs font-semibold text-emerald-600 hover:underline"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotif(notifId)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
