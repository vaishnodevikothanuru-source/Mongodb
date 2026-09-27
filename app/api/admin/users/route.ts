import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { transitStore } from '@/lib/transitStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase();

    const dbStatus = await connectToDatabase();
    let usersList: any[] = [];

    if (dbStatus.isConnected) {
      usersList = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
    }

    if (!usersList || usersList.length === 0) {
      usersList = transitStore.users.map((u: any) => ({
        id: u.id,
        _id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        homeLocation: u.homeLocation,
        workLocation: u.workLocation,
        preferences: u.preferences,
        createdAt: u.createdAt,
        status: 'active',
      }));
    }

    if (q) {
      usersList = usersList.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      users: usersList,
      count: usersList.length,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch users' }, { status: 500 });
  }
}
