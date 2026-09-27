const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_transport';

// 1. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  homeLocation: { type: String, default: 'Dwarka Sector 21' },
  workLocation: { type: String, default: 'Noida Electronic City' },
  collegeLocation: { type: String, default: 'Delhi University North Campus' },
  preferences: {
    preferredMode: { type: String, default: 'metro' },
    prioritizeSpeed: { type: Boolean, default: true },
    prioritizeCost: { type: Boolean, default: false },
    prioritizeComfort: { type: Boolean, default: true },
    avoidCrowds: { type: Boolean, default: true },
    accessibilityRequired: { type: Boolean, default: false },
    maxWalkingMinutes: { type: Number, default: 15 },
    notifyDelays: { type: Boolean, default: true },
    notifyCrowds: { type: Boolean, default: true },
  }
}, { timestamps: true });

// 2. Route Schema
const stopSchema = new mongoose.Schema({
  id: String,
  name: String,
  latitude: Number,
  longitude: Number,
  timeOffsetMinutes: Number,
  crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
  isInterchange: Boolean,
  transfersAvailable: [String]
}, { _id: false });

const segmentSchema = new mongoose.Schema({
  mode: String,
  lineName: String,
  lineColor: String,
  fromStop: String,
  toStop: String,
  durationMinutes: Number,
  distanceKm: Number,
  fare: Number,
  instructions: String,
  crowdLevel: String,
  delayMinutes: Number
}, { _id: false });

const routeSchema = new mongoose.Schema({
  routeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  transportType: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  stops: [stopSchema],
  segments: [segmentSchema],
  distance: Number,
  estimatedTime: Number,
  fare: Number,
  transfers: Number,
  walkingTime: Number,
  crowdLevel: String,
  status: { type: String, enum: ['on-time', 'delayed', 'disrupted', 'cancelled'], default: 'on-time' },
  delayMinutes: { type: Number, default: 0 },
  frequencyMinutes: Number,
  co2SavedKg: Number,
  wheelchairAccessible: Boolean,
  airConditioned: Boolean,
  summary: String,
  polylinePoints: [[Number]],
  scheduleTimes: [String]
}, { timestamps: true });

// 3. Transit Update Schema
const transitUpdateSchema = new mongoose.Schema({
  routeId: String,
  routeName: String,
  transportType: String,
  severity: { type: String, enum: ['info', 'warning', 'critical'] },
  title: String,
  message: String,
  affectedStops: [String],
  delayMinutes: Number,
  timestamp: { type: Date, default: Date.now }
});

// 4. Saved Journey Schema
const savedJourneySchema = new mongoose.Schema({
  userId: String,
  name: String,
  origin: String,
  destination: String,
  preferredMode: String,
  estimatedTime: Number,
  estimatedFare: Number
}, { timestamps: true });

// 5. Journey History Schema
const journeyHistorySchema = new mongoose.Schema({
  userId: String,
  origin: String,
  destination: String,
  routeId: String,
  routeName: String,
  transportType: String,
  travelTime: Number,
  fare: Number,
  crowdLevel: String,
  co2SavedKg: Number,
  completedAt: { type: Date, default: Date.now }
});

// 6. Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: String,
  type: String,
  title: String,
  message: String,
  routeId: String,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// 7. Feedback Schema
