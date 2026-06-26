import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: string;
  unlockedAt: Date;
}

const BadgeSchema = new Schema<IBadge>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true },
  unlockedAt: { type: Date, required: true, default: Date.now },
});

BadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

export const Badge = mongoose.model<IBadge>('Badge', BadgeSchema);
