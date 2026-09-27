import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { transitStore } from '@/lib/transitStore';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const dbStatus = await connectToDatabase();
    let notifications: any[] = [];

    if (dbStatus.isConnected) {
      notifications = await Notification.find({
        $or: [{ userId: 'all' }, { userId: session?.userId || null }],
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!notifications || notifications.length === 0) {
      notifications = transitStore.getNotifications();
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    let created: any = null;
    if (dbStatus.isConnected) {
      created = await Notification.create(body);
    }

    const memCreated = transitStore.addNotification(body);
    if (!created) created = memCreated;

    return NextResponse.json({
      success: true,
      message: 'Notification dispatched',
      notification: created,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create notification' }, { status: 500 });
  }
}
