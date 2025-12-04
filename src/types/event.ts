// Types for events
export type EventType = 'WORKSHOP' | 'PALESTRA' | 'MINICURSO' | 'FESTA' | 'OUTRO';

export interface EventOrganizer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Event {
  id: string;
  eventType: EventType;
  title: string;
  description: string;
  startDateTime: string; // ISO 8601 format
  endDateTime: string; // ISO 8601 format
  location?: string;
  imgUrl?: string;
  eventUrl?: string;
  remote: boolean;
  maxAttendees: number;
  isPaid: boolean;
  price?: number;
  pixKey?: string;
  pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  organizer: EventOrganizer;
  generateCertificate: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  eventType: EventType;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  imgUrl?: string;
  eventUrl?: string;
  remote: boolean;
  maxAttendees: number;
  isPaid: boolean;
  price?: number;
  pixKey?: string;
  pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  organizerId: string;
  generateCertificate: boolean;
}
