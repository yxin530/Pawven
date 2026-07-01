// Mock posts for NGOs, Communities, and Vets
// Each org/community has 5-6 cat-related posts

export interface Post {
  id: string;
  orgId: string; // matches the org/community name
  text: string;
  time: string;
  likes: number;
  comments: number;
}

const POSTS: Post[] = [
  // ─── SPCA Selangor ─────────────────────────────────────────────────
  { id: 'p1', orgId: 'SPCA Selangor', text: '🐾 5 kittens rescued from a drain in Ampang today! All safe and dry now. Foster homes needed!', time: '2 hours ago', likes: 34, comments: 8 },
  { id: 'p2', orgId: 'SPCA Selangor', text: '📢 Reminder: Our free TNR clinic runs every Saturday 9AM-12PM. Bring your community cats!', time: '1 day ago', likes: 21, comments: 3 },
  { id: 'p3', orgId: 'SPCA Selangor', text: '🍲 Feeder refill done at Taman Desa colony — 8 cats fed this morning. Thank you volunteers!', time: '2 days ago', likes: 45, comments: 12 },
  { id: 'p4', orgId: 'SPCA Selangor', text: '🎉 Adoption update: Milo found his forever home! That makes 3 adoptions this week.', time: '3 days ago', likes: 67, comments: 15 },
  { id: 'p5', orgId: 'SPCA Selangor', text: '⚠️ Alert: Injured tabby spotted near Ampang Point. If you see her, please contact us immediately.', time: '5 days ago', likes: 28, comments: 9 },

  // ─── SPCA Singapore ────────────────────────────────────────────────
  { id: 'p6', orgId: 'SPCA Singapore', text: '🐱 Meet Whiskers! This gentle senior is looking for a quiet home. Loves lap time and chin scratches.', time: '3 hours ago', likes: 52, comments: 7 },
  { id: 'p7', orgId: 'SPCA Singapore', text: '📸 Colony count at Pasir Ris complete — 23 cats documented. TNR scheduling in progress.', time: '1 day ago', likes: 38, comments: 5 },
  { id: 'p8', orgId: 'SPCA Singapore', text: '🏥 Vaccination drive this weekend at our Mount Vernon centre. Free for community cats!', time: '2 days ago', likes: 41, comments: 11 },
  { id: 'p9', orgId: 'SPCA Singapore', text: '🐾 Thank you to all 15 volunteers who helped with the Toa Payoh feeding round today!', time: '4 days ago', likes: 29, comments: 4 },
  { id: 'p10', orgId: 'SPCA Singapore', text: '💛 Happy tail: Luna was adopted after 6 months in our shelter. She finally has a family!', time: '6 days ago', likes: 73, comments: 18 },

  // ─── Cat Welfare SG ────────────────────────────────────────────────
  { id: 'p11', orgId: 'Cat Welfare SG', text: '🐈 New colony identified at Clementi — 6 unsterilised cats. TNR team dispatched.', time: '5 hours ago', likes: 19, comments: 3 },
  { id: 'p12', orgId: 'Cat Welfare SG', text: '📚 Educational talk on responsible feeding this Thursday at Toa Payoh library. Free entry!', time: '1 day ago', likes: 24, comments: 6 },
  { id: 'p13', orgId: 'Cat Welfare SG', text: '🍽️ Smart feeder at Block 42 refilled. 13 cats detected in the last 24 hours.', time: '3 days ago', likes: 31, comments: 2 },
  { id: 'p14', orgId: 'Cat Welfare SG', text: '✂️ 4 cats neutered today at our partner clinic. Thank you Dr. Kevin for the subsidised slots!', time: '4 days ago', likes: 42, comments: 8 },
  { id: 'p15', orgId: 'Cat Welfare SG', text: '🎁 Donation drive: We need wet food and flea treatment. Drop-off at our Toa Payoh centre.', time: '1 week ago', likes: 55, comments: 14 },

  // ─── KucingCare ────────────────────────────────────────────────────
  { id: 'p16', orgId: 'KucingCare', text: '🐱 Morning feeding at George Town market — 12 hungry cats served! They were so happy.', time: '4 hours ago', likes: 27, comments: 5 },
  { id: 'p17', orgId: 'KucingCare', text: '🏠 Looking for foster families in Penang! We have 3 kittens needing temporary homes.', time: '2 days ago', likes: 33, comments: 9 },
  { id: 'p18', orgId: 'KucingCare', text: '💉 Vaccination day completed — 8 community cats now fully vaccinated. Prevention matters!', time: '3 days ago', likes: 18, comments: 2 },
  { id: 'p19', orgId: 'KucingCare', text: '📢 We are expanding to Butterworth! Volunteers needed for colony management.', time: '5 days ago', likes: 41, comments: 11 },
  { id: 'p20', orgId: 'KucingCare', text: '🐾 Rescued a limping cat near Gurney Drive. Now at the vet getting checked. Updates soon.', time: '1 week ago', likes: 36, comments: 7 },

  // ─── Dr Priya Sharma ───────────────────────────────────────────────
  { id: 'p21', orgId: 'Dr Priya Sharma', text: '🩺 Busy day — 6 sterilisations completed. These community cats will not contribute to overpopulation now.', time: '6 hours ago', likes: 22, comments: 4 },
  { id: 'p22', orgId: 'Dr Priya Sharma', text: '⚕️ Tip: If you find an injured stray, keep it warm and bring it to any vet. Do not try to treat wounds yourself.', time: '1 day ago', likes: 48, comments: 13 },
  { id: 'p23', orgId: 'Dr Priya Sharma', text: '🐱 Post-op check on our TNR cats — all recovering well! They will be returned to colony tomorrow.', time: '3 days ago', likes: 31, comments: 6 },
  { id: 'p24', orgId: 'Dr Priya Sharma', text: '📋 Free health screening for community cats this Saturday at my PJ clinic. Slots filling fast!', time: '4 days ago', likes: 39, comments: 8 },
  { id: 'p25', orgId: 'Dr Priya Sharma', text: '💊 Reminder: Deworming your community cats every 3 months prevents serious health issues.', time: '1 week ago', likes: 25, comments: 3 },

  // ─── Dr Kevin Ong ──────────────────────────────────────────────────
  { id: 'p26', orgId: 'Dr Kevin Ong', text: '🏥 Emergency surgery on a stray hit by a car — stable now. This is why TNR zones need signage.', time: '8 hours ago', likes: 54, comments: 16 },
  { id: 'p27', orgId: 'Dr Kevin Ong', text: '✂️ 5 TNR surgeries done today. Quick, safe, and all cats will be back in their territory by tomorrow.', time: '2 days ago', likes: 28, comments: 5 },
  { id: 'p28', orgId: 'Dr Kevin Ong', text: '🐾 Adopted out 2 kittens from the clinic today — to the same family! Brothers staying together.', time: '3 days ago', likes: 62, comments: 12 },
  { id: 'p29', orgId: 'Dr Kevin Ong', text: '📚 Hosted a workshop on basic wound care for cat caregivers. 20 attendees! Knowledge saves lives.', time: '5 days ago', likes: 35, comments: 7 },
  { id: 'p30', orgId: 'Dr Kevin Ong', text: '🩺 Clinic hours extended on Fridays for rescue cases. No appointment needed for emergencies.', time: '1 week ago', likes: 19, comments: 2 },

  // ─── Dr Lim Pet Clinic ─────────────────────────────────────────────
  { id: 'p31', orgId: 'Dr Lim Pet Clinic', text: '🐈 Treated a malnourished stray brought in by a kind resident. Gaining weight steadily now!', time: '5 hours ago', likes: 33, comments: 6 },
  { id: 'p32', orgId: 'Dr Lim Pet Clinic', text: '💉 Free rabies vaccination day next Monday. All community cats welcome — no registration needed.', time: '1 day ago', likes: 44, comments: 9 },
  { id: 'p33', orgId: 'Dr Lim Pet Clinic', text: '🏠 Looking for adopters: 3 healthy kittens, dewormed and vaccinated. Come visit!', time: '3 days ago', likes: 57, comments: 14 },
  { id: 'p34', orgId: 'Dr Lim Pet Clinic', text: '✂️ Partnered with KucingCare for subsidised sterilisations. RM50 per cat this month only.', time: '5 days ago', likes: 26, comments: 4 },
  { id: 'p35', orgId: 'Dr Lim Pet Clinic', text: '🐾 End of month tally: 22 cats sterilised, 8 adopted, 3 emergency rescues. Thank you for trusting us.', time: '1 week ago', likes: 71, comments: 21 },

  // ─── Vets for Strays (Community) ───────────────────────────────────
  { id: 'p36', orgId: 'Vets for Strays', text: '🩺 New partner clinic in Johor Bahru! Subsidised TNR slots now available in JB area.', time: '3 hours ago', likes: 41, comments: 8 },
  { id: 'p37', orgId: 'Vets for Strays', text: '📢 Volunteer call: We need trap handlers for a large colony in Bukit Bintang. DM us!', time: '1 day ago', likes: 29, comments: 6 },
  { id: 'p38', orgId: 'Vets for Strays', text: '🐱 Success story: The Chow Kit colony is now 100% sterilised. 14 cats, zero population growth.', time: '3 days ago', likes: 63, comments: 15 },
  { id: 'p39', orgId: 'Vets for Strays', text: '💊 Medical supplies donation received — enough flea treatment for 200 cats. Thank you donors!', time: '5 days ago', likes: 48, comments: 11 },
  { id: 'p40', orgId: 'Vets for Strays', text: '🍲 Coordinating feeding schedules across 5 colonies. If you want to help, check our pinned post.', time: '1 week ago', likes: 35, comments: 7 },
];

export function getPostsByOrg(orgName: string): Post[] {
  return POSTS.filter(p => p.orgId === orgName);
}

export default POSTS;
