import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { JourneyHistory } from '@/models/JourneyHistory';
import { transitStore } from '@/lib/transitStore';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const dbStatus = await connectToDatabase();
    let history: any[] = [];

    if (dbStatus.isConnected) {
      const filter: any = session ? { userId: session.userId } : {};
      history = await JourneyHistory.find(filter).sort({ date: -1 }).lean();
    }

    if (!history || history.length === 0) {
      history = transitStore.getJourneyHistory(session?.userId);
    }

    return NextResponse.json({
      history,
      count: history.length,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch history' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    const record = {
      userId: session?.userId || 'user-commuter-01',
      origin: body.origin,
      destination: body.destination,
      routeId: body.routeId,
      routeName: body.routeName,
      transportType: body.transportType || 'metro',
      travelTime: Number(body.travelTime) || 30,
      fare: Number(body.fare) || 35,
      crowdLevel: body.crowdLevel || 'moderate',
      co2SavedKg: Number(body.co2SavedKg) || 1.8,
      status: 'completed',
      date: new Date(),
    };

    let created: any = null;

    if (dbStatus.isConnected) {
      created = await JourneyHistory.create(record);
    }

    const memRecord = transitStore.addJourneyHistory(record);
    if (!created) created = memRecord;

    return NextResponse.json({
      success: true,
      message: 'Journey logged to history',
      historyItem: created,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to log journey' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const dbStatus = await connectToDatabase();

    if (dbStatus.isConnected && session) {
      await JourneyHistory.deleteMany({ userId: session.userId });
    }

    transitStore.journeyHistory = [];

    return NextResponse.json({
      success: true,
      message: 'Journey history cleared',
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to clear history' }, { status: 500 });
  }
}
