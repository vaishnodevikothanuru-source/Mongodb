import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { collectionsApi } from '../../api/collectionsApi';
import { useToast } from '../../context/ToastContext';
import { FolderPlus, Check, Plus } from 'lucide-react';

export const AddToCollectionModal = ({ movie, isOpen, onClose }) => {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showNewInput, setShowNewInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await collectionsApi.getCollections();
      if (res.success) {
        setCollections(res.data);
      }
    } catch (err) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMovieInCollection = async (collection) => {
    if (!movie) return;
    const isAlreadyIn = collection.movies?.some((m) => (m._id || m) === movie._id);

    try {
      if (isAlreadyIn) {
        await collectionsApi.removeMovie(collection._id, movie._id);
        toast.info(`Removed from "${collection.name}"`);
      } else {
        await collectionsApi.addMovie(collection._id, movie._id);
        toast.success(`Added to "${collection.name}"`);
      }
      fetchCollections();
    } catch (err) {
      toast.error('Failed to update collection');
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      const res = await collectionsApi.createCollection({
        name: newCollectionName.trim(),
        movies: movie ? [movie._id] : [],
      });
      if (res.success) {
        toast.success(`Collection "${newCollectionName}" created and movie added!`);
        setNewCollectionName('');
        setShowNewInput(false);
        fetchCollections();
      }
    } catch (err) {
      toast.error('Failed to create collection');
    }
  };

  if (!movie) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add "${movie.title}" to Collection`} maxWidth="max-w-md">
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading your collections...</div>
        ) : collections.length === 0 && !showNewInput ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-slate-400">You don't have any custom collections yet.</p>
            <button
              onClick={() => setShowNewInput(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-semibold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Collection</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {collections.map((col) => {
              const isAdded = col.movies?.some((m) => (m._id || m) === movie._id);
              return (
                <button
                  key={col._id}
                  onClick={() => handleToggleMovieInCollection(col)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isAdded
                      ? 'bg-brand-500/15 border-brand-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <img
                      src={col.coverImage || movie.posterUrl}
                      alt={col.name}
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                    />
                    <div>
                      <p className="font-semibold text-sm">{col.name}</p>
                      <p className="text-xs text-slate-400">{col.movies?.length || 0} movies</p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                      isAdded
                        ? 'bg-brand-500 border-brand-500 text-black'
                        : 'border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* New collection creator */}
        {showNewInput ? (
          <form onSubmit={handleCreateCollection} className="pt-2 border-t border-slate-800 space-y-2">
            <input
              type="text"
              placeholder="Collection name (e.g., Best Sci-Fi 2026)"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              autoFocus
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewInput(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 text-black font-semibold text-xs"
              >
                Create & Add
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowNewInput(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-brand-400/50 text-slate-400 hover:text-brand-400 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Collection</span>
          </button>
        )}
      </div>
    </Modal>
  );
};
