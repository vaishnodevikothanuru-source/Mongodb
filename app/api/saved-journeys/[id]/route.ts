import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { SavedJourney } from '@/models/SavedJourney';
import { transitStore } from '@/lib/transitStore';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    let updated: any = null;
    if (dbStatus.isConnected && id.match(/^[0-9a-fA-F]{24}$/)) {
      updated = await SavedJourney.findByIdAndUpdate(id, body, { new: true });
    }

    const item = transitStore.savedJourneys.find((s: any) => s.id === id);
    if (item) {
      Object.assign(item, body);
      updated = item;
    }

    return NextResponse.json({
      success: true,
      message: 'Saved journey updated',
      savedJourney: updated || item,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Update failed' }, { status: 500 });
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
      await SavedJourney.findByIdAndDelete(id);
    }

    transitStore.deleteSavedJourney(id);

    return NextResponse.json({
      success: true,
      message: 'Saved journey deleted',
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
