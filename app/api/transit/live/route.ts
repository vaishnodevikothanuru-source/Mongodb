import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Route } from '@/models/Route';
import { TransitUpdate } from '@/models/TransitUpdate';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();
    let routes: any[] = [];
    let updates: any[] = [];

    if (dbStatus.isConnected) {
      routes = await Route.find().lean();
      updates = await TransitUpdate.find().sort({ timestamp: -1 }).limit(10).lean();
    }

    if (!routes || routes.length === 0) {
      routes = transitStore.getRoutes();
    }
    if (!updates || updates.length === 0) {
      updates = transitStore.getTransitUpdates();
    }

    const delayedRoutes = routes.filter((r) => r.status === 'delayed');
    const onTimeRoutes = routes.filter((r) => r.status === 'on-time');
    const disruptedRoutes = routes.filter((r) => r.status === 'disrupted' || r.status === 'cancelled');
    const highCrowdRoutes = routes.filter((r) => r.crowdLevel === 'high');

    const networkStats = {
      totalRoutes: routes.length,
      onTimeCount: onTimeRoutes.length,
      delayedCount: delayedRoutes.length,
      disruptedCount: disruptedRoutes.length,
      highCrowdCount: highCrowdRoutes.length,
      networkPunctuality: Math.round(
        (onTimeRoutes.length / (routes.length || 1)) * 100
      ),
      averageDelayMinutes: Math.round(
        delayedRoutes.reduce((acc, r) => acc + (r.delayMinutes || 0), 0) /
          (delayedRoutes.length || 1)
      ),
    };

    return NextResponse.json({
      networkStats,
      routes,
      updates,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch transit status' }, { status: 500 });
  }
}
