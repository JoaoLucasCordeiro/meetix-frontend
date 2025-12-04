// Types for event participants
export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  eventTitle: string;
  participant: Participant;
  registrationDate: string;
  attended: boolean;
  checkedInAt: string | null;
}

export interface RegisterEventRequest {
  eventId: string;
  userId: string;
}

export interface IsRegisteredResponse {
  isRegistered: boolean;
}
