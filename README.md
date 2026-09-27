# Smart Public Transportation Assistant
> **“Your Smarter Way to Commute”**

A modern, responsive, full-stack web application designed to help urban commuters find personalized public transportation routes based on **travel time, cost, delays, crowd levels, transfers, route conditions, and individual commuter preferences**.

---

## 🌟 Key Highlights & Features

1. **Smart Recommendation Engine**:
   - Multi-criteria route scoring combining speed, budget, live delays, passenger density (crowd), and transfer counts.
   - Dynamic weight adaptation based on individual commuter profiles (Fastest, Cheapest, Less Crowded, Minimal Walking).
   - Clear and explainable **“Why this route?”** insights for every suggestion.

2. **Real-Time Transit Radar & Live Crowd Monitoring**:
   - Live transit status board for Metro Rail, City Buses, and Local Trains.
   - Multi-tier crowd density indicator: **Low (🟢 Seats Available)**, **Moderate (🟡)**, and **High (🔴 Heavy Rush)**.
   - Instant delay alerts with **1-Click Dynamic Alternative Route Bypasses**.

3. **Interactive Visual Transit Map**:
   - Vector-based interactive map displaying origins, destinations, interchange nodes, crowd heat circles, and live animated vehicles.
   - Built-in OpenStreetMap layer support and Mapbox/Google Maps integration ready.

4. **Multi-Route Side-by-Side Comparison Matrix**:
   - Compare multiple transit options across travel duration, fares, transfers, walking times, delay minutes, and crowd levels in a responsive comparison matrix.

5. **Personalized Commuter Hub**:
   - Save frequent commute routines (Home → Office, Home → College, Airport Run).
   - Historical commute logbook tracking total expenditure, travel duration, and **CO2 carbon offsets**.

6. **Commuter Analytics Dashboard**:
   - Dynamic charts powered by **Recharts**: Weekly travel time distribution, transportation mode share, monthly spend vs. budget, and transit vs. driving road traffic comparisons.

7. **Admin Operations Command Center**:
   - Monitor real-time network reliability and KPIs.
   - Add, edit, and manage transit routes.
   - Broadcast live delay notices and service disruptions across the commuter network.
   - Review crowd accuracy feedback and manage user accounts.

8. **Dual-Mode Database Architecture**:
   - Native integration with **MongoDB Atlas & Mongoose ODM**.
   - Graceful **Resilient In-Memory Demo Store** fallback if `MONGODB_URI` is not configured, ensuring 100% functionality out of the box.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons, Recharts
- **Backend**: Next.js Server-Side Route Handlers (`/app/api/...`)
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT Session Cookies / Authorization Header with `bcryptjs` password hashing
- **Mapping**: Interactive Canvas & SVG Transit Visualizer (OpenStreetMap & Leaflet compatible)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18 or higher (v20+ recommended)
- **npm** or **yarn**
- (Optional) **MongoDB Atlas** account for live database persistence

### 2. Installation
Clone the repository and install all dependencies:
```bash
cd transport
npm install
```

### 3. Environment Variables Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# MongoDB Connection String (Leave blank to use the In-Memory Demo Mode)
MONGODB_URI=

# JWT Signing Secret Key
JWT_SECRET=super_secret_smart_transport_jwt_key_2026_dev

# Optional Map API Keys (Mapbox, Google Maps, OpenStreetMap)
MAP_API_KEY=
NEXT_PUBLIC_MAP_API_KEY=

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🍃 MongoDB Atlas Setup (Production Mode)

To connect a live MongoDB database:

