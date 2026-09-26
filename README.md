# 🎬 CineVault — Advanced Full-Stack Movie Library & AI Recommendation Platform

> **CineVault** is a production-ready, high-performance personal movie management and intelligent recommendation platform designed with **MongoDB as the primary source of truth**.

---

## 🌟 Key Features

### 1. 🗄️ MongoDB as the Source of Truth
- Persistent personal movie storage with full CRUD capabilities.
- Strict user-level data ownership and isolation (`userId` enforced on all operations).
- Compound indexes for ultra-fast filtering across genres, statuses, ratings, release years, and full-text search.
- Optional TMDB integration for discovery & enriched metadata without replacing MongoDB persistence.

### 2. 🧠 Multi-Factor Recommendation Engine
- **Algorithmic Scoring Matrix**:
  - 🎭 **Genre Match (30%)**: Weighted by watch frequency and personal high ratings.
  - 🎬 **Director Match (15%)**: Affinity calculated from top-rated films.
  - ⭐ **Actor Match (15%)**: Cast compatibility.
  - 📊 **Rating Compatibility (15%)**: User's preferred minimum rating threshold.
  - 📜 **Watch History Similarity (10%)**: Temporal overlap with recently viewed films.
  - 🔖 **Watchlist Overlap (10%)**: Similarity to movies queued in user's watchlist.
  - ⏱️ **Preferences & Runtime (5%)**: Preferred duration ranges and language compatibility.
- **Dynamic Categorized Feeds**:
  - *Recommended For You*
  - *Because You Watched [Title]...*
  - *Because You Liked [Title] (9+/10)...*
  - *Based on Your Watchlist*
  - *Hidden Gems*
  - *Director Spotlight*
  - *Rewatch Suggestions (From your own library)*
- **Explainable Recommendations**: Transparent explanations generated from real database signals.
- **Recommendation Learning**: Tracks user feedback (👍 Like, 👎 Not Interested, 🔖 Watchlist, 👁️ Watched) stored directly in MongoDB.

### 3. 🎯 Smart Watchlist & Priorities
- Priority queues: **High**, **Medium**, and **Low** with drag/reorder support.
- **Smart Time Filter**: *"I have 90 minutes"* or *"I have 2 hours"* filters fitting movies instantly.
- One-click status transitions with celebratory confetti.

### 4. 📅 Chronological Viewing Timeline & Watch Time Analytics
- Dedicated **Watch History** tracking multiple rewatches and dates.
- Monthly chronological grouping (e.g., *September 2026*, *August 2026*).
- **Watch-Time Intelligence**: Calculates total watch time in hours and minutes from real completed movie runtimes.
- Interactive charts for **Genre Breakdown %** and **1–10 Rating Spread**.

### 5. 🔍 Advanced Discovery & Movie Importer
- Curated discovery feeds: *Trending*, *Popular*, *Top Rated*, *Upcoming*, *Hidden Gems*.
- **Mood Discovery**: Map moods (*Mind-bending*, *Dark*, *Funny*, *Emotional*, *Exciting*, *Relaxing*) to movies.
- Global TMDB / Catalog search with metadata preview and 1-click import into personal MongoDB library with duplicate protection.

### 6. 📁 Custom Collections & Tags
- Create custom collections (e.g., *"Christopher Nolan Masterpieces"*, *"Mind-Bending Sci-Fi"*).
- Custom covers, descriptions, and dynamic movie associations.

### 7. ⚖️ Movie Comparison & 🎲 Random Roulette
- **Side-by-side comparison** of two movies across ratings, runtime, director, cast, personal status, and reviews.
- **Interactive Roulette Picker** for deciding tonight's film with runtime and genre constraints.

### 8. 📦 Data Import / Export
- Export complete personal collection to **JSON** or **CSV**.
- Import movie libraries via **JSON** with duplicate detection.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, TanStack Query, Lucide Icons, Canvas Confetti |
| **Backend** | Node.js, Express.js, REST API, Mongoose ODM, JWT Authentication, bcryptjs, Helmet, Morgan, Rate Limiting |
| **Database** | MongoDB (Atlas compatible, Local MongoDB, Docker compatible) |
| **DevOps** | Docker, Docker Compose |

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Local instance or MongoDB Atlas connection string)

