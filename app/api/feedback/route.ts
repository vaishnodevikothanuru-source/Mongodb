import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Feedback } from '@/models/Feedback';
import { transitStore } from '@/lib/transitStore';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const dbStatus = await connectToDatabase();
    let feedbacks: any[] = [];

    if (dbStatus.isConnected) {
      feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    }

    if (!feedbacks || feedbacks.length === 0) {
      feedbacks = transitStore.getFeedbacks();
    }

    const averageRating = (
      feedbacks.reduce((acc, fb) => acc + (fb.rating || 5), 0) /
      (feedbacks.length || 1)
    ).toFixed(1);

    return NextResponse.json({
      feedbacks,
      count: feedbacks.length,
      averageRating: Number(averageRating),
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch feedbacks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    const data = {
      userId: session?.userId || 'user-commuter-01',
      userName: body.userName || session?.name || 'Commuter',
      userEmail: body.userEmail || session?.email || '',
      routeId: body.routeId,
      routeName: body.routeName || 'Transit Route',
      rating: Number(body.rating) || 5,
      crowdFeedback: body.crowdFeedback || 'moderate',
      delayFeedbackMinutes: Number(body.delayFeedbackMinutes) || 0,
      cleanlinessRating: Number(body.cleanlinessRating) || 5,
      punctualityRating: Number(body.punctualityRating) || 5,
      comment: body.comment || '',
      createdAt: new Date(),
    };

    let created: any = null;

    if (dbStatus.isConnected) {
      created = await Feedback.create(data);
    }

    const memCreated = transitStore.addFeedback(data);
    if (!created) created = memCreated;

    return NextResponse.json({
      success: true,
      message: 'Thank you for your feedback! It helps improve smart transit predictions.',
      feedback: created,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to submit feedback' }, { status: 500 });
  }
}
