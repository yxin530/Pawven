import { Organization } from '@/types';

const organizations: Organization[] = [
  {
    id: 'org-001',
    name: 'Paws Rescue KL',
    type: 'ngo',
    logoUrl: 'https://images.pawven.app/orgs/paws-rescue-kl.png',
    description:
      'A volunteer-run rescue group dedicated to rescuing, rehabilitating, and rehoming stray cats in Kuala Lumpur since 2018.',
    contact: {
      phone: '+60123456789',
      email: 'hello@pawsrescuekl.org',
      website: 'https://pawsrescuekl.org',
    },
    hours: 'Mon–Sat 9:00 AM – 6:00 PM',
    donateUrl: 'https://pawsrescuekl.org/donate',
    location: {
      latitude: 3.1390,
      longitude: 101.6869,
      address: '12 Jalan Telawi, Bangsar, Kuala Lumpur',
    },
  },
  {
    id: 'org-002',
    name: 'Dr. Lim Cat Clinic',
    type: 'vet',
    logoUrl: 'https://images.pawven.app/orgs/dr-lim-clinic.png',
    description:
      'Affordable feline-only veterinary clinic offering subsidized TNR surgeries and emergency care for community cats.',
    contact: {
      phone: '+60198765432',
      email: 'appointments@drlimcatclinic.my',
      website: 'https://drlimcatclinic.my',
    },
    hours: 'Mon–Fri 9:00 AM – 8:00 PM, Sat 9:00 AM – 2:00 PM',
    donateUrl: null,
    location: {
      latitude: 3.1200,
      longitude: 101.6545,
      address: '45 Jalan SS2/61, Petaling Jaya',
    },
  },
  {
    id: 'org-003',
    name: 'SPCA Selangor',
    type: 'ngo',
    logoUrl: 'https://images.pawven.app/orgs/spca-selangor.png',
    description:
      'One of Malaysia\'s oldest animal welfare organizations providing shelter, adoption services, and community education programs.',
    contact: {
      phone: '+60342565312',
      email: 'info@spca.org.my',
      website: 'https://spca.org.my',
    },
    hours: 'Mon–Sun 10:00 AM – 4:00 PM',
    donateUrl: 'https://spca.org.my/donate',
    location: {
      latitude: 3.0750,
      longitude: 101.6850,
      address: '2 Jalan Kerja Ayer Lama, Ampang, Selangor',
    },
  },
];

export default organizations;
