import {
  INITIAL_ROUTES,
  INITIAL_TRANSIT_UPDATES,
  INITIAL_NOTIFICATIONS,
  INITIAL_SAVED_JOURNEYS,
  INITIAL_JOURNEY_HISTORY,
  INITIAL_FEEDBACKS,
  DEMO_USERS,
  MockRoute,
} from './mockData';
import { hashPassword } from './auth';

/**
 * In-Memory Transit Store for robust resilience and instant demonstration.
 * Operates seamlessly whether MongoDB Atlas is connected or running offline.
 */
class TransitStore {
  public routes: MockRoute[] = JSON.parse(JSON.stringify(INITIAL_ROUTES));
  public transitUpdates = JSON.parse(JSON.stringify(INITIAL_TRANSIT_UPDATES));
  public notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  public savedJourneys = JSON.parse(JSON.stringify(INITIAL_SAVED_JOURNEYS));
  public journeyHistory = JSON.parse(JSON.stringify(INITIAL_JOURNEY_HISTORY));
  public feedbacks = JSON.parse(JSON.stringify(INITIAL_FEEDBACKS));
  public users = JSON.parse(JSON.stringify(DEMO_USERS));

  constructor() {
    // Ensure hashed passwords for demo users
    if (this.users[0] && !this.users[0].passwordHash.startsWith('$2')) {
      this.users[0].passwordHash = hashPassword('pass123');
    }
    if (this.users[1] && !this.users[1].passwordHash.startsWith('$2')) {
      this.users[1].passwordHash = hashPassword('admin123');
    }
  }

  // --- Routes ---
  getRoutes() {
    return this.routes;
  }

  getRouteById(id: string) {
    return (
      this.routes.find((r) => r.id === id || r.routeId === id) ||
      null
    );
  }

  addRoute(routeData: Partial<MockRoute>) {
    const newRoute: MockRoute = {
      id: `route-${Date.now()}`,
      routeId: routeData.routeId || `RTE-${Math.floor(100 + Math.random() * 900)}`,
      name: routeData.name || 'New Transit Line',
      transportType: routeData.transportType || 'metro',
      origin: routeData.origin || 'City Center',
      destination: routeData.destination || 'North Hub',
      stops: routeData.stops || [],
      segments: routeData.segments || [],
      distance: Number(routeData.distance) || 12,
      estimatedTime: Number(routeData.estimatedTime) || 25,
      fare: Number(routeData.fare) || 30,
      transfers: Number(routeData.transfers) || 0,
      walkingTime: Number(routeData.walkingTime) || 4,
      crowdLevel: routeData.crowdLevel || 'low',
      status: routeData.status || 'on-time',
      delayMinutes: Number(routeData.delayMinutes) || 0,
      frequencyMinutes: Number(routeData.frequencyMinutes) || 5,
      co2SavedKg: Number(routeData.co2SavedKg) || 1.8,
      wheelchairAccessible: Boolean(routeData.wheelchairAccessible ?? true),
      airConditioned: Boolean(routeData.airConditioned ?? true),
      summary: routeData.summary || 'Modern rapid transit service.',
      polylinePoints: routeData.polylinePoints || [
        [28.6139, 77.209],
        [28.6258, 77.2343],
      ],
      scheduleTimes: routeData.scheduleTimes || ['08:00 AM', '08:15 AM', '08:30 AM'],
    };
    this.routes.unshift(newRoute);
    return newRoute;
  }

  updateRoute(id: string, updates: Partial<MockRoute>) {
    const idx = this.routes.findIndex((r) => r.id === id || r.routeId === id);
    if (idx !== -1) {
      this.routes[idx] = { ...this.routes[idx], ...updates };
      return this.routes[idx];
    }
    return null;
  }

  deleteRoute(id: string) {
    const initialLen = this.routes.length;
    this.routes = this.routes.filter((r) => r.id !== id && r.routeId !== id);
    return this.routes.length < initialLen;
  }

