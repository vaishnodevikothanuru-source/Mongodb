'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  AlertTriangle,
  Radio,
  Sparkles,
  CheckCheck,
  Trash2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
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
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transit Notifications</h3>
                <p className="text-xs text-slate-500">Live network updates & smart alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllRead}
                title="Mark all as read"
                className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={fetchNotifications}
                title="Refresh"
                className={`p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  loading ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No new transit alerts</p>
                <p className="text-xs text-slate-500 mt-1">All lines are running smoothly.</p>
              </div>
            ) : (
              notifications.map((n) => {
                const notifId = n.id || n._id;
                let bgStyle = 'bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700';
                let icon = <Radio className="w-4 h-4 text-blue-500" />;

                if (n.type === 'delay' || n.severity === 'warning') {
                  bgStyle = 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/70';
                  icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                } else if (n.type === 'alternative' || n.severity === 'success') {
                  bgStyle = 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/70';
                  icon = <Sparkles className="w-4 h-4 text-emerald-500" />;
                }

                return (
                  <div
                    key={notifId}
                    className={`relative p-3.5 rounded-xl border transition-all ${bgStyle} ${
                      !n.read ? 'ring-2 ring-emerald-500/20 shadow-sm' : 'opacity-80'
                    }`}
                  >
                    {!n.read && (
                      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500" />
                    )}

                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                          <span className="text-slate-400">
                            {new Date(n.createdAt || Date.now()).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          <div className="flex items-center gap-2">
                            {n.actionUrl && (
                              <Link
                                href={n.actionUrl}
                                onClick={onClose}
                                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                              >
                                <span>{n.actionLabel || 'Details'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                            <button
                              onClick={() => markRead(notifId)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                              title="Mark read"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => deleteNotif(notifId)}
                              className="text-slate-400 hover:text-rose-600 ml-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
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

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/40">
            <Link
              href="/live-transit"
              onClick={onClose}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Open Full Live Transit Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotificationDrawer;
