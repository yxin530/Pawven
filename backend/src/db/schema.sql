-- Pawven Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  role TEXT CHECK (role IN ('standard', 'ngo', 'vet')) DEFAULT 'standard',
  verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feeders
CREATE TABLE feeders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lat FLOAT8,
  lng FLOAT8,
  address TEXT,
  status TEXT CHECK (status IN ('online', 'offline')) DEFAULT 'offline',
  kibble_level INT DEFAULT 100,
  last_dispensed TIMESTAMPTZ,
  owner_id UUID REFERENCES users(id),
  mqtt_topic TEXT,
  stream_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_photo_url TEXT,
  lat FLOAT8,
  lng FLOAT8,
  address TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  host_user_id UUID REFERENCES users(id),
  rsvp_count INT DEFAULT 0,
  status TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVPs
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('ngo', 'vet')),
  logo_url TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  hours TEXT,
  donate_url TEXT,
  lat FLOAT8,
  lng FLOAT8,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TNR Reports
CREATE TABLE tnr_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stray_photo_url TEXT,
  lat FLOAT8,
  lng FLOAT8,
  address TEXT,
  notes TEXT,
  activity_type TEXT,
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updates (thread-based messages for reports and events)
CREATE TABLE updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_type TEXT,
  thread_id UUID,
  author_id UUID REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  badge_id TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT,
  amount INT,
  currency TEXT DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  feeder_id UUID REFERENCES feeders(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feeder Rentals
CREATE TABLE feeder_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  feeder_id UUID REFERENCES feeders(id),
  stripe_subscription_id TEXT,
  status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);