### 2. Clone and Setup Environment Variables
```bash
# Server configuration
cd server
cp .env.example .env
```
Edit `.env` if you are using MongoDB Atlas or custom ports:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/movie_library
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Install Dependencies
```bash
# In the root directory:
npm --prefix server install
npm --prefix client install
```

### 4. Seed Database (Demo User & Rich Movie Catalog)
Populates MongoDB with real movies, watch history, collections, and a ready-to-test demo account:
```bash
npm --prefix server run seed
```
**Demo Account Credentials:**
- **Email:** `demo@movielibrary.com`
- **Password:** `password123`

### 5. Run the Application
In two terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
npm --prefix server start

# Terminal 2: Frontend Client (Port 5173)
npm --prefix client run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Running with Docker & Docker Compose

To start MongoDB, the Node.js API, and the React frontend in isolated Docker containers:

```bash
docker-compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- MongoDB: `localhost:27017`

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET  /api/auth/me` — Get current authenticated user profile
- `PUT  /api/auth/profile` — Update user name, bio, profile image
- `PUT  /api/auth/change-password` — Update account password
- `DELETE /api/auth/account` — Delete account and all personal movie data

### Personal Movie Library
- `GET    /api/movies` — Paginated list of movies with multi-factor filters & search
- `GET    /api/movies/:id` — Single movie details with history and collections
- `POST   /api/movies` — Add/import movie into personal library
- `PUT    /api/movies/:id` — Update movie metadata
- `DELETE /api/movies/:id` — Remove movie from library
- `PATCH  /api/movies/:id/status` — Update watch status (`WATCHLIST`, `WATCHING`, `WATCHED`, `UNWATCHED`, `ABANDONED`)
- `PATCH  /api/movies/:id/favorite` — Toggle favorite flag
- `PATCH  /api/movies/:id/rating` — Update personal 1-10 rating
- `PATCH  /api/movies/:id/review` — Update private review, quote, pros, and cons

### Watchlist & Priorities
- `GET    /api/watchlist` — Get prioritized watchlist items
- `POST   /api/watchlist` — Add movie to watchlist with priority (`High`, `Medium`, `Low`)
- `PATCH  /api/watchlist/:id/priority` — Update priority level and notes
- `DELETE /api/watchlist/:id` — Remove from watchlist
- `GET    /api/watchlist/suggestions` — Smart suggestions based on available duration

### Watch History & Viewing Timeline
- `GET    /api/history` — Get watch logs with date filters
- `POST   /api/history` — Log new viewing session
- `GET    /api/history/timeline` — Chronological monthly grouped timeline
- `DELETE /api/history/:id` — Remove history entry

### Custom Collections
- `GET    /api/collections` — Get all user collections
- `GET    /api/collections/:id` — Get collection with populated movies
- `POST   /api/collections` — Create new custom collection
- `PUT    /api/collections/:id` — Update collection details
- `DELETE /api/collections/:id` — Delete collection
- `POST   /api/collections/:id/movies` — Add movie to collection
- `DELETE /api/collections/:id/movies/:movieId` — Remove movie from collection

### Recommendations & Discovery
- `GET    /api/recommendations` — Multi-category personalized recommendations
- `GET    /api/recommendations/similar` — Similar movies for details page
- `POST   /api/recommendations/feedback` — Submit feedback (like, dislike, hide)
- `GET    /api/discover/curated` — Curated trending/popular/top rated feeds
- `GET    /api/discover/mood` — Mood-based discovery candidates
- `GET    /api/discover/search` — External TMDB & Global catalog search

### Analytics & Data Transfer
- `GET    /api/statistics` — Total watch hours, genre distributions, rating spread
- `GET    /api/preferences` — Get recommendation engine tuning parameters
- `PUT    /api/preferences` — Update preferred genres, directors, runtimes
- `GET    /api/data/export/json` — Export database as JSON
- `GET    /api/data/export/csv` — Export database as CSV
- `POST   /api/data/import/json` — Import movies from JSON payload

---

## 🔒 Security & Data Integrity
- Passwords securely hashed with **bcryptjs** (10 salt rounds).
- **JWT (JSON Web Tokens)** for stateless authentication.
- **Helmet** for HTTP header hardening.
- **Express Rate Limiting** against brute-force attacks.
- Duplicate detection on import preventing accidental duplicate movie entries.
- Full server-side query parameter validation.

---

## 📄 License
MIT License. Crafted with precision for film lovers and cinema enthusiasts.
