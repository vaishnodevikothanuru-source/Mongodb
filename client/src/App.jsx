import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { WatchHistoryPage } from './pages/WatchHistoryPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { StatisticsPage } from './pages/StatisticsPage';
import { ComparePage } from './pages/ComparePage';
import { RandomPickerPage } from './pages/RandomPickerPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { ProfilePreferencesPage } from './pages/ProfilePreferencesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected App Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/history" element={<WatchHistoryPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/picker" element={<RandomPickerPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/data" element={<ImportExportPage />} />
        <Route path="/profile" element={<ProfilePreferencesPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
