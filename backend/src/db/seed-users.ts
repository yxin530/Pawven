import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

const USERS = [
  // Normal users
  { clerk_id: 'user_normal_01', email: 'sarah@example.com', name: 'Sarah Lim', role: 'standard', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=sarah&size=160' },
  { clerk_id: 'user_normal_02', email: 'amir@example.com', name: 'Amir Hassan', role: 'standard', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=amir&size=160' },
  { clerk_id: 'user_normal_03', email: 'mei@example.com', name: 'Mei Ling', role: 'standard', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=mei&size=160' },
  // NGOs
  { clerk_id: 'user_ngo_01', email: 'info@spcasg.org', name: 'SPCA Singapore', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=SPCA&size=160' },
  { clerk_id: 'user_ngo_02', email: 'hello@catwelfaresg.org', name: 'CatWelfare SG', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=CW&size=160' },
  { clerk_id: 'user_ngo_03', email: 'contact@klcatrescue.org', name: 'KL Cat Rescue', role: 'ngo', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/initials/png?seed=KCR&size=160' },
  // Vets
  { clerk_id: 'user_vet_01', email: 'dr.priya@vetclinic.com', name: 'Dr. Priya Sharma', role: 'vet', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=priya&size=160' },
  { clerk_id: 'user_vet_02', email: 'dr.kevin@petave.com', name: 'Dr. Kevin Ong', role: 'vet', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=kevin&size=160' },
  { clerk_id: 'user_vet_03', email: 'dr.lim@catclinic.my', name: 'Dr. Lim Wei', role: 'vet', verified: true, profile_image_url: 'https://api.dicebear.com/9.x/avataaars/png?seed=drlim&size=160' },
];

async function seedUsers() {
  console.log('🌱 Seeding users...');

  const { data, error } = await supabase.from('users').upsert(USERS, { onConflict: 'clerk_id' }).select();

  if (error) {
    console.error('❌ Failed to seed users:', error.message);
  } else {
    console.log(`✅ Seeded ${data?.length || 0} users`);
  }

  console.log('🎉 User seeding complete!');
}

seedUsers();
