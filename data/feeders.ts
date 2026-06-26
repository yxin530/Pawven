import { Feeder } from '@/types';

const feeders: Feeder[] = [
  {
    id: 'feeder-001',
    name: 'Taman Desa Cat Corner',
    location: {
      latitude: 3.1087,
      longitude: 101.6687,
      address: 'Taman Desa, Kuala Lumpur',
    },
    status: 'online',
    kibbleLevel: 72,
    lastDispensed: '2024-12-15T08:30:00Z',
    streamUrl: 'https://stream.pawven.app/feeder-001',
  },
  {
    id: 'feeder-002',
    name: 'Bangsar South Park Feeder',
    location: {
      latitude: 3.1105,
      longitude: 101.6632,
      address: 'Bangsar South, Kuala Lumpur',
    },
    status: 'online',
    kibbleLevel: 45,
    lastDispensed: '2024-12-15T07:15:00Z',
    streamUrl: 'https://stream.pawven.app/feeder-002',
  },
  {
    id: 'feeder-003',
    name: 'TTDI Community Feeder',
    location: {
      latitude: 3.1345,
      longitude: 101.6301,
      address: 'Taman Tun Dr Ismail, Kuala Lumpur',
    },
    status: 'offline',
    kibbleLevel: 12,
    lastDispensed: '2024-12-14T22:00:00Z',
    streamUrl: null,
  },
  {
    id: 'feeder-004',
    name: 'Petaling Jaya SS2 Feeder',
    location: {
      latitude: 3.1178,
      longitude: 101.6272,
      address: 'SS2, Petaling Jaya',
    },
    status: 'online',
    kibbleLevel: 88,
    lastDispensed: '2024-12-15T09:00:00Z',
    streamUrl: 'https://stream.pawven.app/feeder-004',
  },
  {
    id: 'feeder-005',
    name: 'Cheras Leisure Mall Feeder',
    location: {
      latitude: 3.0895,
      longitude: 101.7372,
      address: 'Cheras, Kuala Lumpur',
    },
    status: 'offline',
    kibbleLevel: 0,
    lastDispensed: null,
    streamUrl: null,
  },
];

export default feeders;
