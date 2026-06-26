import mongoose, { Schema, Document } from 'mongoose';

export interface IFeederRental extends Document {
  userId: mongoose.Types.ObjectId;
  feederId: mongoose.Types.ObjectId;
  stripeSubscriptionId: string;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: Date;
  endDate?: Date;
}

const FeederRentalSchema = new Schema<IFeederRental>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    feederId: { type: Schema.Types.ObjectId, ref: 'Feeder', required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'past_due'], default: 'active' },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const FeederRental = mongoose.model<IFeederRental>('FeederRental', FeederRentalSchema);