  // --- Transit Updates ---
  getTransitUpdates() {
    return this.transitUpdates;
  }

  addTransitUpdate(update: any) {
    const newUpdate = {
      id: `up-${Date.now()}`,
      routeId: update.routeId,
      routeName: update.routeName || 'Transit Route',
      transportType: update.transportType || 'metro',
      delay: Number(update.delay) || 0,
      crowdLevel: update.crowdLevel || 'moderate',
      status: update.status || 'delayed',
      message: update.message || 'Service update posted.',
      affectedStops: update.affectedStops || [],
      severity: update.severity || 'warning',
      expectedNextArrivalMinutes: Number(update.expectedNextArrivalMinutes) || 5,
      timestamp: new Date().toISOString(),
    };
    this.transitUpdates.unshift(newUpdate);

    // Sync route status
    const route = this.getRouteById(update.routeId);
    if (route) {
      route.status = newUpdate.status;
      route.delayMinutes = newUpdate.delay;
      route.crowdLevel = newUpdate.crowdLevel;
    }

    // Auto-create notification
    this.addNotification({
      type: newUpdate.status === 'delayed' ? 'delay' : 'disruption',
      title: `${newUpdate.routeName} Update`,
      message: newUpdate.message,
      routeId: newUpdate.routeId,
      severity: newUpdate.severity,
      actionUrl: '/live-transit',
      actionLabel: 'Check Live Board',
    });

    return newUpdate;
  }

  // --- Notifications ---
  getNotifications() {
    return this.notifications;
  }

