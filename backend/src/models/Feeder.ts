import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeder extends Document {
  name: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: 'online' | 'offline';
  kibbleLevel: number;
  lastDispensed?: Date;
  ownerId: mongoose.Types.ObjectId;
  mqttTopic: string;
  streamUrl?: string;
  createdAt: Date;
}

const FeederSchema = new Schema<IFeeder>(
  {
    name: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    status: { type: String, enum: ['online', 'offline'], default: 'online' },
    kibbleLevel: { type: Number, required: true, min: 0, max: 100, default: 100 },
    lastDispensed: { type: Date },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mqttTopic: { type: String, required: true },
    streamUrl: { type: String },
  },
  { timestamps: true }
);

FeederSchema.index({ location: '2dsphere' });

export const Feeder = mongoose.model<IFeeder>('Feeder', FeederSchema);
