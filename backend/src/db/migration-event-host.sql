-- Run this in the Supabase SQL Editor to add host contact fields and RSVP status

-- Add host social links to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_instagram TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_email TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS require_approval BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'Public';

-- Add status to rsvps (for approval flow)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
-- status can be: 'pending', 'confirmed', 'rejected'

-- Add user name/avatar to rsvps for display
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS user_avatar_url TEXT;
