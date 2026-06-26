import mongoose, { Schema, Document } from 'mongoose';

export interface IUpdate extends Document {
  threadType: 'report' | 'event';
  threadId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const UpdateSchema = new Schema<IUpdate>(
  {
    threadType: { type: String, enum: ['report', 'event'], required: true },
    threadId: { type: Schema.Types.ObjectId, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

UpdateSchema.index({ threadType: 1, threadId: 1 });

export const Update = mongoose.model<IUpdate>('Update', UpdateSchema);
