export type NotificationType = 
  | 'EVENT_INVITATION'
  | 'REGISTRATION_CONFIRMATION'
  | 'EVENT_REMINDER'
  | 'CERTIFICATE_READY';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
