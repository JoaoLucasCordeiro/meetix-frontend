export type OrderStatus = 
    | 'PENDING_PAYMENT'      // Aguardando pagamento
    | 'AWAITING_VALIDATION'  // Comprovante enviado
    | 'APPROVED'             // Aprovado, ingresso gerado
    | 'REJECTED'             // Rejeitado
    | 'CANCELLED';           // Cancelado

export type TicketStatus = 
    | 'VALID'                // Válido, não usado
    | 'USED'                 // Já utilizado (check-in)
    | 'CANCELLED';           // Cancelado

export type PixKeyType = 
    | 'CPF' 
    | 'CNPJ' 
    | 'EMAIL' 
    | 'PHONE' 
    | 'RANDOM';

export interface TicketOrder {
    orderId: string;
    eventId: string;
    eventTitle: string;
    userId: string;
    userName: string;
    orderStatus: OrderStatus;
    amount: number;
    couponCode?: string;
    originalAmount?: number;
    discountPercentage?: number;
    discountAmount?: number;
    pixKey: string;
    pixKeyType: PixKeyType;
    paymentProofUrl?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventTicket {
    ticketId: string;
    orderId: string;
    eventId: string;
    eventTitle: string;
    userId: string;
    userName: string;
    validationCode: string;      // Código único para QR
    qrCodeData?: string;          // QR Code base64 (opcional - gerado após aprovação)
    ticketStatus: TicketStatus;
    checkedInAt?: string;
    issuedAt?: string;            // Data de emissão (padrão backend)
    issueDate?: string;           // Data de emissão (alternativa - vem do backend)
}

export interface CreateOrderRequest {
    eventId: string;
    couponCode?: string;
}

export interface UploadProofRequest {
    paymentProofUrl: string;
}

export interface ValidateOrderRequest {
    approved: boolean;
    rejectionReason?: string;
    notes?: string;
}

// Check-in e validação de QR Code
export interface CheckInResult {
    success: boolean;
    message: string;
    ticket?: EventTicket;
    error?: string;
}

export interface TicketValidation {
    validationId: string;
    ticketId: string;
    eventId: string;
    eventTitle: string;
    participantName: string;
    validatedAt: string;
    validatedBy: string;      // ID do organizador que fez o check-in
    validatorName: string;    // Nome do organizador
}
