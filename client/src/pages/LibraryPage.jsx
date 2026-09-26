import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { moviesApi } from '../api/moviesApi';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilters } from '../components/movies/MovieFilters';
import { QuickStatusModal } from '../components/movies/QuickStatusModal';
import { AddToCollectionModal } from '../components/movies/AddToCollectionModal';
import { MovieGridSkeleton } from '../components/common/Skeleton';
import { Film, Plus, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';

export const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters state initialised from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    genre: searchParams.get('genre') || '',
    favorite: searchParams.get('favorite') || '',
    minPersonalRating: searchParams.get('minPersonalRating') || '',
    maxRuntime: searchParams.get('maxRuntime') || '',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  const [viewMode, setViewMode] = useState('grid');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [quickModalOpen, setQuickModalOpen] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await moviesApi.getMovies({
        ...filters,
        limit: 18,
      });
      if (res.success) {
        setMovies(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch movies', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Sync with URL params
    const cleanParams = {};
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key]) cleanParams[key] = newFilters[key];
    });
    setSearchParams(cleanParams);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      status: '',
      genre: '',
      favorite: '',
      minPersonalRating: '',
      maxRuntime: '',
      sort: 'createdAt',
      order: 'desc',
      page: 1,
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      handleFilterChange({ ...filters, page: newPage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openQuickModal = (movie) => {
    setSelectedMovie(movie);
    setQuickModalOpen(true);
  };

  const openCollectionModal = (movie) => {
    setSelectedMovie(movie);
    setCollectionModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-7 h-7 text-brand-400" />
            <span>My Movie Library</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Browse and manage your persistent personal movie collection ({pagination.total} movies)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/discover"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add / Import Movie</span>
          </Link>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <MovieFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Movies Grid / Empty state */}
      {loading ? (
        <MovieGridSkeleton count={12} />
      ) : movies.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-4 max-w-lg mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            No movie records in your MongoDB library matched the specified filters or search terms.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              Clear Filters
            </button>
            <Link
              to="/discover"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-semibold"
            >
              Discover & Import New
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onMovieUpdated={fetchMovies}
              onOpenQuickModal={openQuickModal}
              onOpenCollectionModal={openCollectionModal}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Showing Page <span className="font-bold text-white">{pagination.page}</span> of{' '}
            <span className="font-bold text-white">{pagination.totalPages}</span> ({pagination.total}{' '}
            total movies)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-semibold flex items-center gap-1 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-xs font-semibold flex items-center gap-1 hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Status and Collection Modals */}
      <QuickStatusModal
        movie={selectedMovie}
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        onMovieUpdated={fetchMovies}
      />
      <AddToCollectionModal
        movie={selectedMovie}
        isOpen={collectionModalOpen}
        onClose={() => setCollectionModalOpen(false)}
      />
    </div>
  );
};
