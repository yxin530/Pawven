// Client-side TypeScript interfaces for Pawven app

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'standard' | 'ngo' | 'vet';
  imageUrl: string | null;
  verified: boolean;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Feeder {
  id: string;
  name: string;
  location: GeoLocation;
  status: 'online' | 'offline';
  kibbleLevel: number;
  lastDispensed: string | null;
  streamUrl: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  coverPhotoUrl: string;
  location: GeoLocation;
  startTime: string;
  endTime: string;
  hostUserId: string;
  hostName: string;
  rsvpCount: number;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  category: EventCategory;
  createdAt: string;
}

export type EventCategory = 'adoption' | 'feeding' | 'tnr' | 'fundraiser' | 'meetup' | 'volunteer';

export interface Organization {
  id: string;
  name: string;
  type: 'ngo' | 'vet';
  logoUrl: string;
  description: string;
  contact: { phone: string; email: string; website: string | null };
  hours: string;
  donateUrl: string | null;
  location: GeoLocation;
}

export interface TNRReport {
  id: string;
  strayPhotoUrl: string;
  location: GeoLocation;
  notes: string;
  activityType: TNRActivityType;
  status: TNRStatus;
  reportedBy: string;
  assignedTo: string | null;
  createdAt: string;
}

export type TNRActivityType = 'trapped' | 'neutered' | 'returned' | 'feeding' | 'sighting';

export type TNRStatus = 'open' | 'accepted' | 'in_progress' | 'completed';

export interface TNRDraft {
  location: GeoLocation | null;
  strayPhotoUrl: string | null;
  notes: string;
  activityType: TNRActivityType | null;
}

export interface UpdateMessage {
  id: string;
  threadType: 'report' | 'event';
  threadId: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface CartItem {
  feederId: string;
  feederName: string;
  grams: 10 | 20 | 50 | 100;
  quantity: number;
  pricePerUnit: number;
}

export interface Badge {
  id: string;
  badgeId: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: string;
}

export interface Transaction {
  id: string;
  type: 'kibble' | 'rental' | 'donation';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export type DiscoverFilter = 'all' | 'feeders' | 'events' | 'ngos' | 'vets';

export interface MapMarker {
  id: string;
  type: 'feeder_online' | 'feeder_offline' | 'event_upcoming' | 'event_live' | 'ngo' | 'vet';
  location: GeoLocation;
  title: string;
  subtitle: string;
  ctaLabel: string | null;
}

export interface ApiError {
  statusCode: number;
  message: string;
  retry: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  active: string;
  disabled: string;
}
