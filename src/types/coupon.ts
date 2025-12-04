export interface Coupon {
    id: string;
    code: string;
    discount: number; // Percentual de desconto (1-100)
    valid: number; // Timestamp em milissegundos
    usageLimit: number | null;
    usageCount: number;
    eventId: string;
}

export interface CreateCouponRequest {
    code: string;
    discount: number;
    valid: number; // Timestamp em milissegundos
    usageLimit?: number;
}

export interface ApplyCouponRequest {
    code: string;
    eventId: string;
}
