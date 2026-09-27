import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId | string;
  userName: string;
  userEmail?: string;
  routeId: string;
  routeName: string;
  rating: number; // 1 to 5
  crowdFeedback: 'low' | 'moderate' | 'high';
  delayFeedbackMinutes: number;
  cleanlinessRating: number; // 1 to 5
  punctualityRating: number; // 1 to 5
  comment: string;
  createdAt: Date;
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    userId: { type: Schema.Types.Mixed, required: true },
    userName: { type: String, default: 'Commuter' },
    userEmail: { type: String, default: '' },
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    crowdFeedback: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
    delayFeedbackMinutes: { type: Number, default: 0 },
    cleanlinessRating: { type: Number, default: 4, min: 1, max: 5 },
    punctualityRating: { type: Number, default: 4, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Feedback: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
