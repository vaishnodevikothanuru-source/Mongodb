import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId | string;
  type: 'delay' | 'disruption' | 'crowd' | 'alternative' | 'system' | 'weather';
  title: string;
  message: string;
  routeId?: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    userId: { type: Schema.Types.Mixed, default: 'all' },
    type: {
      type: String,
      enum: ['delay', 'disruption', 'crowd', 'alternative', 'system', 'weather'],
      default: 'delay',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    routeId: { type: String },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'success'],
      default: 'info',
    },
    read: { type: Boolean, default: false },
    actionUrl: { type: String },
    actionLabel: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
