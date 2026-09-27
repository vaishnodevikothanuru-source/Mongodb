import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Notification } from '@/models/Notification';
import { transitStore } from '@/lib/transitStore';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dbStatus = await connectToDatabase();

    if (id === 'all') {
      if (dbStatus.isConnected) {
        await Notification.updateMany({}, { read: true });
      }
      transitStore.markAllNotificationsRead();
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (dbStatus.isConnected && id.match(/^[0-9a-fA-F]{24}$/)) {
      await Notification.findByIdAndUpdate(id, { read: true });
    }

    transitStore.markNotificationRead(id);

    return NextResponse.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dbStatus = await connectToDatabase();

    if (dbStatus.isConnected && id.match(/^[0-9a-fA-F]{24}$/)) {
      await Notification.findByIdAndDelete(id);
    }

    transitStore.deleteNotification(id);

    return NextResponse.json({ success: true, message: 'Notification removed' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete notification' }, { status: 500 });
  }
}
