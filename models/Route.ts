import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRouteStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timeOffsetMinutes: number;
  crowdLevel?: 'low' | 'moderate' | 'high';
  isInterchange?: boolean;
  transfersAvailable?: string[];
}

export interface IRouteSegment {
  mode: 'bus' | 'metro' | 'train' | 'taxi' | 'walk';
  lineName: string;
  lineColor?: string;
  fromStop: string;
  toStop: string;
  durationMinutes: number;
  distanceKm: number;
  fare: number;
  instructions: string;
  crowdLevel: 'low' | 'moderate' | 'high';
  delayMinutes: number;
}

export interface IRoute extends Document {
  routeId: string;
  name: string;
  transportType: 'bus' | 'metro' | 'train' | 'taxi' | 'walk' | 'mixed';
  origin: string;
  destination: string;
  stops: IRouteStop[];
  segments: IRouteSegment[];
  distance: number; // in km
  estimatedTime: number; // in minutes
  fare: number; // in ₹
  transfers: number;
  walkingTime: number; // in minutes
  crowdLevel: 'low' | 'moderate' | 'high';
  status: 'on-time' | 'delayed' | 'disrupted' | 'cancelled';
  delayMinutes: number;
  frequencyMinutes: number;
  co2SavedKg: number;
  wheelchairAccessible: boolean;
  airConditioned: boolean;
  summary: string;
  polylinePoints: [number, number][]; // [lat, lng] array
  scheduleTimes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema: Schema<IRoute> = new Schema(
  {
    routeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    transportType: {
      type: String,
      enum: ['bus', 'metro', 'train', 'taxi', 'walk', 'mixed'],
      required: true,
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    stops: [
      {
        id: { type: String },
        name: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timeOffsetMinutes: { type: Number, default: 0 },
        crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
        isInterchange: { type: Boolean, default: false },
        transfersAvailable: [String],
      },
    ],
    segments: [
      {
        mode: { type: String, enum: ['bus', 'metro', 'train', 'taxi', 'walk'], required: true },
        lineName: { type: String, required: true },
        lineColor: { type: String, default: '#3b82f6' },
        fromStop: { type: String, required: true },
        toStop: { type: String, required: true },
        durationMinutes: { type: Number, required: true },
        distanceKm: { type: Number, default: 1 },
        fare: { type: Number, default: 0 },
        instructions: { type: String },
        crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'low' },
        delayMinutes: { type: Number, default: 0 },
      },
    ],
    distance: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    fare: { type: Number, required: true },
    transfers: { type: Number, default: 0 },
    walkingTime: { type: Number, default: 5 },
    crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    status: {
      type: String,
      enum: ['on-time', 'delayed', 'disrupted', 'cancelled'],
      default: 'on-time',
    },
    delayMinutes: { type: Number, default: 0 },
    frequencyMinutes: { type: Number, default: 10 },
    co2SavedKg: { type: Number, default: 1.2 },
    wheelchairAccessible: { type: Boolean, default: true },
    airConditioned: { type: Boolean, default: true },
    summary: { type: String, default: '' },
    polylinePoints: { type: [[Number]], default: [] },
    scheduleTimes: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Route: Model<IRoute> =
  mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);

export default Route;
