import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbStatus = await connectToDatabase();
  let user: any = null;

  if (dbStatus.isConnected) {
    user = await User.findById(session.userId);
  }
  if (!user) {
    user = transitStore.findUserById(session.userId) || transitStore.users[0];
  }

  return NextResponse.json({ user, databaseConnected: dbStatus.isConnected });
}

export async function PUT(req: NextRequest) {
  const session = getSessionUser(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, homeLocation, workLocation, collegeLocation, preferences } = body;

    const dbStatus = await connectToDatabase();
    let updatedUser: any = null;

    if (dbStatus.isConnected) {
      updatedUser = await User.findByIdAndUpdate(
        session.userId,
        {
          ...(name && { name }),
          ...(homeLocation && { homeLocation }),
          ...(workLocation && { workLocation }),
          ...(collegeLocation && { collegeLocation }),
          ...(preferences && { preferences }),
        },
        { new: true }
      );
    }

    if (!updatedUser) {
      updatedUser = transitStore.updateUser(session.userId, {
        name,
        homeLocation,
        workLocation,
        collegeLocation,
        preferences,
      }) || transitStore.users[0];
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 });
  }
}
