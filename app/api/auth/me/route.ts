import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const dbStatus = await connectToDatabase();
    let userData = null;

    if (dbStatus.isConnected) {
      const user = await User.findById(session.userId);
      if (user) {
        userData = {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          homeLocation: user.homeLocation,
          workLocation: user.workLocation,
          collegeLocation: user.collegeLocation,
          preferences: user.preferences,
        };
      }
    }

    if (!userData) {
      const memUser = transitStore.findUserById(session.userId) || transitStore.findUserByEmail(session.email);
      if (memUser) {
        userData = {
          id: memUser.id,
          name: memUser.name,
          email: memUser.email,
          role: memUser.role,
          homeLocation: memUser.homeLocation,
          workLocation: memUser.workLocation,
          collegeLocation: memUser.collegeLocation,
          preferences: memUser.preferences,
        };
      } else {
        // Fallback default demo user if token is valid
        userData = {
          id: session.userId,
          name: session.name,
          email: session.email,
          role: session.role,
          preferences: {
            preferredModes: ['metro', 'bus', 'walk'],
            maxTravelTime: 45,
            maxBudget: 60,
            preferFastest: true,
            preferCheapest: false,
            avoidCrowds: true,
            avoidTransfers: false,
            minimizeWalking: false,
          },
        };
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: userData,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
