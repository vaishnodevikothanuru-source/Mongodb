import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { preferencesApi } from '../api/statsApi';
import { useToast } from '../context/ToastContext';
import {
  User,
  Sliders,
  Lock,
  Trash2,
  Sparkles,
  Check,
  ShieldAlert,
} from 'lucide-react';

const ALL_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Biography',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'History',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
];

export const ProfilePreferencesPage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const toast = useToast();

  // Profile Form
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [bio, setBio] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Recommendation Preferences Form
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [directorsText, setDirectorsText] = useState('');
  const [actorsText, setActorsText] = useState('');
  const [runtimeMin, setRuntimeMin] = useState(80);
  const [runtimeMax, setRuntimeMax] = useState(180);
  const [minimumRating, setMinimumRating] = useState(7.0);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfileImage(user.profileImage || '');
      setBio(user.bio || '');
    }
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const res = await preferencesApi.getPreferences();
      if (res.success && res.data) {
        const p = res.data;
        setFavoriteGenres(p.favoriteGenres || []);
        setDirectorsText((p.favoriteDirectors || []).join(', '));
        setActorsText((p.favoriteActors || []).join(', '));
        setRuntimeMin(p.preferredRuntimeMin || 80);
        setRuntimeMax(p.preferredRuntimeMax || 180);
        setMinimumRating(p.minimumRating || 7.0);
      }
    } catch (err) {
      console.error('Failed to load preferences', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await authApi.updateProfile({ name, profileImage, bio });
      if (res.success) {
        updateUserProfile(res.data);
        toast.success('Profile details updated!');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      setSavingPrefs(true);
      const dirs = directorsText.split(',').map((s) => s.trim()).filter(Boolean);
      const acts = actorsText.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await preferencesApi.updatePreferences({
        favoriteGenres,
        favoriteDirectors: dirs,
        favoriteActors: acts,
        preferredRuntimeMin: runtimeMin,
        preferredRuntimeMax: runtimeMax,
        minimumRating,
      });

      if (res.success) {
        toast.success('Recommendation preferences saved in MongoDB!');
      }
    } catch (err) {
      toast.error('Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setSavingPassword(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleGenre = (genre) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter((g) => g !== genre));
    } else {
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  return (
    <div className="space-y-10 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-brand-400" />
          <span>Profile & AI Preferences</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Tune your personal film profile and customize the signals driving your recommendation algorithms.
        </p>
      </div>

      {/* Profile Details Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand-400" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <img
              src={profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover border border-slate-700 bg-slate-900 shrink-0"
            />
            <div className="flex-1 w-full space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Profile Image URL
              </label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about your cinematic taste..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Recommendation Preferences Engine Config */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-brand-500/30 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            <span>AI Recommendation Algorithm Tuning</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            These parameters are directly fed into the backend scoring formula alongside your viewing history.
          </p>
        </div>

        <form onSubmit={handleUpdatePreferences} className="space-y-5">
          {/* Favorite Genres Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Favorite Genres (Multi-Select)
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRES.map((g) => {
                const isSelected = favoriteGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-500 text-black shadow-md shadow-brand-500/20 font-bold'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 inline mr-1" />}
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Directors & Actors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Favorite Directors (comma separated)
              </label>
              <input
                type="text"
                value={directorsText}
                onChange={(e) => setDirectorsText(e.target.value)}
                placeholder="Christopher Nolan, Denis Villeneuve..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Favorite Actors (comma separated)
              </label>
              <input
                type="text"
                value={actorsText}
                onChange={(e) => setActorsText(e.target.value)}
                placeholder="Leonardo DiCaprio, Cillian Murphy..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Runtime & Minimum Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Min Runtime ({runtimeMin}m)
              </label>
              <input
                type="range"
                min="45"
                max="180"
                step="5"
                value={runtimeMin}
                onChange={(e) => setRuntimeMin(Number(e.target.value))}
                className="w-full accent-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Max Runtime ({runtimeMax}m)
              </label>
              <input
                type="range"
                min="90"
                max="300"
                step="10"
                value={runtimeMax}
                onChange={(e) => setRuntimeMax(Number(e.target.value))}
                className="w-full accent-brand-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Minimum TMDB Rating ({minimumRating} ★)
              </label>
              <input
                type="range"
                min="5"
                max="9"
                step="0.5"
                value={minimumRating}
                onChange={(e) => setMinimumRating(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPrefs}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {savingPrefs ? 'Updating...' : 'Save Algorithm Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          <span>Security & Password</span>
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            {savingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};
