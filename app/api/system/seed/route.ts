import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Route } from '@/models/Route';
import { TransitUpdate } from '@/models/TransitUpdate';
import { SavedJourney } from '@/models/SavedJourney';
import { JourneyHistory } from '@/models/JourneyHistory';
import { Notification } from '@/models/Notification';
import { Feedback } from '@/models/Feedback';
import {
  INITIAL_ROUTES,
  INITIAL_TRANSIT_UPDATES,
  INITIAL_SAVED_JOURNEYS,
  INITIAL_JOURNEY_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_FEEDBACKS,
  DEMO_USERS,
} from '@/lib/mockData';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();
    if (!dbStatus.isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'MongoDB is not currently connected. Please configure MONGODB_URI in .env.local',
        },
        { status: 400 }
      );
    }

    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      for (const u of DEMO_USERS) {
        await User.create({
          name: u.name,
          email: u.email,
          passwordHash: hashPassword(u.email.includes('admin') ? 'admin123' : 'pass123'),
          role: u.role,
          homeLocation: u.homeLocation,
          workLocation: u.workLocation,
          collegeLocation: u.collegeLocation,
          preferences: u.preferences,
        });
      }
    }

    // 2. Seed Routes if empty
    const routeCount = await Route.countDocuments();
    if (routeCount === 0) {
      for (const r of INITIAL_ROUTES) {
        await Route.create(r);
      }
    }

    // 3. Seed Transit Updates
    const updateCount = await TransitUpdate.countDocuments();
    if (updateCount === 0) {
      for (const up of INITIAL_TRANSIT_UPDATES) {
        await TransitUpdate.create(up);
      }
    }

    // 4. Seed Saved Journeys
    const savedCount = await SavedJourney.countDocuments();
    if (savedCount === 0) {
      for (const sj of INITIAL_SAVED_JOURNEYS) {
        await SavedJourney.create(sj);
      }
    }

    // 5. Seed Journey History
    const histCount = await JourneyHistory.countDocuments();
    if (histCount === 0) {
      for (const jh of INITIAL_JOURNEY_HISTORY) {
        await JourneyHistory.create(jh);
      }
    }

    // 6. Seed Notifications
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0) {
      for (const n of INITIAL_NOTIFICATIONS) {
        await Notification.create(n);
      }
    }

    // 7. Seed Feedback
    const fbCount = await Feedback.countDocuments();
    if (fbCount === 0) {
      for (const fb of INITIAL_FEEDBACKS) {
        await Feedback.create(fb);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'MongoDB Atlas successfully seeded with standard transit datasets!',
      seeded: {
        users: await User.countDocuments(),
        routes: await Route.countDocuments(),
        updates: await TransitUpdate.countDocuments(),
        savedJourneys: await SavedJourney.countDocuments(),
        history: await JourneyHistory.countDocuments(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Database seeding failed' }, { status: 500 });
  }
}
