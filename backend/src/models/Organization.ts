import mongoose, { Schema, Document } from 'mongoose';

export interface IOrg extends Document {
  name: string;
  type: 'ngo' | 'vet';
  logoUrl?: string;
  description: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  hours: string;
  donateUrl?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: Date;
}

const OrgSchema = new Schema<IOrg>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['ngo', 'vet'], required: true },
    logoUrl: { type: String },
    description: { type: String, required: true },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: { type: String },
    },
    hours: { type: String, required: true },
    donateUrl: { type: String },
    location: {
      type: { type: String, enum: ['Point'], required: true, default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true }
);

OrgSchema.index({ location: '2dsphere' });

export const Org = mongoose.model<IOrg>('Org', OrgSchema);