1. Sign up or log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (e.g., M0 Free Shared Tier).
3. Under **Database Access**, create a database user with read/write privileges (note username & password).
4. Under **Network Access**, add IP address `0.0.0.0/0` (or your server's static IP) to whitelist connections.
5. Click **Connect** → **Drivers** (Node.js) and copy the connection string.
6. Replace `<password>` with your database user password and specify the database name:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/smart_transport?retryWrites=true&w=majority
   ```
7. Save `.env.local` and restart the application.

*Note: If no connection string is provided, the application automatically runs in **Resilient In-Memory Mode** with pre-seeded transit networks, sample accounts, and active routes.*

---

## 💻 Running the Application

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Production Build
```bash
npm run build
npm start
```

---

## 🔑 Pre-Configured Demo Accounts

For effortless evaluation, 1-click login buttons are provided on the login page and navigation bar:

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Commuter User** | `commuter@smarttransit.com` | `pass123` | Route planner, Saved commutes, Analytics, Profile weights |
| **Transit Admin** | `admin@smarttransit.com` | `admin123` | Route creation, Delay broadcast, Fleet management, Feedback |

---

## 📁 Project Structure

```text
smart-transport/
├── app/
│   ├── layout.tsx              # Root layout & providers
│   ├── page.tsx                # Landing page
│   ├── login/                  # Sign In page (with 1-click Demo logins)
│   ├── register/               # User registration
│   ├── dashboard/              # Commuter Central dashboard
│   ├── planner/                # Journey Planner with multi-factor filters
│   ├── routes/                 # Route Results & Comparison
│   │   └── [id]/               # Turn-by-turn Route Itinerary
│   ├── live-transit/           # Live transit radar & delay reporter
│   ├── saved-journeys/         # Saved commute routines
│   ├── history/                # Historical travel log
│   ├── notifications/          # Alert & advisory center
│   ├── analytics/              # Recharts commute analytics
│   ├── profile/                # Profile & algorithm weights customizer
│   ├── settings/               # System diagnostics & MongoDB check
│   ├── admin/                  # Admin Command & route dispatcher
│   └── api/                    # REST API Endpoints
│       ├── auth/               # register, login, me, logout
│       ├── users/              # profile, preferences
│       ├── routes/             # route CRUD & details
│       ├── journeys/           # search recommendations, history
│       ├── transit/            # live status, updates, simulation
│       ├── saved-journeys/     # saved journeys CRUD
│       ├── notifications/      # alert management
│       ├── feedback/           # trip rating & crowd feedback
│       └── admin/              # stats, user management
├── components/
│   ├── Navbar.tsx              # Responsive navigation & demo switchers
│   ├── RouteCard.tsx           # Scored route card with "Why this route?"
│   ├── InteractiveMap.tsx      # High-fidelity SVG transit map & vehicle GPS
│   ├── RouteComparisonModal.tsx# Side-by-side comparison matrix
│   ├── QuickJourneyPlanner.tsx # Fast autocomplete route search
│   ├── DynamicAlternativeAlert.tsx # Real-time delay bypass banner
│   ├── CrowdIndicator.tsx      # Low, Moderate, High crowd badge & meter
│   ├── TransitStatusBadge.tsx  # On-time, Delayed, Disrupted indicator
│   ├── FeedbackModal.tsx       # 5-star trip & crowd rating
│   ├── NotificationDrawer.tsx  # Slide-out notification center
│   └── DbStatusBanner.tsx      # MongoDB connection status indicator
├── lib/
│   ├── mongodb.ts              # Mongoose connection pool & caching
│   ├── auth.ts                 # JWT signing, verification & password hashing
│   ├── recommendation.ts       # Multi-criteria recommendation engine
│   ├── transitStore.ts         # In-memory resilient store & event simulator
│   ├── mockData.ts             # Seed datasets (Metro, Bus, Local Train)
│   └── context/AuthContext.tsx # React authentication & session context
├── models/
│   ├── User.ts                 # User model with preferences & saved locations
│   ├── Route.ts                # Route model with stops & segments
│   ├── TransitUpdate.ts        # Live delay & disruption broadcasts
│   ├── SavedJourney.ts         # Saved commute favorites
│   ├── JourneyHistory.ts       # Completed journey log
│   ├── Notification.ts         # Notification model
│   └── Feedback.ts             # Commuter ratings & crowd feedback
├── .env.example
├── package.json
└── README.md
```

---

## 🧮 Recommendation Engine Scoring Algorithm

The assistant scores each candidate route ($0 - 100$) using dynamic user-tailored weights:

$$\text{Route Score} = \frac{W_{\text{time}} \cdot S_{\text{time}} + W_{\text{cost}} \cdot S_{\text{cost}} + W_{\text{crowd}} \cdot S_{\text{crowd}} + W_{\text{delay}} \cdot S_{\text{delay}} + W_{\text{transfers}} \cdot S_{\text{transfers}} + W_{\text{walk}} \cdot S_{\text{walk}}}{\sum W} + \text{Mode Bonus} - \text{Constraint Penalties}$$

- $S_{\text{time}}$: Normalized travel time factor
- $S_{\text{cost}}$: Normalized fare factor
- $S_{\text{crowd}}$: Passenger density factor ($\text{Low} = 100, \text{Moderate} = 65, \text{High} = 20$)
- $S_{\text{delay}}$: Headway punctuality score ($100 - 8 \times \text{delayMinutes}$)
- $S_{\text{transfers}}$: Interchange friction score ($0 \text{ transfers} = 100, 1 = 70, 2 = 35$)
- $S_{\text{walk}}$: First/last-mile walking effort score

When a commuter toggles **"Prefer Fastest"**, $W_{\text{time}}$ is automatically boosted; when choosing **"Avoid Crowds"**, $W_{\text{crowd}}$ is prioritized to steer commuters toward less crowded coaches.

---

## 📄 License
MIT License. Built for smart urban commuting.