  addNotification(notif: any) {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: notif.type || 'delay',
      title: notif.title || 'Transit Notice',
      message: notif.message,
      routeId: notif.routeId || '',
      severity: notif.severity || 'info',
      read: false,
      actionUrl: notif.actionUrl || '/routes',
      actionLabel: notif.actionLabel || 'View Route',
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  markNotificationRead(id: string) {
    const item = this.notifications.find((n: any) => n.id === id);
    if (item) {
      item.read = true;
      return true;
    }
    return false;
  }

  markAllNotificationsRead() {
    this.notifications.forEach((n: any) => (n.read = true));
    return true;
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n: any) => n.id !== id);
    return true;
  }

  // --- Saved Journeys ---
  getSavedJourneys(userId?: string) {
    return this.savedJourneys;
  }

  addSavedJourney(item: any) {
    const newSaved = {
      id: `saved-${Date.now()}`,
      userId: item.userId || 'user-commuter-01',
      name: item.name,
      origin: item.origin,
      destination: item.destination,
      preferredMode: item.preferredMode || 'metro',
      estimatedTime: item.estimatedTime || 35,
      estimatedFare: item.estimatedFare || 40,
      tags: item.tags || ['Custom'],
      departureTimePreference: item.departureTimePreference || '08:30 AM',
      createdAt: new Date().toISOString(),
    };
    this.savedJourneys.unshift(newSaved);
    return newSaved;
  }

  deleteSavedJourney(id: string) {
    this.savedJourneys = this.savedJourneys.filter((s: any) => s.id !== id);
    return true;
  }

  // --- Journey History ---
  getJourneyHistory(userId?: string) {
    return this.journeyHistory;
  }

  addJourneyHistory(entry: any) {
    const newHist = {
      id: `hist-${Date.now()}`,
      userId: entry.userId || 'user-commuter-01',
      origin: entry.origin,
      destination: entry.destination,
      routeId: entry.routeId,
      routeName: entry.routeName,
      transportType: entry.transportType || 'metro',
      travelTime: Number(entry.travelTime) || 30,
      fare: Number(entry.fare) || 35,
      crowdLevel: entry.crowdLevel || 'moderate',
      co2SavedKg: Number(entry.co2SavedKg) || 1.8,
      status: entry.status || 'completed',
      date: new Date().toISOString(),
    };
    this.journeyHistory.unshift(newHist);
    return newHist;
  }

  // --- Feedback ---
  getFeedbacks() {
    return this.feedbacks;
  }

  addFeedback(fb: any) {
    const newFb = {
      id: `fb-${Date.now()}`,
      userId: fb.userId || 'user-commuter-01',
      userName: fb.userName || 'Commuter',
      userEmail: fb.userEmail || '',
      routeId: fb.routeId,
      routeName: fb.routeName || 'Transit Route',
      rating: Number(fb.rating) || 5,
      crowdFeedback: fb.crowdFeedback || 'moderate',
      delayFeedbackMinutes: Number(fb.delayFeedbackMinutes) || 0,
      cleanlinessRating: Number(fb.cleanlinessRating) || 5,
      punctualityRating: Number(fb.punctualityRating) || 5,
      comment: fb.comment || '',
      createdAt: new Date().toISOString(),
    };
    this.feedbacks.unshift(newFb);
    return newFb;
  }

  // --- Users ---
  findUserByEmail(email: string) {
    return this.users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  findUserById(id: string) {
    return this.users.find((u: any) => u.id === id);
  }

  createUser(userData: any) {
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'user',
      homeLocation: userData.homeLocation || {
        name: 'Home',
        latitude: 28.6139,
        longitude: 77.209,
      },
      workLocation: userData.workLocation || {
        name: 'Work',
        latitude: 28.4595,
        longitude: 77.0266,
      },
      collegeLocation: userData.collegeLocation || {
        name: 'College',
        latitude: 28.6892,
        longitude: 77.2104,
      },
      preferences: userData.preferences || {
        preferredModes: ['metro', 'bus', 'walk'],
        maxTravelTime: 60,
        maxBudget: 100,
        preferFastest: true,
        preferCheapest: false,
        avoidCrowds: true,
        avoidTransfers: false,
        minimizeWalking: false,
        weightTime: 30,
        weightCost: 20,
        weightCrowd: 25,
        weightTransfers: 15,
        weightWalking: 10,
      },
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, updates: any) {
    const user = this.findUserById(id);
    if (user) {
      if (updates.name) user.name = updates.name;
      if (updates.homeLocation) user.homeLocation = { ...user.homeLocation, ...updates.homeLocation };
      if (updates.workLocation) user.workLocation = { ...user.workLocation, ...updates.workLocation };
      if (updates.collegeLocation) user.collegeLocation = { ...user.collegeLocation, ...updates.collegeLocation };
      if (updates.preferences) user.preferences = { ...user.preferences, ...updates.preferences };
      return user;
    }
    return null;
  }

  // --- Simulation helper ---
  simulateLiveEvent() {
    const randomRoute = this.routes[Math.floor(Math.random() * this.routes.length)];
    const delays = [0, 4, 8, 12, 16];
    const delay = delays[Math.floor(Math.random() * delays.length)];
    const crowds: ('low' | 'moderate' | 'high')[] = ['low', 'moderate', 'high'];
    const crowd = crowds[Math.floor(Math.random() * crowds.length)];
    const status = delay > 10 ? 'disrupted' : delay > 0 ? 'delayed' : 'on-time';

    const msgs = [
      `Minor signal optimization causing ${delay} min delay.`,
      `Crowd surge detected at junction platforms.`,
      `Express transit running on perfect schedule.`,
      `Temporary slow track speed restriction of ${delay} min in effect.`,
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];

    return this.addTransitUpdate({
      routeId: randomRoute.routeId,
      routeName: randomRoute.name,
      transportType: randomRoute.transportType,
      delay,
      crowdLevel: crowd,
      status,
      message: msg,
      severity: delay > 8 ? 'warning' : 'info',
    });
  }
}

// Global singleton instance for in-memory resilience
declare global {
  // eslint-disable-next-line no-var
  var globalTransitStore: TransitStore | undefined;
}

export const transitStore = global.globalTransitStore || new TransitStore();
if (process.env.NODE_ENV !== 'production') {
  global.globalTransitStore = transitStore;
}

export default transitStore;
