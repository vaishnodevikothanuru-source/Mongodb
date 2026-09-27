import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { transitStore } from '@/lib/transitStore';

export async function PUT(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const preferences = await req.json();
    const dbStatus = await connectToDatabase();
    let updatedPreferences = preferences;

    if (dbStatus.isConnected) {
      const user = await User.findByIdAndUpdate(
        session.userId,
        { preferences },
        { new: true }
      );
      if (user) updatedPreferences = user.preferences;
    } else {
      const user = transitStore.updateUser(session.userId, { preferences });
      if (user) updatedPreferences = user.preferences;
    }

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedPreferences,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update preferences' }, { status: 500 });
  }
}
