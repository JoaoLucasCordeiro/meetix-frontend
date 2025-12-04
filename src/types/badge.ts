export type BadgeRole = 
    | "ORGANIZER" 
    | "ADMIN" 
    | "PARTICIPANT" 
    | "SPEAKER" 
    | "VOLUNTEER" 
    | "VIP" 
    | "STAFF";

export type BadgeTemplate = 
    | "MODERN_BLUE" 
    | "ELEGANT_BLACK" 
    | "MINIMALIST" 
    | "COLORFUL" 
    | "CORPORATE";

export interface Badge {
    badgeId: string;
    eventId: string;
    eventTitle: string;
    userId: string;
    displayName: string;
    role: BadgeRole;
    template: BadgeTemplate;
    company?: string;
    additionalInfo?: string;
    photoUrl?: string;
    qrCodeData: string;
    generated: boolean;
    generatedBy?: string;
    generatedAt?: string;
    createdAt: string;
}

export interface CreateBadgeRequest {
    userId: string;
    displayName: string;
    role: BadgeRole;
    template?: BadgeTemplate;
    company?: string;
    additionalInfo?: string;
    photoUrl?: string;
}
