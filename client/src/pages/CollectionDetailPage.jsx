import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collectionsApi } from '../api/collectionsApi';
import { MovieCard } from '../components/movies/MovieCard';
import { QuickStatusModal } from '../components/movies/QuickStatusModal';
import { useToast } from '../context/ToastContext';
import { FolderHeart, ArrowLeft, Trash2, Plus, Film } from 'lucide-react';

export const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [quickModalOpen, setQuickModalOpen] = useState(false);

  useEffect(() => {
    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const res = await collectionsApi.getCollectionById(id);
      if (res.success) {
        setCollection(res.data);
      }
    } catch (err) {
      toast.error('Collection not found');
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMovie = async (movieId, movieTitle) => {
    try {
      await collectionsApi.removeMovie(id, movieId);
      toast.info(`"${movieTitle}" removed from collection`);
      fetchCollection();
    } catch (err) {
      toast.error('Failed to remove movie');
    }
  };

  const handleDeleteCollection = async () => {
    if (window.confirm(`Delete collection "${collection.name}"?`)) {
      try {
        await collectionsApi.deleteCollection(id);
        toast.success('Collection deleted');
        navigate('/collections');
      } catch (err) {
        toast.error('Failed to delete collection');
      }
    }
  };

  if (loading || !collection) {
    return <div className="p-8 text-center text-slate-400">Loading collection...</div>;
  }

  return (
    <div className="space-y-8 pb-16">
      <button
        onClick={() => navigate('/collections')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to collections</span>
      </button>

      {/* Collection Hero Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          <img
            src={collection.coverImage || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'}
            alt={collection.name}
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover bg-slate-900 border border-slate-700 shrink-0"
          />
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 font-bold text-xs">
              {collection.movies?.length || 0} movies
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              {collection.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {collection.description || 'Custom curated collection.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Link
            to="/library"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movies</span>
          </Link>
          <button
            onClick={handleDeleteCollection}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Movies in Collection */}
      {collection.movies?.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-3 max-w-md mx-auto p-6">
          <Film className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Movies in this Collection</h3>
          <p className="text-xs text-slate-400">
            Browse your library and add movies to this collection.
          </p>
          <Link
            to="/library"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs inline-block"
          >
            Go to Library
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {collection.movies.map((movie) => (
            <div key={movie._id} className="relative group">
              <MovieCard
                movie={movie}
                onMovieUpdated={fetchCollection}
                onOpenQuickModal={(m) => {
                  setSelectedMovie(m);
                  setQuickModalOpen(true);
                }}
              />
              <button
                onClick={() => handleRemoveMovie(movie._id, movie.title)}
                className="absolute top-2 right-12 z-30 p-1.5 rounded-full bg-black/80 hover:bg-rose-950 border border-slate-700 text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove from this collection"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <QuickStatusModal
        movie={selectedMovie}
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        onMovieUpdated={fetchCollection}
      />
    </div>
  );
};
