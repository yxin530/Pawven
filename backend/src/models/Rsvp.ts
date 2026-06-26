import mongoose, { Schema, Document } from 'mongoose';

export interface IRsvp extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RsvpSchema = new Schema<IRsvp>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

RsvpSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export const Rsvp = mongoose.model<IRsvp>('Rsvp', RsvpSchema);
