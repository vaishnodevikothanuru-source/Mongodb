import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedJourney } from '@/models/SavedJourney';
import { transitStore } from '@/lib/transitStore';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const dbStatus = await connectToDatabase();
    let items: any[] = [];

    if (dbStatus.isConnected) {
      const filter: any = session ? { userId: session.userId } : {};
      items = await SavedJourney.find(filter).lean();
    }

    if (!items || items.length === 0) {
      items = transitStore.getSavedJourneys(session?.userId);
    }

    return NextResponse.json({
      savedJourneys: items,
      count: items.length,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch saved journeys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    const data = {
      userId: session?.userId || 'user-commuter-01',
      name: body.name || `${body.origin} → ${body.destination}`,
      origin: body.origin,
      destination: body.destination,
      preferredMode: body.preferredMode || 'metro',
      estimatedTime: Number(body.estimatedTime) || 35,
      estimatedFare: Number(body.estimatedFare) || 40,
      tags: body.tags || ['Custom Commute'],
      departureTimePreference: body.departureTimePreference || '08:30 AM',
    };

    let created: any = null;

    if (dbStatus.isConnected) {
      created = await SavedJourney.create(data);
    }

    const memCreated = transitStore.addSavedJourney(data);
    if (!created) created = memCreated;

    return NextResponse.json({
      success: true,
      message: 'Journey saved successfully',
      savedJourney: created,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to save journey' }, { status: 500 });
  }
}
