import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Route } from '@/models/Route';
import { transitStore } from '@/lib/transitStore';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const transportType = searchParams.get('type');
    const status = searchParams.get('status');

    const dbStatus = await connectToDatabase();
    let routesList: any[] = [];

    if (dbStatus.isConnected) {
      const filter: any = {};
      if (transportType && transportType !== 'all') filter.transportType = transportType;
      if (status && status !== 'all') filter.status = status;
      routesList = await Route.find(filter).lean();
    }

    if (!routesList || routesList.length === 0) {
      routesList = transitStore.getRoutes();
      if (transportType && transportType !== 'all') {
        routesList = routesList.filter((r) => r.transportType === transportType);
      }
      if (status && status !== 'all') {
        routesList = routesList.filter((r) => r.status === status);
      }
    }

    return NextResponse.json({
      routes: routesList,
      count: routesList.length,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);
    // Allow demo admin / testing
    const body = await req.json();
    const dbStatus = await connectToDatabase();

    let newRoute: any = null;

    if (dbStatus.isConnected) {
      newRoute = await Route.create({
        ...body,
        routeId: body.routeId || `RTE-${Math.floor(100 + Math.random() * 900)}`,
      });
    }

    const memRoute = transitStore.addRoute(body);
    if (!newRoute) newRoute = memRoute;

    return NextResponse.json({
      success: true,
      message: 'Route created successfully',
      route: newRoute,
      databaseConnected: dbStatus.isConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to create route' }, { status: 500 });
  }
}
