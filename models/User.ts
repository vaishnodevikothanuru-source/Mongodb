import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserPreferences {
  preferredModes: string[]; // ['bus', 'metro', 'train', 'taxi', 'walk']
  maxTravelTime: number; // in minutes
  maxBudget: number; // in currency units (₹)
  preferFastest: boolean;
  preferCheapest: boolean;
  avoidCrowds: boolean;
  avoidTransfers: boolean;
  minimizeWalking: boolean;
  weightTime?: number;
  weightCost?: number;
  weightCrowd?: number;
  weightTransfers?: number;
  weightWalking?: number;
}

export interface IUserLocation {
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  homeLocation?: IUserLocation;
  workLocation?: IUserLocation;
  collegeLocation?: IUserLocation;
  savedPlaces?: { label: string; name: string; latitude?: number; longitude?: number }[];
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatarUrl: { type: String, default: '' },
    homeLocation: {
      name: { type: String, default: 'Greenwood Heights, Sector 14' },
      latitude: { type: Number, default: 28.6139 },
      longitude: { type: Number, default: 77.209 },
      address: { type: String, default: 'Sector 14' },
    },
    workLocation: {
      name: { type: String, default: 'Cyber Tech Park, Gate 3' },
      latitude: { type: Number, default: 28.4595 },
      longitude: { type: Number, default: 77.0266 },
      address: { type: String, default: 'Phase 2 Tech Zone' },
    },
    collegeLocation: {
      name: { type: String, default: 'University North Campus' },
      latitude: { type: Number, default: 28.6892 },
      longitude: { type: Number, default: 77.2104 },
    },
    savedPlaces: [
      {
        label: { type: String },
        name: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
    ],
    preferences: {
      preferredModes: {
        type: [String],
        default: ['metro', 'bus', 'walk'],
      },
      maxTravelTime: { type: Number, default: 60 },
      maxBudget: { type: Number, default: 100 },
      preferFastest: { type: Boolean, default: true },
      preferCheapest: { type: Boolean, default: false },
      avoidCrowds: { type: Boolean, default: true },
      avoidTransfers: { type: Boolean, default: false },
      minimizeWalking: { type: Boolean, default: false },
      weightTime: { type: Number, default: 30 },
      weightCost: { type: Number, default: 20 },
      weightCrowd: { type: Number, default: 25 },
      weightTransfers: { type: Number, default: 15 },
      weightWalking: { type: Number, default: 10 },
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