const feedbackSchema = new mongoose.Schema({
  userId: String,
  routeId: String,
  rating: Number,
  category: String,
  comment: String,
  crowdReport: String,
  cleanlinessReport: String,
  safetyRating: Number
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);
const TransitUpdate = mongoose.models.TransitUpdate || mongoose.model('TransitUpdate', transitUpdateSchema);
const SavedJourney = mongoose.models.SavedJourney || mongoose.model('SavedJourney', savedJourneySchema);
const JourneyHistory = mongoose.models.JourneyHistory || mongoose.model('JourneyHistory', journeyHistorySchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

async function seedDatabase() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully!');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Route.deleteMany({}),
    TransitUpdate.deleteMany({}),
    SavedJourney.deleteMany({}),
    JourneyHistory.deleteMany({}),
    Notification.deleteMany({}),
    Feedback.deleteMany({})
  ]);
  console.log('Cleared existing collections for fresh seed.');

  // 1. Seed Users
  const users = [
    {
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      passwordHash: bcrypt.hashSync('pass123', 10),
      role: 'user',
      homeLocation: 'Dwarka Sector 21',
      workLocation: 'Noida Electronic City',
      collegeLocation: 'Delhi University North Campus',
      preferences: {
        preferredMode: 'metro',
        prioritizeSpeed: true,
        prioritizeCost: false,
        prioritizeComfort: true,
        avoidCrowds: true,
        accessibilityRequired: false,
        maxWalkingMinutes: 10,
        notifyDelays: true,
        notifyCrowds: true
      }
    },
    {
      name: 'Transit Admin',
      email: 'admin@transit.gov.in',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      homeLocation: 'Connaught Place',
      workLocation: 'Central Transit Command',
      collegeLocation: '',
      preferences: {
        preferredMode: 'metro',
        prioritizeSpeed: true,
        prioritizeCost: false,
        prioritizeComfort: true,
        avoidCrowds: false,
        accessibilityRequired: false,
        maxWalkingMinutes: 20,
        notifyDelays: true,
        notifyCrowds: true
      }
    },
    {
      name: 'Rahul Verma',
      email: 'rahul.v@example.com',
      passwordHash: bcrypt.hashSync('pass123', 10),
      role: 'user',
      homeLocation: 'Kashmere Gate',
      workLocation: 'Cyber Hub Gurugram',
      collegeLocation: 'IIT Delhi',
      preferences: {
        preferredMode: 'train',
        prioritizeSpeed: true,
        prioritizeCost: true,
        prioritizeComfort: false,
        avoidCrowds: false,
        accessibilityRequired: false,
        maxWalkingMinutes: 15,
        notifyDelays: true,
        notifyCrowds: false
      }
    }
  ];
  await User.insertMany(users);
  console.log(`[OK] Seeded ${users.length} Users`);

  // 2. Seed Routes
  const routes = [
    {
      routeId: 'MTR-BLU-01',
      name: 'Metro Blue Line (Rapid Transit)',
      transportType: 'metro',
      origin: 'Dwarka Sector 21',
      destination: 'Noida Electronic City',
      distance: 28.5,
      estimatedTime: 38,
      fare: 40,
      transfers: 0,
      walkingTime: 4,
      crowdLevel: 'moderate',
      status: 'on-time',
      delayMinutes: 0,
      frequencyMinutes: 4,
      co2SavedKg: 2.8,
      wheelchairAccessible: true,
      airConditioned: true,
      summary: 'Direct high-speed metro corridor with air conditioning and dedicated women coach.',
      scheduleTimes: ['07:00 AM', '07:04 AM', '07:08 AM', '07:12 AM', '07:16 AM', '07:20 AM'],
      stops: [
        { id: 's1', name: 'Dwarka Sector 21', latitude: 28.5524, longitude: 77.0583, timeOffsetMinutes: 0, crowdLevel: 'low', isInterchange: true, transfersAvailable: ['Airport Express'] },
        { id: 's2', name: 'Janakpuri West', latitude: 28.6294, longitude: 77.0778, timeOffsetMinutes: 10, crowdLevel: 'moderate', isInterchange: true, transfersAvailable: ['Magenta Line'] },
        { id: 's3', name: 'Rajiv Chowk (Connaught Place)', latitude: 28.6328, longitude: 77.2195, timeOffsetMinutes: 22, crowdLevel: 'high', isInterchange: true, transfersAvailable: ['Yellow Line', 'City Bus Hub'] },
        { id: 's4', name: 'Mandi House', latitude: 28.6258, longitude: 77.2343, timeOffsetMinutes: 26, crowdLevel: 'moderate', isInterchange: true, transfersAvailable: ['Violet Line'] },
        { id: 's5', name: 'Mayur Vihar-I', latitude: 28.6044, longitude: 77.2942, timeOffsetMinutes: 32, crowdLevel: 'moderate', isInterchange: true, transfersAvailable: ['Pink Line'] },
        { id: 's6', name: 'Noida Electronic City', latitude: 28.6277, longitude: 77.3725, timeOffsetMinutes: 38, crowdLevel: 'low' },
      ],
      segments: [
        {
          mode: 'walk',
          lineName: 'Pedestrian Walk',
          lineColor: '#10b981',
          fromStop: 'Origin Entrance',
          toStop: 'Dwarka Platform 1',
          durationMinutes: 4,
          distanceKm: 0.3,
          fare: 0,
          instructions: 'Walk through Concourse Gate 2 to Platform 1',
          crowdLevel: 'low',
          delayMinutes: 0
        },
        {
          mode: 'metro',
          lineName: 'Blue Line Express',
          lineColor: '#2563eb',
          fromStop: 'Dwarka Sector 21',
          toStop: 'Noida Electronic City',
          durationMinutes: 34,
          distanceKm: 28.2,
          fare: 40,
          instructions: 'Board train towards Noida Electronic City. Alight at terminal.',
          crowdLevel: 'moderate',
          delayMinutes: 0
        }
      ],
      polylinePoints: [
        [28.5524, 77.0583],
        [28.6294, 77.0778],
        [28.6328, 77.2195],
        [28.6258, 77.2343],
        [28.6044, 77.2942],
        [28.6277, 77.3725]
      ]
    },
    {
      routeId: 'MTR-YEL-02',
      name: 'Metro Yellow Line (North-South Spine)',
      transportType: 'metro',
      origin: 'Samaypur Badli',
      destination: 'Millennium City Centre Gurugram',
      distance: 49.3,
      estimatedTime: 62,
      fare: 60,
      transfers: 0,
      walkingTime: 5,
      crowdLevel: 'high',
      status: 'delayed',
      delayMinutes: 8,
      frequencyMinutes: 3,
      co2SavedKg: 4.1,
      wheelchairAccessible: true,
      airConditioned: true,
      summary: 'High-density arterial corridor connecting North Delhi, Central Hub, and Gurugram Cyber City.',
      scheduleTimes: ['06:30 AM', '06:33 AM', '06:36 AM', '06:40 AM'],
      stops: [
        { id: 'y1', name: 'Samaypur Badli', latitude: 28.7454, longitude: 77.1362, timeOffsetMinutes: 0, crowdLevel: 'low' },
        { id: 'y2', name: 'Kashmere Gate', latitude: 28.6675, longitude: 77.2284, timeOffsetMinutes: 18, crowdLevel: 'high', isInterchange: true, transfersAvailable: ['Red Line', 'Violet Line', 'ISBT'] },
        { id: 'y3', name: 'Rajiv Chowk', latitude: 28.6328, longitude: 77.2195, timeOffsetMinutes: 28, crowdLevel: 'high', isInterchange: true, transfersAvailable: ['Blue Line'] },
        { id: 'y4', name: 'Central Secretariat', latitude: 28.6147, longitude: 77.2119, timeOffsetMinutes: 34, crowdLevel: 'moderate', isInterchange: true, transfersAvailable: ['Violet Line'] },
        { id: 'y5', name: 'Hauz Khas', latitude: 28.5432, longitude: 77.2065, timeOffsetMinutes: 46, crowdLevel: 'high', isInterchange: true, transfersAvailable: ['Magenta Line'] },
        { id: 'y6', name: 'Millennium City Centre', latitude: 28.4593, longitude: 77.0725, timeOffsetMinutes: 62, crowdLevel: 'moderate' }
      ],
      segments: [
        {
          mode: 'metro',
          lineName: 'Yellow Line Direct',
          lineColor: '#eab308',
          fromStop: 'Samaypur Badli',
          toStop: 'Millennium City Centre',
          durationMinutes: 62,
          distanceKm: 49.3,
          fare: 60,
          instructions: 'Direct high-frequency train towards HUDA City Centre',
          crowdLevel: 'high',
          delayMinutes: 8
        }
      ],
      polylinePoints: [
        [28.7454, 77.1362],
        [28.6675, 77.2284],
        [28.6328, 77.2195],
        [28.6147, 77.2119],
        [28.5432, 77.2065],
        [28.4593, 77.0725]
      ]
    },
    {
      routeId: 'BUS-EV-500',
      name: 'Electric City Express (Ring Road Corridor)',
      transportType: 'bus',
      origin: 'Anand Vihar ISBT',
      destination: 'Dhaula Kuan Hub',
      distance: 24.0,
      estimatedTime: 48,
      fare: 25,
      transfers: 0,
      walkingTime: 6,
      crowdLevel: 'low',
      status: 'on-time',
      delayMinutes: 0,
      frequencyMinutes: 8,
      co2SavedKg: 3.2,
      wheelchairAccessible: true,
      airConditioned: true,
      summary: 'Zero-emission electric luxury low-floor bus running along dedicated Ring Road BRT lanes.',
      scheduleTimes: ['07:15 AM', '07:25 AM', '07:35 AM', '07:45 AM'],
      stops: [
        { id: 'b1', name: 'Anand Vihar ISBT', latitude: 28.6502, longitude: 77.3160, timeOffsetMinutes: 0, crowdLevel: 'moderate', isInterchange: true },
        { id: 'b2', name: 'Sarai Kale Khan / Nizamuddin', latitude: 28.5898, longitude: 77.2568, timeOffsetMinutes: 16, crowdLevel: 'low', isInterchange: true },
        { id: 'b3', name: 'Lajpat Nagar Ring Road', latitude: 28.5700, longitude: 77.2370, timeOffsetMinutes: 25, crowdLevel: 'moderate' },
        { id: 'b4', name: 'AIIMS Ring Road Flyover', latitude: 28.5672, longitude: 77.2100, timeOffsetMinutes: 34, crowdLevel: 'moderate' },
        { id: 'b5', name: 'Dhaula Kuan Interchange Hub', latitude: 28.5921, longitude: 77.1610, timeOffsetMinutes: 48, crowdLevel: 'low', isInterchange: true }
      ],
      segments: [
        {
          mode: 'bus',
          lineName: 'EV Route 500',
          lineColor: '#10b981',
          fromStop: 'Anand Vihar ISBT',
          toStop: 'Dhaula Kuan Hub',
          durationMinutes: 48,
          distanceKm: 24.0,
          fare: 25,
          instructions: 'Board low-floor electric bus at Bay 4. Contactless NFC payment accepted.',
          crowdLevel: 'low',
          delayMinutes: 0
        }
      ],
      polylinePoints: [
        [28.6502, 77.3160],
        [28.5898, 77.2568],
        [28.5700, 77.2370],
        [28.5672, 77.2100],
        [28.5921, 77.1610]
      ]
    },
    {
      routeId: 'TRN-SUB-09',
      name: 'Suburban Commuter Rail (Ghaziabad-New Delhi)',
      transportType: 'train',
      origin: 'Ghaziabad Junction',
      destination: 'New Delhi Railway Station',
      distance: 26.0,
      estimatedTime: 32,
      fare: 15,
      transfers: 0,
      walkingTime: 8,
      crowdLevel: 'moderate',
      status: 'on-time',
      delayMinutes: 0,
      frequencyMinutes: 15,
      co2SavedKg: 3.9,
      wheelchairAccessible: false,
      airConditioned: false,
      summary: 'High-speed heavy rail connection. Most economical option for inter-city cross-corridor transit.',
      scheduleTimes: ['06:45 AM', '07:15 AM', '07:45 AM'],
      stops: [
        { id: 't1', name: 'Ghaziabad Junction', latitude: 28.6538, longitude: 77.4300, timeOffsetMinutes: 0, crowdLevel: 'moderate' },
        { id: 't2', name: 'Sahibabad', latitude: 28.6720, longitude: 77.3480, timeOffsetMinutes: 10, crowdLevel: 'moderate' },
        { id: 't3', name: 'Anand Vihar Terminal', latitude: 28.6502, longitude: 77.3160, timeOffsetMinutes: 18, crowdLevel: 'low' },
        { id: 't4', name: 'New Delhi Railway Station', latitude: 28.6415, longitude: 77.2212, timeOffsetMinutes: 32, crowdLevel: 'high', isInterchange: true }
      ],
      segments: [
        {
          mode: 'train',
          lineName: 'Northern Suburban Express',
          lineColor: '#6366f1',
          fromStop: 'Ghaziabad Junction',
          toStop: 'New Delhi Railway Station',
          durationMinutes: 32,
          distanceKm: 26.0,
          fare: 15,
          instructions: 'Board EMU fast shuttle from Platform 3.',
          crowdLevel: 'moderate',
          delayMinutes: 0
        }
      ],
      polylinePoints: [
        [28.6538, 77.4300],
        [28.6720, 77.3480],
        [28.6502, 77.3160],
        [28.6415, 77.2212]
      ]
    },
    {
      routeId: 'MTR-MAG-04',
      name: 'Metro Magenta Line (Orbital Connector)',
      transportType: 'metro',
      origin: 'Janakpuri West',
      destination: 'Botanical Garden',
      distance: 37.5,
      estimatedTime: 52,
      fare: 50,
      transfers: 0,
      walkingTime: 4,
      crowdLevel: 'low',
      status: 'on-time',
      delayMinutes: 0,
      frequencyMinutes: 5,
      co2SavedKg: 3.5,
      wheelchairAccessible: true,
      airConditioned: true,
      summary: 'Driverless high-tech orbital metro bypassing city centre congestion with airport T1 terminal access.',
      scheduleTimes: ['06:50 AM', '06:55 AM', '07:00 AM'],
      stops: [
        { id: 'm1', name: 'Janakpuri West', latitude: 28.6294, longitude: 77.0778, timeOffsetMinutes: 0, crowdLevel: 'low', isInterchange: true },
        { id: 'm2', name: 'IGI Airport Terminal 1D', latitude: 28.5600, longitude: 77.1200, timeOffsetMinutes: 14, crowdLevel: 'low' },
        { id: 'm3', name: 'Hauz Khas', latitude: 28.5432, longitude: 77.2065, timeOffsetMinutes: 28, crowdLevel: 'moderate', isInterchange: true },
        { id: 'm4', name: 'Kalkaji Mandir', latitude: 28.5498, longitude: 77.2580, timeOffsetMinutes: 38, crowdLevel: 'moderate', isInterchange: true },
        { id: 'm5', name: 'Botanical Garden Noida', latitude: 28.5640, longitude: 77.3340, timeOffsetMinutes: 52, crowdLevel: 'low', isInterchange: true }
      ],
      segments: [
        {
          mode: 'metro',
          lineName: 'Magenta Line Orbital',
          lineColor: '#ec4899',
          fromStop: 'Janakpuri West',
          toStop: 'Botanical Garden Noida',
          durationMinutes: 52,
          distanceKm: 37.5,
          fare: 50,
          instructions: 'Board driverless train towards Botanical Garden',
          crowdLevel: 'low',
          delayMinutes: 0
        }
      ],
      polylinePoints: [
        [28.6294, 77.0778],
        [28.5600, 77.1200],
        [28.5432, 77.2065],
        [28.5498, 77.2580],
        [28.5640, 77.3340]
      ]
    }
  ];
  await Route.insertMany(routes);
  console.log(`[OK] Seeded ${routes.length} Transit Routes`);

  // 3. Seed Transit Updates
  const updates = [
    {
      routeId: 'MTR-YEL-02',
      routeName: 'Metro Yellow Line',
      transportType: 'metro',
      severity: 'warning',
      title: 'Signal Maintenance near Rajiv Chowk',
      message: 'Expect 8-10 minute dwell delay between Kashmere Gate and Rajiv Chowk. Alternate: Magenta Line interchange.',
      affectedStops: ['Kashmere Gate', 'Rajiv Chowk'],
      delayMinutes: 8
    },
    {
      routeId: 'MTR-BLU-01',
      routeName: 'Metro Blue Line',
      transportType: 'metro',
      severity: 'info',
      title: 'Smooth High-Speed Operations',
      message: 'All trains operating on time with 4-minute frequency.',
      affectedStops: [],
      delayMinutes: 0
    },
    {
      routeId: 'BUS-EV-500',
      routeName: 'EV Route 500',
      transportType: 'bus',
      severity: 'info',
      title: 'Dedicated BRT Lanes Cleared',
      message: 'Zero delays on Ring Road corridor.',
      affectedStops: [],
      delayMinutes: 0
    }
  ];
  await TransitUpdate.insertMany(updates);
  console.log(`[OK] Seeded ${updates.length} Live Transit Updates`);

  // 4. Seed Saved Journeys
  const savedJourneys = [
    {
      userId: 'priya-user-id',
      name: 'Daily Morning Office Commute',
      origin: 'Dwarka Sector 21',
      destination: 'Noida Electronic City',
      preferredMode: 'metro',
      estimatedTime: 38,
      estimatedFare: 40
    },
    {
      userId: 'priya-user-id',
      name: 'Weekend Shopping & Dining',
      origin: 'Dwarka Sector 21',
      destination: 'Rajiv Chowk (Connaught Place)',
      preferredMode: 'metro',
      estimatedTime: 22,
      estimatedFare: 30
    }
  ];
  await SavedJourney.insertMany(savedJourneys);
  console.log(`[OK] Seeded ${savedJourneys.length} Saved Journeys`);

  // 5. Seed Journey History
  const history = [
    {
      userId: 'priya-user-id',
      origin: 'Dwarka Sector 21',
      destination: 'Noida Electronic City',
      routeId: 'MTR-BLU-01',
      routeName: 'Metro Blue Line (Rapid Transit)',
      transportType: 'metro',
      travelTime: 38,
      fare: 40,
      crowdLevel: 'moderate',
      co2SavedKg: 2.8,
      completedAt: new Date(Date.now() - 86400000)
    },
    {
      userId: 'priya-user-id',
      origin: 'Anand Vihar ISBT',
      destination: 'Dhaula Kuan Hub',
      routeId: 'BUS-EV-500',
      routeName: 'Electric City Express',
      transportType: 'bus',
      travelTime: 48,
      fare: 25,
      crowdLevel: 'low',
      co2SavedKg: 3.2,
      completedAt: new Date(Date.now() - 172800000)
    }
  ];
  await JourneyHistory.insertMany(history);
  console.log(`[OK] Seeded ${history.length} Past Journey Records`);

  // 6. Seed Notifications
  const notifications = [
    {
      userId: 'priya-user-id',
      type: 'delay',
      title: 'Yellow Line Signal Calibration',
      message: 'Yellow Line experiencing 8m delay. Your Blue Line commute is unaffected.',
      routeId: 'MTR-YEL-02',
      read: false
    },
    {
      userId: 'priya-user-id',
      type: 'green',
      title: 'Carbon Milestone Achieved! 🌿',
      message: 'You have saved over 24.5 kg of CO2 this month by using smart public transit.',
      routeId: '',
      read: true
    }
  ];
  await Notification.insertMany(notifications);
  console.log(`[OK] Seeded ${notifications.length} User Notifications`);

  // 7. Seed Feedback
  const feedbacks = [
    {
      userId: 'priya-user-id',
      routeId: 'MTR-BLU-01',
      rating: 5,
      category: 'Punctuality',
      comment: 'Blue line was spotless and arrived exactly on the second. Realtime vehicle cockpit was extremely accurate!',
      crowdReport: 'Moderate',
      cleanlinessReport: 'Clean',
      safetyRating: 5
    },
    {
      userId: 'rahul-user-id',
      routeId: 'BUS-EV-500',
      rating: 5,
      category: 'Comfort',
      comment: 'Electric AC bus is super quiet and comfortable for long distances.',
      crowdReport: 'Low',
      cleanlinessReport: 'Clean',
      safetyRating: 5
    }
  ];
  await Feedback.insertMany(feedbacks);
  console.log(`[OK] Seeded ${feedbacks.length} Commuter Feedbacks`);

  console.log('\n============================================================');
  console.log('✅ MONGODB ATLAS / LOCAL DATABASE SUCCESSFULLY SEEDED & READY');
  console.log('============================================================\n');
  await mongoose.disconnect();
}

seedDatabase().catch(err => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
