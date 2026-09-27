import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Route } from '@/models/Route';
import { User } from '@/models/User';
import { transitStore } from '@/lib/transitStore';
import { rankAndScoreRoutes, RecommendationOptions } from '@/lib/recommendation';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      origin,
      destination,
      preferredModes,
      maxTravelTime,
      maxBudget,
      preferFastest,
      preferCheapest,
      avoidCrowds,
      avoidTransfers,
      minimizeWalking,
      departureTime,
    } = body;

    const session = getSessionUser(req);
    const dbStatus = await connectToDatabase();

    let routesList: any[] = [];

    if (dbStatus.isConnected) {
      routesList = await Route.find().lean();
    }

    if (!routesList || routesList.length === 0) {
      routesList = transitStore.getRoutes();
    }

    // Retrieve user preferences if logged in
    let userPreferences: any = null;
    if (session) {
      if (dbStatus.isConnected) {
        const u = await User.findById(session.userId);
        if (u) userPreferences = u.preferences;
      }
      if (!userPreferences) {
        const memU = transitStore.findUserById(session.userId);
        if (memU) userPreferences = memU.preferences;
      }
    }

    const searchOptions: RecommendationOptions = {
      origin,
      destination,
      preferredModes,
      maxTravelTime: maxTravelTime ? Number(maxTravelTime) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      preferFastest,
      preferCheapest,
      avoidCrowds,
      avoidTransfers,
      minimizeWalking,
      departureTime,
    };

    const scoredRoutes = rankAndScoreRoutes(routesList, userPreferences, searchOptions);

    return NextResponse.json({
      success: true,
      origin: origin || 'All Stops',
      destination: destination || 'City Center',
      count: scoredRoutes.length,
      recommendedRoute: scoredRoutes[0] || null,
      routes: scoredRoutes,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    console.error('Search error:', err);
    return NextResponse.json({ error: err?.message || 'Journey search failed' }, { status: 500 });
  }
}
