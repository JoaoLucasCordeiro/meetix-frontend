import type { LoginRequest, RegisterRequest, AuthResponse, ApiError } from '@/types/auth';
import type { Event, CreateEventRequest } from '@/types/event';
import type { EventParticipant, RegisterEventRequest, IsRegisteredResponse } from '@/types/participant';
import type { Badge, CreateBadgeRequest } from '@/types/badge';
import type { TicketOrder, EventTicket, CreateOrderRequest, UploadProofRequest, ValidateOrderRequest, TicketValidation } from '@/types/ticket';
import type { Feedback, CreateFeedbackRequest, FeedbackStats } from '@/types/feedback';
import type { Certificate } from '@/types/certificate';
import type { Coupon, CreateCouponRequest, ApplyCouponRequest } from '@/types/coupon';
import type { Notification } from '@/types/notification';

const API_BASE_URL = 'http://localhost:8081';

// Helper function to handle fetch requests
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Parse response first
    let data;
    try {
      data = await response.json();
    } catch {
      // If response is not JSON, create generic error
      data = { message: 'Erro ao processar resposta do servidor' };
    }

    // Handle error responses
    if (!response.ok) {
      const error: ApiError = {
        message: data.message || 'Ocorreu um erro na requisição',
        status: response.status,
      };
      
      // Special handling for 401 - only clear auth data if we have a token (token expired scenario)
      // Don't clear on login attempts with wrong credentials
      if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Dispatch custom event for token expiration
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      
      throw error;
    }

    return data as T;
  } catch (error) {
    // Re-throw API errors (errors with status code)
    if ((error as ApiError).status !== undefined) {
      throw error;
    }

    // Handle network errors (fetch failed, no response)
    console.error('Network error:', error);
    throw {
      message: 'Erro de conexão. Verifique sua internet.',
      status: 0,
    } as ApiError;
  }
}

