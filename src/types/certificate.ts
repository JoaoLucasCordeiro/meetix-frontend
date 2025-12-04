export interface Certificate {
    certificateId: string;
    validationCode: string;
    participantName: string;
    eventTitle: string;
    eventDate: string;
    generatedAt: string;
}

export interface GenerateCertificateRequest {
    participantId: string;
}
