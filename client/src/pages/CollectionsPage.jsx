import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collectionsApi } from '../api/collectionsApi';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { FolderHeart, Plus, Film, Trash2, Edit3, ArrowRight } from 'lucide-react';

export const CollectionsPage = () => {
  const toast = useToast();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    fetchCollections();
  }, []);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await collectionsApi.createCollection({
        name: name.trim(),
        description: description.trim(),
        coverImage: coverImage.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Collection "${name}" created in MongoDB!`);
        setName('');
        setDescription('');
        setCoverImage('');
        setCreateModalOpen(false);
        fetchCollections();
      }
    } catch (err) {
      toast.error('Failed to create collection');
    }
  };

  const handleDelete = async (id, colName) => {
    if (window.confirm(`Delete collection "${colName}"? (Movies will remain in your library)`)) {
      try {
        await collectionsApi.deleteCollection(id);
        toast.success('Collection deleted');
        fetchCollections();
      } catch (err) {
        toast.error('Failed to delete collection');
      }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
            <FolderHeart className="w-7 h-7 text-brand-400" />
            <span>Custom Collections</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Curate and group your movies into themed collections stored in MongoDB.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="py-16 text-center glass-panel rounded-3xl border border-slate-800 space-y-4 max-w-md mx-auto p-8">
          <FolderHeart className="w-14 h-14 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Collections Created Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create collections like "Sci-Fi Masterpieces", "Oscar Winners", or "Weekend Rewatches" to organize your films.
          </p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Collection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <div
              key={col._id}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                  <img
                    src={col.coverImage || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80'}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-brand-400 font-bold text-xs">
                      {col.movies?.length || 0} movies
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-base text-white group-hover:text-brand-400 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {col.description || 'Custom movie collection.'}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/80 mt-2">
                <Link
                  to={`/collections/${col._id}`}
                  className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                >
                  <span>View Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDelete(col._id, col.name)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                  title="Delete collection"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Custom Collection"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Collection Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Mind-Bending Sci-Fi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the collection theme..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-bold text-xs"
            >
              Create Collection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
