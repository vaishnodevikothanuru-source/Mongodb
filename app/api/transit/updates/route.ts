import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { TransitUpdate } from '@/models/TransitUpdate';
import { Route } from '@/models/Route';
import { Notification } from '@/models/Notification';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();
    let updates: any[] = [];

    if (dbStatus.isConnected) {
      updates = await TransitUpdate.find().sort({ timestamp: -1 }).lean();
    }

    if (!updates || updates.length === 0) {
      updates = transitStore.getTransitUpdates();
    }

    return NextResponse.json({ updates, databaseConnected: dbStatus.isConnected });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch updates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { routeId, routeName, transportType, delay, crowdLevel, status, message, severity, expectedNextArrivalMinutes } = body;

    const dbStatus = await connectToDatabase();

    const updateRecord = {
      routeId,
      routeName: routeName || 'Transit Route',
      transportType: transportType || 'metro',
      delay: Number(delay) || 0,
      crowdLevel: crowdLevel || 'moderate',
      status: status || 'delayed',
      message: message || `Service status update on ${routeName}`,
      severity: severity || (delay > 5 ? 'warning' : 'info'),
      expectedNextArrivalMinutes: Number(expectedNextArrivalMinutes) || 5,
      timestamp: new Date(),
    };

    let created: any = null;

    if (dbStatus.isConnected) {
      created = await TransitUpdate.create(updateRecord);

      // Sync Route document
      await Route.findOneAndUpdate(
        { routeId },
        {
          status: updateRecord.status,
          delayMinutes: updateRecord.delay,
          crowdLevel: updateRecord.crowdLevel,
        }
      );

      // Create Notification
      await Notification.create({
        type: updateRecord.status === 'delayed' ? 'delay' : 'disruption',
        title: `${updateRecord.routeName} Live Update`,
        message: updateRecord.message,
        routeId: updateRecord.routeId,
        severity: updateRecord.severity,
        read: false,
      });
    }

    const memCreated = transitStore.addTransitUpdate(updateRecord);
    if (!created) created = memCreated;

    return NextResponse.json({
      success: true,
      message: 'Transit update published to commuter network',
      update: created,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to post update' }, { status: 500 });
  }
}
