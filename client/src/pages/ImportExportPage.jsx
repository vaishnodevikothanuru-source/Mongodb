import React, { useState } from 'react';
import { dataApi } from '../api/statsApi';
import { useToast } from '../context/ToastContext';
import { FileSpreadsheet, Download, Upload, FileJson, Check, AlertCircle } from 'lucide-react';

export const ImportExportPage = () => {
  const toast = useToast();
  const [jsonText, setJsonText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImportJson = async (e) => {
    e.preventDefault();
    if (!jsonText.trim()) return;

    try {
      setImporting(true);
      let parsed;
      try {
        parsed = JSON.parse(jsonText.trim());
      } catch (err) {
        toast.error('Invalid JSON format. Please verify syntax.');
        setImporting(false);
        return;
      }

      const moviesArray = Array.isArray(parsed) ? parsed : parsed.movies || [];
      if (moviesArray.length === 0) {
        toast.error('No movie items found in the parsed JSON array.');
        setImporting(false);
        return;
      }

      const res = await dataApi.importJson(moviesArray);
      if (res.success) {
        setImportResult(res.data);
        toast.success(res.message);
        setJsonText('');
      }
    } catch (err) {
      toast.error('Import failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadExport = (type) => {
    const token = localStorage.getItem('token');
    const url = type === 'json' ? '/api/data/export/json' : '/api/data/export/csv';

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `my_movie_library.${type}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success(`Exported as ${type.toUpperCase()} successfully!`);
      })
      .catch(() => toast.error('Export failed'));
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2.5">
          <FileSpreadsheet className="w-7 h-7 text-brand-400" />
          <span>Data Import & Export</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Back up your persistent MongoDB movie collection or import data from other services.
        </p>
      </div>

      {/* Export Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-brand-400" />
          <span>Export Movie Library</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Download your complete movie database including personal ratings, status, reviews, and custom tags.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={() => handleDownloadExport('json')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <FileJson className="w-4 h-4 text-brand-400" />
            <span>Download JSON (.json)</span>
          </button>

          <button
            onClick={() => handleDownloadExport('csv')}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Download CSV (.csv)</span>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-cyan-400" />
          <span>Import Movies via JSON</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Paste a JSON array of movie objects. Existing duplicates by title/TMDB ID will be safely skipped.
        </p>

        <form onSubmit={handleImportJson} className="space-y-4">
          <textarea
            rows={8}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder={`[\n  {\n    "title": "Inception",\n    "director": "Christopher Nolan",\n    "releaseYear": 2010,\n    "genres": ["Sci-Fi", "Action"],\n    "status": "WATCHED",\n    "personalRating": 9.0\n  }\n]`}
            className="w-full bg-slate-900 border border-slate-700 font-mono text-xs text-slate-200 rounded-2xl p-4 focus:outline-none focus:border-cyan-400"
          />

          <button
            type="submit"
            disabled={importing || !jsonText.trim()}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{importing ? 'Importing to MongoDB...' : 'Start Import'}</span>
          </button>
        </form>

        {importResult && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2 animate-slide-up">
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>Import Completed Successfully</span>
            </p>
            <p className="text-slate-300">
              • <strong className="text-white">{importResult.importedCount}</strong> new movies imported into MongoDB.
            </p>
            <p className="text-slate-400">
              • <strong className="text-slate-300">{importResult.duplicateCount}</strong> duplicates skipped.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
