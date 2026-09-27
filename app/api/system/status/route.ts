import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoConnected } from '@/lib/mongodb';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  const dbStatus = await connectToDatabase();
  const uriConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim() !== '' && !process.env.MONGODB_URI.includes('<username>'));

  return NextResponse.json({
    status: 'operational',
    database: {
      connected: dbStatus.isConnected,
      configured: uriConfigured,
      error: dbStatus.error || null,
      mode: dbStatus.isConnected ? 'MongoDB Atlas (Live)' : 'In-Memory Resilient Demo Store',
    },
    systemMetrics: {
      routesCount: transitStore.routes.length,
      activeAlertsCount: transitStore.transitUpdates.length,
      usersCount: transitStore.users.length,
      feedbacksCount: transitStore.feedbacks.length,
      savedJourneysCount: transitStore.savedJourneys.length,
      uptimeSeconds: Math.round(process.uptime()),
    },
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
