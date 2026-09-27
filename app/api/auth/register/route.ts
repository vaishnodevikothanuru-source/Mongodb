import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, isMongoConnected } from '@/lib/mongodb';
import { User } from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';
import { transitStore } from '@/lib/transitStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const dbStatus = await connectToDatabase();

    let createdUser: any = null;

    if (dbStatus.isConnected) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json(
          { error: 'A user with this email address already exists' },
          { status: 409 }
        );
      }

      const userDoc = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
        preferences: {
          preferredModes: ['metro', 'bus', 'walk'],
          maxTravelTime: 60,
          maxBudget: 100,
          preferFastest: true,
          preferCheapest: false,
          avoidCrowds: true,
          avoidTransfers: false,
          minimizeWalking: false,
        },
      });

      createdUser = {
        id: userDoc._id.toString(),
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
        preferences: userDoc.preferences,
      };
    } else {
      // In-Memory Fallback
      const existing = transitStore.findUserByEmail(email);
      if (existing) {
        return NextResponse.json(
          { error: 'A user with this email address already exists' },
          { status: 409 }
        );
      }

      const memUser = transitStore.createUser({
        name,
        email,
        passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
      });

      createdUser = {
        id: memUser.id,
        name: memUser.name,
        email: memUser.email,
        role: memUser.role,
        preferences: memUser.preferences,
      };
    }

    const token = signToken({
      userId: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: createdUser,
      token,
      databaseConnected: dbStatus.isConnected,
    });

    response.cookies.set('token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: err?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
