import confetti from 'canvas-confetti';

export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

export const getGenreColor = (genre) => {
  const map = {
    'Sci-Fi': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    Action: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Drama: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Thriller: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Adventure: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Comedy: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    Mystery: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    Animation: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    Crime: 'bg-red-500/15 text-red-400 border-red-500/30',
    Romance: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
    Horror: 'bg-orange-600/15 text-orange-400 border-orange-600/30',
  };
  return map[genre] || 'bg-slate-700/30 text-slate-300 border-slate-600/30';
};

export const getStatusBadgeStyle = (status) => {
  const map = {
    WATCHLIST: { label: 'Watchlist', class: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    WATCHED: { label: 'Watched', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    WATCHING: { label: 'Watching', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' },
    UNWATCHED: { label: 'Unwatched', class: 'bg-slate-700/30 text-slate-400 border-slate-600/40' },
    ABANDONED: { label: 'Abandoned', class: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  };
  return map[status] || { label: status, class: 'bg-slate-800 text-slate-300 border-slate-700' };
};

export const getPriorityBadgeStyle = (priority) => {
  const map = {
    High: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Low: 'bg-slate-600/20 text-slate-300 border-slate-600/40',
  };
  return map[priority] || map['Medium'];
};

export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#e5a93c', '#06b6d4', '#10b981', '#f43f5e'],
  });
};
