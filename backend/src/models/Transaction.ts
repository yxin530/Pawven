import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'kibble' | 'rental' | 'donation';
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  feederId?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['kibble', 'rental', 'donation'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'usd' },
    stripePaymentIntentId: { type: String, required: true },
    feederId: { type: Schema.Types.ObjectId, ref: 'Feeder', default: null },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
