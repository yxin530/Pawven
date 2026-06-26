// Shared backend types

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export type UserRole = 'standard' | 'ngo' | 'vet';

export type FeederStatus = 'online' | 'offline';

export type EventStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export type EventCategory = 'adoption' | 'feeding' | 'tnr' | 'fundraiser' | 'meetup' | 'volunteer';

export type OrgType = 'ngo' | 'vet';

export type TNRActivityType = 'trapped' | 'neutered' | 'returned' | 'feeding' | 'sighting';

export type ReportStatus = 'open' | 'accepted' | 'in_progress' | 'completed';

export type ThreadType = 'report' | 'event';

export type TransactionType = 'kibble' | 'rental' | 'donation';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export type RentalStatus = 'active' | 'cancelled' | 'past_due';

export interface ApiError {
  error: {
    statusCode: number;
    message: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}
