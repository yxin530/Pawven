import mongoose, { Schema, Document } from 'mongoose';

export interface ITNRReport extends Document {
  strayPhotoUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  notes: string;
  activityType: 'trapped' | 'neutered' | 'returned' | 'feeding' | 'sighting';
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'open' | 'accepted' | 'in_progress' | 'completed';
  temporalWorkflowId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TNRReportSchema = new Schema<ITNRReport>(
  {
    strayPhotoUrl: { type: String },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    notes: { type: String, maxlength: 500, default: '' },
    activityType: {
      type: String,
      enum: ['trapped', 'neutered', 'returned', 'feeding', 'sighting'],
      required: true,
    },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['open', 'accepted', 'in_progress', 'completed'],
      default: 'open',
    },
    temporalWorkflowId: { type: String },
  },
  { timestamps: true }
);

TNRReportSchema.index({ location: '2dsphere' });

export const TNRReport = mongoose.model<ITNRReport>('TNRReport', TNRReportSchema);
