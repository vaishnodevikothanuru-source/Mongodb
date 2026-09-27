import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransitUpdate extends Document {
  routeId: string;
  routeName: string;
  transportType: 'bus' | 'metro' | 'train' | 'taxi' | 'walk' | 'mixed';
  delay: number; // in minutes
  crowdLevel: 'low' | 'moderate' | 'high';
  status: 'on-time' | 'delayed' | 'disrupted' | 'cancelled';
  message: string;
  affectedStops: string[];
  severity: 'info' | 'warning' | 'critical';
  expectedNextArrivalMinutes: number;
  timestamp: Date;
}

const TransitUpdateSchema: Schema<ITransitUpdate> = new Schema(
  {
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    transportType: { type: String, required: true },
    delay: { type: Number, default: 0 },
    crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    status: {
      type: String,
      enum: ['on-time', 'delayed', 'disrupted', 'cancelled'],
      default: 'on-time',
    },
    message: { type: String, required: true },
    affectedStops: { type: [String], default: [] },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    expectedNextArrivalMinutes: { type: Number, default: 5 },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const TransitUpdate: Model<ITransitUpdate> =
  mongoose.models.TransitUpdate || mongoose.model<ITransitUpdate>('TransitUpdate', TransitUpdateSchema);

export default TransitUpdate;