// Auth API methods
export const authAPI = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetchAPI<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Backend returns flat structure, not nested user object
    const user = {
      id: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      instagram: response.instagram,
      university: response.university,
      course: response.course,
    };

    // Save token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token: response.token, user };
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetchAPI<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Backend returns flat structure, not nested user object
    const user = {
      id: response.userId,
      firstName: response.firstName,
      lastName: response.lastName,
      email: response.email,
      instagram: response.instagram,
      university: response.university,
      course: response.course,
    };

    // Save token and user data
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token: response.token, user };
  },

  async logout(): Promise<void> {
    try {
      await fetchAPI('/auth/logout', {
        method: 'POST',
      });
    } finally {
      // Always clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async validateToken(): Promise<boolean> {
    try {
      await fetchAPI('/auth/validate', {
        method: 'GET',
      });
      return true;
    } catch {
      return false;
    }
  },

  getCurrentUser(): string | null {
    return localStorage.getItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// Events API methods
export const eventsAPI = {
  async getAllEvents(): Promise<Event[]> {
    return await fetchAPI<Event[]>('/api/events', {
      method: 'GET',
    });
  },

  async getEventById(id: string): Promise<Event> {
    return await fetchAPI<Event>(`/api/events/${id}`, {
      method: 'GET',
    });
  },

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return await fetchAPI<Event[]>(`/api/events/organizer/${organizerId}`, {
      method: 'GET',
    });
  },

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    return await fetchAPI<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  async updateEvent(id: string, eventData: Partial<CreateEventRequest>): Promise<Event> {
    return await fetchAPI<Event>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  async deleteEvent(id: string): Promise<void> {
    await fetchAPI<void>(`/api/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Event Participants API methods
export const participantsAPI = {
  async registerForEvent(data: RegisterEventRequest): Promise<EventParticipant> {
    return await fetchAPI<EventParticipant>('/api/event-participants/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async isRegistered(eventId: string, userId: string): Promise<IsRegisteredResponse> {
    return await fetchAPI<IsRegisteredResponse>(
      `/api/event-participants/is-registered?eventId=${eventId}&userId=${userId}`,
      {
        method: 'GET',
      }
    );
  },

  async checkIn(eventId: string, userId: string): Promise<EventParticipant> {
    return await fetchAPI<EventParticipant>(
      `/api/event-participants/check-in?eventId=${eventId}&userId=${userId}`,
      {
        method: 'POST',
      }
    );
  },

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    return await fetchAPI<EventParticipant[]>(`/api/event-participants/event/${eventId}`, {
      method: 'GET',
    });
  },

  async getUserParticipations(userId: string): Promise<EventParticipant[]> {
    return await fetchAPI<EventParticipant[]>(`/api/event-participants/user/${userId}`, {
      method: 'GET',
    });
  },

  async downloadTicket(participantId: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}/api/event-participants/${participantId}/ticket`,
      {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao baixar ingresso');
    }

    return await response.blob();
  },
};

// Badge API methods
export const badgesAPI = {
  async createBadge(eventId: string, data: CreateBadgeRequest): Promise<Badge> {
    return await fetchAPI<Badge>(`/api/badges/event/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getEventBadges(eventId: string): Promise<Badge[]> {
    return await fetchAPI<Badge[]>(`/api/badges/event/${eventId}`, {
      method: 'GET',
    });
  },

  async generateBadge(badgeId: string): Promise<Badge> {
    return await fetchAPI<Badge>(`/api/badges/${badgeId}/generate`, {
      method: 'POST',
    });
  },

  async getBadgeStats(eventId: string): Promise<{ generatedCount: number }> {
    return await fetchAPI<{ generatedCount: number }>(`/api/badges/event/${eventId}/stats`);
  },

  async downloadBadgePDF(badgeId: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/badges/${badgeId}/pdf`;
    
    console.log('Downloading badge PDF from:', url);
    console.log('Badge ID:', badgeId);
    console.log('Token exists:', !!token);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Erro ao baixar crachá';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw error;
      }

      const blob = await response.blob();
      console.log('Blob received successfully, size:', blob.size, 'type:', blob.type);
      return blob;
    } catch (error) {
      console.error('Download badge error:', error);
      throw error;
    }
  },
};

export const ticketOrdersAPI = {
  // User cria pedido
  async createOrder(data: CreateOrderRequest): Promise<TicketOrder> {
    return await fetchAPI<TicketOrder>('/api/ticket-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // User envia comprovante
  async uploadProof(orderId: string, data: UploadProofRequest): Promise<TicketOrder> {
    return await fetchAPI<TicketOrder>(`/api/ticket-orders/${orderId}/upload-proof`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // User cancela pedido
  async cancelOrder(orderId: string): Promise<void> {
    return await fetchAPI<void>(`/api/ticket-orders/${orderId}/cancel`, {
      method: 'DELETE',
    });
  },

  // User lista seus pedidos
  async getMyOrders(): Promise<TicketOrder[]> {
    return await fetchAPI<TicketOrder[]>('/api/ticket-orders/user/my-orders');
  },

  // Admin valida pedido
  async validateOrder(orderId: string, data: ValidateOrderRequest): Promise<TicketOrder> {
    return await fetchAPI<TicketOrder>(`/api/ticket-orders/${orderId}/validate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Admin lista pedidos do evento
  async getEventOrders(eventId: string): Promise<TicketOrder[]> {
    return await fetchAPI<TicketOrder[]>(`/api/ticket-orders/event/${eventId}`);
  },
};

export const ticketsAPI = {
  // User lista seus ingressos
  async getMyTickets(): Promise<EventTicket[]> {
    return await fetchAPI<EventTicket[]>('/api/tickets/user/my-tickets');
  },

  // Download PDF do ingresso
  async downloadTicketPDF(validationCode: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/api/tickets/${validationCode}/pdf`;
    
    console.log('Downloading ticket PDF from:', url);
    console.log('Validation code:', validationCode);
    console.log('Token exists:', !!token);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Erro ao baixar ingresso';
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };
        throw error;
      }

      const blob = await response.blob();
      console.log('Ticket blob received successfully, size:', blob.size, 'type:', blob.type);
      return blob;
    } catch (error) {
      console.error('Download ticket error:', error);
      throw error;
    }
  },

  // Organizador lista ingressos do evento
  async getEventTickets(eventId: string): Promise<EventTicket[]> {
    return await fetchAPI<EventTicket[]>(`/api/tickets/event/${eventId}`);
  },

  // Check-in via QR Code (valida e marca como USED)
  async validateTicket(validationCode: string): Promise<EventTicket> {
    return await fetchAPI<EventTicket>(`/api/tickets/${validationCode}/validate`, {
      method: 'POST',
    });
  },

  // Listar histórico de validações de um evento
  async getEventValidations(eventId: string): Promise<TicketValidation[]> {
    return await fetchAPI<TicketValidation[]>(`/api/tickets/event/${eventId}/validations`);
  },
};

// Feedback API
export const feedbackAPI = {
  // Enviar feedback para um evento
  async submitFeedback(feedbackData: CreateFeedbackRequest): Promise<Feedback> {
    return await fetchAPI<Feedback>('/api/feedbacks', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  },

  // Listar feedbacks de um evento (organizador)
  async getEventFeedbacks(eventId: string): Promise<Feedback[]> {
    return await fetchAPI<Feedback[]>(`/api/feedbacks/event/${eventId}`);
  },

  // Obter estatísticas de feedback de um evento
  async getFeedbackStats(eventId: string): Promise<FeedbackStats> {
    return await fetchAPI<FeedbackStats>(`/api/feedbacks/event/${eventId}/stats`);
  },

  // Verificar se usuário já deu feedback no evento
  async hasUserFeedback(eventId: string): Promise<{ hasFeedback: boolean }> {
    return await fetchAPI<{ hasFeedback: boolean }>(`/api/feedbacks/event/${eventId}/user/has-feedback`);
  },
};

// Certificate API
export const certificateAPI = {
  // Gerar certificado para um participante
  async generateCertificate(participantId: string): Promise<Certificate> {
    return await fetchAPI<Certificate>(`/api/certificates/generate/${participantId}`, {
      method: 'POST',
    });
  },

  // Baixar certificado em PDF
  async downloadCertificate(validationCode: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/api/certificates/download/${validationCode}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao baixar certificado');
    }

    return response.blob();
  },
};

// Coupon API
export const couponAPI = {
  // Criar cupom de desconto
  async createCoupon(eventId: string, couponData: CreateCouponRequest): Promise<Coupon> {
    return await fetchAPI<Coupon>(`/api/coupon/event/${eventId}`, {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  // Aplicar/validar cupom
  async applyCoupon(couponData: ApplyCouponRequest): Promise<Coupon> {
    return await fetchAPI<Coupon>('/api/coupon/apply', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  // Listar cupons válidos de um evento
  async getValidCoupons(eventId: string): Promise<Coupon[]> {
    return await fetchAPI<Coupon[]>(`/api/coupon/event/${eventId}/valid`);
  },
};

// Notification API
export const notificationAPI = {
  // Listar todas as notificações do usuário
  async getNotifications(): Promise<Notification[]> {
    return await fetchAPI<Notification[]>('/api/notifications');
  },

  // Contar notificações não lidas
  async getUnreadCount(): Promise<{ count: number }> {
    return await fetchAPI<{ count: number }>('/api/notifications/unread-count');
  },

  // Marcar notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    await fetchAPI<void>(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },
};

export default fetchAPI;
