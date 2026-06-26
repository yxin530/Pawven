import { Event } from '@/types';

const events: Event[] = [
  {
    id: 'event-001',
    title: 'Paws & Love Adoption Day',
    description:
      'Meet adorable rescued strays looking for forever homes. All cats are vaccinated and neutered.',
    coverPhotoUrl: 'https://images.pawven.app/events/adoption-day.jpg',
    location: {
      latitude: 3.1480,
      longitude: 101.7137,
      address: 'Mid Valley Megamall, Kuala Lumpur',
    },
    startTime: '2025-01-20T10:00:00Z',
    endTime: '2025-01-20T17:00:00Z',
    hostUserId: 'user-ngo-001',
    hostName: 'Paws Rescue KL',
    rsvpCount: 42,
    status: 'upcoming',
    category: 'adoption',
    createdAt: '2024-12-10T03:00:00Z',
  },
  {
    id: 'event-002',
    title: 'Community Feeding @ Taman Desa',
    description:
      'Weekly community feeding session for stray cats around the Taman Desa area. Bring your own gloves!',
    coverPhotoUrl: 'https://images.pawven.app/events/feeding-taman-desa.jpg',
    location: {
      latitude: 3.1087,
      longitude: 101.6687,
      address: 'Taman Desa Park, Kuala Lumpur',
    },
    startTime: '2025-01-18T07:00:00Z',
    endTime: '2025-01-18T09:00:00Z',
    hostUserId: 'user-std-001',
    hostName: 'Ahmad Razif',
    rsvpCount: 15,
    status: 'upcoming',
    category: 'feeding',
    createdAt: '2024-12-12T06:30:00Z',
  },
  {
    id: 'event-003',
    title: 'TNR Operation — Bangsar',
    description:
      'Trap-Neuter-Return operation targeting the Bangsar stray colony. Volunteers needed for trapping and transport.',
    coverPhotoUrl: 'https://images.pawven.app/events/tnr-bangsar.jpg',
    location: {
      latitude: 3.1295,
      longitude: 101.6715,
      address: 'Bangsar Village, Kuala Lumpur',
    },
    startTime: '2025-01-22T06:00:00Z',
    endTime: '2025-01-22T12:00:00Z',
    hostUserId: 'user-vet-001',
    hostName: 'Dr. Lim Cat Clinic',
    rsvpCount: 8,
    status: 'upcoming',
    category: 'tnr',
    createdAt: '2024-12-08T10:00:00Z',
  },
  {
    id: 'event-004',
    title: 'Meow Charity Fundraiser',
    description:
      'Live music, food stalls, and a silent auction to raise funds for stray cat medical bills. All proceeds go to Pawven Fund.',
    coverPhotoUrl: 'https://images.pawven.app/events/fundraiser-meow.jpg',
    location: {
      latitude: 3.1570,
      longitude: 101.7115,
      address: 'The Gasket Alley, Petaling Jaya',
    },
    startTime: '2025-02-01T18:00:00Z',
    endTime: '2025-02-01T23:00:00Z',
    hostUserId: 'user-ngo-002',
    hostName: 'SPCA Selangor',
    rsvpCount: 120,
    status: 'upcoming',
    category: 'fundraiser',
    createdAt: '2024-12-01T02:00:00Z',
  },
  {
    id: 'event-005',
    title: 'Cat Carers Meetup — Mont Kiara',
    description:
      'Casual meetup for community feeders and carers to share tips, coordinate feeding routes, and socialize.',
    coverPhotoUrl: 'https://images.pawven.app/events/meetup-mont-kiara.jpg',
    location: {
      latitude: 3.1715,
      longitude: 101.6505,
      address: '1 Mont Kiara Mall, Mont Kiara',
    },
    startTime: '2025-01-25T15:00:00Z',
    endTime: '2025-01-25T17:00:00Z',
    hostUserId: 'user-std-002',
    hostName: 'Siti Aisyah',
    rsvpCount: 23,
    status: 'upcoming',
    category: 'meetup',
    createdAt: '2024-12-14T08:45:00Z',
  },
];

export default events;
