// Tipos para sistema de feedback pós-evento

export interface Feedback {
    feedbackId: string;
    eventId: string;
    eventTitle: string;
    userId: string;
    userName: string;
    rating: number;              // 1-5 estrelas
    comment?: string;            // Comentário opcional
    createdAt: string;
}

export interface CreateFeedbackRequest {
    eventId: string;
    rating: number;              // 1-5
    comment?: string;
}

export interface FeedbackStats {
    totalFeedbacks: number;
    averageRating: number;       // Média das avaliações
    ratingDistribution: {
        stars1: number;
        stars2: number;
        stars3: number;
        stars4: number;
        stars5: number;
    };
    hasUserFeedback: boolean;    // Se o usuário já deu feedback neste evento
}
