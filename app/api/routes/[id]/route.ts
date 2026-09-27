import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Route } from '@/models/Route';
import { transitStore } from '@/lib/transitStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const dbStatus = await connectToDatabase();
    let route: any = null;

    if (dbStatus.isConnected) {
      route = await Route.findOne({ $or: [{ routeId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] }).lean();
    }

    if (!route) {
      route = transitStore.getRouteById(id);
    }

    if (!route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json({ route, databaseConnected: dbStatus.isConnected });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const dbStatus = await connectToDatabase();
    let updated: any = null;

    if (dbStatus.isConnected) {
      updated = await Route.findOneAndUpdate(
        { $or: [{ routeId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
        body,
        { new: true }
      );
    }

    const memUpdated = transitStore.updateRoute(id, body);
    if (!updated) updated = memUpdated;

    if (!updated) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Route updated successfully',
      route: updated,
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

    if (dbStatus.isConnected) {
      await Route.findOneAndDelete({
        $or: [{ routeId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
      });
    }

    transitStore.deleteRoute(id);

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully',
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete failed' }, { status: 500 });
  }
}
