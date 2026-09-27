import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJourneyHistory extends Document {
  userId: mongoose.Types.ObjectId | string;
  origin: string;
  destination: string;
  routeId: string;
  routeName: string;
  transportType: string;
  travelTime: number; // in minutes
  fare: number; // in ₹
  crowdLevel: 'low' | 'moderate' | 'high';
  co2SavedKg: number;
  status: 'completed' | 'cancelled' | 'in-progress';
  date: Date;
  createdAt: Date;
}

const JourneyHistorySchema: Schema<IJourneyHistory> = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    transportType: { type: String, default: 'metro' },
    travelTime: { type: Number, required: true },
    fare: { type: Number, required: true },
    crowdLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    co2SavedKg: { type: Number, default: 1.5 },
    status: { type: String, enum: ['completed', 'cancelled', 'in-progress'], default: 'completed' },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const JourneyHistory: Model<IJourneyHistory> =
  mongoose.models.JourneyHistory ||
  mongoose.model<IJourneyHistory>('JourneyHistory', JourneyHistorySchema);

export default JourneyHistory;
