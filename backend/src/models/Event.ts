import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  coverPhotoUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  startTime: Date;
  endTime: Date;
  hostUserId: mongoose.Types.ObjectId;
  rsvpCount: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  category: 'adoption' | 'feeding' | 'tnr' | 'fundraiser' | 'meetup' | 'volunteer';
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverPhotoUrl: { type: String },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    hostUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rsvpCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    category: {
      type: String,
      enum: ['adoption', 'feeding', 'tnr', 'fundraiser', 'meetup', 'volunteer'],
      required: true,
    },
  },
  { timestamps: true }
);

EventSchema.index({ location: '2dsphere' });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
