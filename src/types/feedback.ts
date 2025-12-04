// Tipos para sistema de feedback pós-evento

export interface Feedback {
    feedbackId: string;
    message?: string;            // Campo "comment" no backend é retornado como "message"
    feedbackType?: string;       // Ex: "OTHER"
    sentAt: string;              // Data de envio
    userName: string;            // Nome do usuário
    // Campos opcionais para compatibilidade com outras respostas
    eventId?: string;
    eventTitle?: string;
    userId?: string;
    rating?: number;             // 1-5 estrelas
    comment?: string;            // Alias para message
    createdAt?: string;          // Alias para sentAt
}

export interface CreateFeedbackRequest {
    eventId: string;
    rating: number;              // 1-5
    comment?: string;
}

export interface FeedbackStats {
    total: number;               // Total de feedbacks (nome do backend)
    averageRating: number;       // Média das avaliações
    rating1: number;             // Quantidade de avaliações 1 estrela
    rating2: number;             // Quantidade de avaliações 2 estrelas
    rating3: number;             // Quantidade de avaliações 3 estrelas
    rating4: number;             // Quantidade de avaliações 4 estrelas
    rating5: number;             // Quantidade de avaliações 5 estrelas
    // Campos legados para compatibilidade
    totalFeedbacks?: number;
    ratingDistribution?: {
        stars1: number;
        stars2: number;
        stars3: number;
        stars4: number;
        stars5: number;
    };
    hasUserFeedback?: boolean;
}
