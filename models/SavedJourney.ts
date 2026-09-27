import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedJourney extends Document {
  userId: mongoose.Types.ObjectId | string;
  name: string;
  origin: string;
  destination: string;
  preferredMode: string;
  estimatedTime?: number;
  estimatedFare?: number;
  tags: string[];
  departureTimePreference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJourneySchema: Schema<ISavedJourney> = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true },
    name: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    preferredMode: { type: String, default: 'mixed' },
    estimatedTime: { type: Number, default: 35 },
    estimatedFare: { type: Number, default: 40 },
    tags: { type: [String], default: ['Daily Commute'] },
    departureTimePreference: { type: String, default: '08:30 AM' },
  },
  {
    timestamps: true,
  }
);

export const SavedJourney: Model<ISavedJourney> =
  mongoose.models.SavedJourney || mongoose.model<ISavedJourney>('SavedJourney', SavedJourneySchema);

export default SavedJourney;
