'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserPreferences {
  preferredModes: string[];
  maxTravelTime: number;
  maxBudget: number;
  preferFastest: boolean;
  preferCheapest: boolean;
  avoidCrowds: boolean;
  avoidTransfers: boolean;
  minimizeWalking: boolean;
  weightTime?: number;
  weightCost?: number;
  weightCrowd?: number;
  weightTransfers?: number;
  weightWalking?: number;
}

export interface UserLocation {
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  homeLocation?: UserLocation;
  workLocation?: UserLocation;
  collegeLocation?: UserLocation;
  preferences?: UserPreferences;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  dbConnected: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (type?: 'commuter' | 'admin') => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<boolean>;
  updateProfile: (profileData: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setDbConnected(Boolean(data.databaseConnected));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Failed to refresh user session', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      setDbConnected(Boolean(data.databaseConnected));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  const loginAsDemo = async (type: 'commuter' | 'admin' = 'commuter') => {
    const email = type === 'admin' ? 'admin@smarttransit.com' : 'commuter@smarttransit.com';
    const password = type === 'admin' ? 'admin123' : 'pass123';
    await login(email, password);
  };

  const register = async (name: string, email: string, pass: string, role = 'user') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      setDbConnected(Boolean(data.databaseConnected));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration error' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const updatedPrefs = { ...(user?.preferences || {}), ...prefs };
      const res = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPrefs),
      });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, preferences: updatedPrefs as UserPreferences } : null));
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        dbConnected,
        login,
        loginAsDemo,
        register,
        logout,
        updatePreferences,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
