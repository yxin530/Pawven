import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || '',
};
