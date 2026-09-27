import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Route } from '@/models/Route';
import { SavedJourney } from '@/models/SavedJourney';
import { Feedback } from '@/models/Feedback';
import { TransitUpdate } from '@/models/TransitUpdate';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();

    let totalUsers = 0;
    let totalRoutes = 0;
    let delayedRoutes = 0;
    let savedJourneysCount = 0;
    let feedbacksCount = 0;

    if (dbStatus.isConnected) {
      totalUsers = await User.countDocuments();
      totalRoutes = await Route.countDocuments();
      delayedRoutes = await Route.countDocuments({ status: { $in: ['delayed', 'disrupted'] } });
      savedJourneysCount = await SavedJourney.countDocuments();
      feedbacksCount = await Feedback.countDocuments();
    }

    if (totalUsers === 0) totalUsers = transitStore.users.length;
    if (totalRoutes === 0) totalRoutes = transitStore.routes.length;
    if (delayedRoutes === 0) {
      delayedRoutes = transitStore.routes.filter(
        (r) => r.status === 'delayed' || r.status === 'disrupted'
      ).length;
    }
    if (savedJourneysCount === 0) savedJourneysCount = transitStore.savedJourneys.length;
    if (feedbacksCount === 0) feedbacksCount = transitStore.feedbacks.length;

    const stats = {
      totalUsers,
      activeRoutes: totalRoutes,
      delayedRoutes,
      savedJourneys: savedJourneysCount,
      totalFeedbackCount: feedbacksCount,
      dailySearches: 1420,
      networkHealth: '97.4%',
      activeAlerts: transitStore.transitUpdates.filter((u: any) => u.status !== 'on-time').length,
    };

    return NextResponse.json({
      stats,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch admin stats' }, { status: 500 });
  }
}
