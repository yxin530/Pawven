import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import WebSocket from 'ws';

// Polyfill WebSocket for Node.js < 22
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Seeding Supabase database...');

  // Seed feeders
  const feeders = [
    {
      name: 'Taman Tun Park Feeder',
      lat: 3.1390,
      lng: 101.6315,
      address: 'Taman Tun Dr Ismail, Kuala Lumpur',
      status: 'online',
      kibble_level: 80,
      mqtt_topic: 'pawven/feeders/ttdi-01',
      stream_url: 'https://stream.pawven.app/ttdi-01',
    },
    {
      name: 'Bangsar South Feeder',
      lat: 3.1100,
      lng: 101.6650,
      address: 'Bangsar South, Kuala Lumpur',
      status: 'online',
      kibble_level: 45,
      mqtt_topic: 'pawven/feeders/bangsar-01',
      stream_url: 'https://stream.pawven.app/bangsar-01',
    },
    {
      name: 'Petaling Jaya Community Feeder',
      lat: 3.1073,
      lng: 101.6067,
      address: 'SS2, Petaling Jaya',
      status: 'offline',
      kibble_level: 10,
      mqtt_topic: 'pawven/feeders/pj-ss2-01',
      stream_url: 'https://stream.pawven.app/pj-ss2-01',
    },
    {
      name: 'Mont Kiara Feeder',
      lat: 3.1710,
      lng: 101.6510,
      address: 'Mont Kiara, Kuala Lumpur',
      status: 'online',
      kibble_level: 92,
      mqtt_topic: 'pawven/feeders/mk-01',
      stream_url: 'https://stream.pawven.app/mk-01',
    },
  ];

  const { error: feedersError } = await supabase.from('feeders').insert(feeders);
  if (feedersError) {
    console.error('❌ Failed to seed feeders:', feedersError.message);
  } else {
    console.log(`✅ Seeded ${feeders.length} feeders`);
  }

  // Seed events
  const events = [
    {
      title: 'Community Cat Feeding Day',
      description: 'Join us for a community feeding session at TTDI park. Bring your own containers!',
      lat: 3.1390,
      lng: 101.6315,
      address: 'Taman Tun Dr Ismail Park',
      start_time: '2025-02-15T09:00:00Z',
      end_time: '2025-02-15T12:00:00Z',
      category: 'feeding',
      status: 'upcoming',
      rsvp_count: 12,
    },
    {
      title: 'TNR Workshop for Beginners',
      description: 'Learn the basics of Trap-Neuter-Return with our experienced volunteers.',
      lat: 3.1100,
      lng: 101.6650,
      address: 'Bangsar South Community Hall',
      start_time: '2025-02-20T14:00:00Z',
      end_time: '2025-02-20T17:00:00Z',
      category: 'tnr',
      status: 'upcoming',
      rsvp_count: 8,
    },
    {
      title: 'Adoption Drive — Find Your Furry Friend',
      description: 'Over 20 cats and kittens looking for forever homes. Adoption fees waived!',
      lat: 3.1500,
      lng: 101.7100,
      address: 'Mid Valley Megamall, Level G',
      start_time: '2025-03-01T10:00:00Z',
      end_time: '2025-03-01T18:00:00Z',
      category: 'adoption',
      status: 'upcoming',
      rsvp_count: 34,
    },
    {
      title: 'Fundraiser Dinner for Strays',
      description: 'Gala dinner to raise funds for stray cat medical bills and shelters.',
      lat: 3.1580,
      lng: 101.7120,
      address: 'The Gardens Hotel, KL',
      start_time: '2025-03-10T19:00:00Z',
      end_time: '2025-03-10T22:00:00Z',
      category: 'fundraiser',
      status: 'upcoming',
      rsvp_count: 50,
    },
  ];

  const { error: eventsError } = await supabase.from('events').insert(events);
  if (eventsError) {
    console.error('❌ Failed to seed events:', eventsError.message);
  } else {
    console.log(`✅ Seeded ${events.length} events`);
  }

  // Seed organizations
  const organizations = [
    {
      name: 'SPCA Selangor',
      type: 'ngo',
      logo_url: 'https://via.placeholder.com/100',
      description: 'Society for the Prevention of Cruelty to Animals — Selangor chapter.',
      phone: '+60-3-4256-5312',
      email: 'info@spca.org.my',
      website: 'https://www.spca.org.my',
      hours: 'Mon-Sat 10am-4pm',
      donate_url: 'https://www.spca.org.my/donate',
      lat: 3.0917,
      lng: 101.6500,
      address: '3, Jalan Kerja Ayer Lama, Ampang',
    },
    {
      name: 'Paws Animal Welfare Society',
      type: 'ngo',
      logo_url: 'https://via.placeholder.com/100',
      description: 'Dedicated to the welfare of companion animals — rescue, rehabilitation, rehoming.',
      phone: '+60-3-7846-3648',
      email: 'info@pfrm.org.my',
      website: 'https://www.paws.org.my',
      hours: 'Tue-Sun 10am-5pm',
      donate_url: 'https://www.paws.org.my/donate',
      lat: 3.1044,
      lng: 101.5966,
      address: 'Petaling Jaya, Selangor',
    },
    {
      name: 'CatVet Clinic',
      type: 'vet',
      logo_url: 'https://via.placeholder.com/100',
      description: 'Feline-only veterinary clinic specializing in cat care and TNR services.',
      phone: '+60-3-2201-9988',
      email: 'hello@catvet.my',
      website: 'https://www.catvet.my',
      hours: 'Mon-Fri 9am-7pm, Sat 9am-1pm',
      lat: 3.1390,
      lng: 101.6865,
      address: 'Damansara Heights, KL',
    },
    {
      name: 'Purrfect Paws Veterinary',
      type: 'vet',
      logo_url: 'https://via.placeholder.com/100',
      description: 'Full-service vet offering TNR discounts for community cat caretakers.',
      phone: '+60-3-5621-0011',
      email: 'contact@purrfectpaws.vet',
      website: 'https://www.purrfectpaws.vet',
      hours: 'Mon-Sat 9am-6pm',
      lat: 3.1200,
      lng: 101.6100,
      address: 'Subang Jaya, Selangor',
    },
  ];

  const { error: orgsError } = await supabase.from('organizations').insert(organizations);
  if (orgsError) {
    console.error('❌ Failed to seed organizations:', orgsError.message);
  } else {
    console.log(`✅ Seeded ${organizations.length} organizations`);
  }

  console.log('🎉 Seeding complete!');
}

seed().catch((err) => {
  console.error('❌ Seed script failed:', err);
  process.exit(1);
});
