import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import WebSocket from 'ws';

// Polyfill WebSocket for Node.js 20
(global as any).WebSocket = WebSocket;

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

async function seedAll() {
  console.log('🌱 Seeding Pawven database with mock data...\n');

  // ─── Users ────────────────────────────────────────────────────────────
  const users = [
    { clerk_id: 'user_001', email: 'alice@example.com', name: 'Alice Tan', role: 'standard', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=alice&size=160' },
    { clerk_id: 'user_002', email: 'daniel@example.com', name: 'Daniel Lim', role: 'standard', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=daniel&size=160' },
    { clerk_id: 'user_003', email: 'sarah@example.com', name: 'Sarah Wong', role: 'standard', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=sarahw&size=160' },
    { clerk_id: 'ngo_001', email: 'info@spcaselangor.org', name: 'SPCA Selangor', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=SPCA&size=160' },
    { clerk_id: 'ngo_002', email: 'mail@spca.org.sg', name: 'SPCA Singapore', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=SPCASG&size=160' },
    { clerk_id: 'ngo_003', email: 'hello@catwelfare.sg', name: 'Cat Welfare SG', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=CW&size=160' },
    { clerk_id: 'ngo_004', email: 'care@kucingcare.my', name: 'KucingCare', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=KC&size=160' },
    { clerk_id: 'vet_001', email: 'dr.priya@vetclinic.com', name: 'Dr Priya Sharma', role: 'vet', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=priya&size=160' },
    { clerk_id: 'vet_002', email: 'dr.kevin@petave.com', name: 'Dr Kevin Ong', role: 'vet', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=kevin&size=160' },
    { clerk_id: 'vet_003', email: 'dr.lim@catclinic.my', name: 'Dr Lim Pet Clinic', role: 'vet', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=drlim&size=160' },
  ];

  const { error: userErr } = await supabase.from('users').upsert(users, { onConflict: 'clerk_id' });
  console.log(userErr ? `❌ Users: ${userErr.message}` : `✅ Seeded ${users.length} users`);

  // ─── Organizations ────────────────────────────────────────────────────
  const organizations = [
    { name: 'SPCA Selangor', type: 'ngo', description: 'Protecting and caring for abandoned cats through rescue, adoption, education and community feeding.', phone: '+603-4266 5312', email: 'info@spcaselangor.org', hours: '9:00 AM - 5:00 PM', address: 'Ampang, Selangor, Malaysia', lat: 3.155, lng: 101.765, logo_url: 'https://api.dicebear.com/9.x/initials/png?seed=SPCA&size=160' },
    { name: 'SPCA Singapore', type: 'ngo', description: 'Improving animal welfare through rescue, education and responsible pet ownership.', phone: '+65 6287 5355', email: 'mail@spca.org.sg', hours: '11:00 AM - 4:00 PM', address: 'Mount Vernon, Singapore', lat: 1.328, lng: 103.870, logo_url: 'https://api.dicebear.com/9.x/initials/png?seed=SPCASG&size=160' },
    { name: 'Cat Welfare SG', type: 'ngo', description: 'Building a safer environment for community cats through education and sterilisation.', phone: '+65 9123 4567', email: 'hello@catwelfare.sg', hours: '10:00 AM - 6:00 PM', address: 'Toa Payoh, Singapore', lat: 1.334, lng: 103.851, logo_url: 'https://api.dicebear.com/9.x/initials/png?seed=CW&size=160' },
    { name: 'KucingCare', type: 'ngo', description: 'Local rescue initiative helping stray cats with feeding, treatment and adoption.', phone: '+6012-889 3312', email: 'care@kucingcare.my', hours: '9:30 AM - 6:30 PM', address: 'George Town, Penang', lat: 5.414, lng: 100.329, logo_url: 'https://api.dicebear.com/9.x/initials/png?seed=KC&size=160' },
    { name: 'Dr Priya Sharma', type: 'vet', description: 'Veterinarian passionate about community cats and emergency rescue.', phone: '+6016-442 1938', hours: '10:00 AM - 7:00 PM', address: 'Petaling Jaya, Selangor', lat: 3.107, lng: 101.607, logo_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=priya&size=160' },
    { name: 'Dr Kevin Ong', type: 'vet', description: 'Small animal veterinarian with experience in surgery and rescue medicine.', phone: '+6017-389 1028', hours: '9:00 AM - 6:00 PM', address: 'Bukit Mertajam, Penang', lat: 5.363, lng: 100.460, logo_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=kevin&size=160' },
    { name: 'Dr Lim Pet Clinic', type: 'vet', description: 'Affordable veterinary services with support for stray animal welfare.', phone: '+603-7725 8812', hours: '9:00 AM - 8:00 PM', address: 'Subang Jaya, Selangor', lat: 3.049, lng: 101.586, logo_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=drlim&size=160' },
  ];

  // Delete existing orgs first to avoid duplicates
  await supabase.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: orgErr } = await supabase.from('organizations').insert(organizations);
  console.log(orgErr ? `❌ Organizations: ${orgErr.message}` : `✅ Seeded ${organizations.length} organizations`);

  // ─── Events ───────────────────────────────────────────────────────────
  const events = [
    { title: 'Workshop by SPCA', description: 'Learn basic rescue techniques, kitten care and responsible community feeding.', address: 'SPCA Selangor HQ, Ampang', start_time: '2026-08-02T10:00:00+08:00', end_time: '2026-08-02T13:00:00+08:00', category: 'workshop', status: 'upcoming', rsvp_count: 43, lat: 3.155, lng: 101.765 },
    { title: 'Vet Volunteer Day', description: 'Join veterinarians in providing health checks for rescued community cats.', address: 'Petaling Jaya, Selangor', start_time: '2026-08-09T09:00:00+08:00', end_time: '2026-08-09T16:00:00+08:00', category: 'volunteer', status: 'upcoming', rsvp_count: 37, lat: 3.107, lng: 101.607 },
    { title: 'Colony Count in Pasir Ris', description: 'Help document community cat populations to support future TNR planning.', address: 'Pasir Ris, Singapore', start_time: '2026-08-15T19:00:00+08:00', end_time: '2026-08-15T22:00:00+08:00', category: 'community', status: 'upcoming', rsvp_count: 22, lat: 1.373, lng: 103.949 },
    { title: 'Cat Owners Hangout', description: 'Meet fellow cat lovers, exchange tips and support local rescue initiatives.', address: 'George Town, Penang', start_time: '2026-08-23T14:00:00+08:00', end_time: '2026-08-23T17:00:00+08:00', category: 'meetup', status: 'upcoming', rsvp_count: 58, lat: 5.414, lng: 100.329 },
  ];

  await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: eventErr } = await supabase.from('events').insert(events);
  console.log(eventErr ? `❌ Events: ${eventErr.message}` : `✅ Seeded ${events.length} events`);

  // ─── Feeders ──────────────────────────────────────────────────────────
  const feeders = [
    { name: 'Cats Canteen', lat: 3.155, lng: 101.765, address: 'Ampang, Selangor', status: 'online', kibble_level: 85, mqtt_topic: 'pawven/feeders/cats-canteen', stream_url: 'https://stream.pawven.app/cats-canteen' },
    { name: 'Home for Cats', lat: 1.334, lng: 103.851, address: 'Toa Payoh, Singapore', status: 'online', kibble_level: 62, mqtt_topic: 'pawven/feeders/home-for-cats', stream_url: 'https://stream.pawven.app/home-for-cats' },
    { name: 'Taman Desa Feeder', lat: 3.107, lng: 101.670, address: 'Taman Desa, KL', status: 'offline', kibble_level: 18, mqtt_topic: 'pawven/feeders/taman-desa', stream_url: 'https://stream.pawven.app/taman-desa' },
  ];

  await supabase.from('feeders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: feederErr } = await supabase.from('feeders').insert(feeders);
  console.log(feederErr ? `❌ Feeders: ${feederErr.message}` : `✅ Seeded ${feeders.length} feeders`);

  console.log('\n🎉 Seeding complete!');
}

seedAll();
