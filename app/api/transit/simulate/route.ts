import { NextRequest, NextResponse } from 'next/server';
import { transitStore } from '@/lib/transitStore';

export async function POST(req: NextRequest) {
  try {
    const newUpdate = transitStore.simulateLiveEvent();
    return NextResponse.json({
      success: true,
      message: 'Simulated real-time transit event generated',
      update: newUpdate,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
