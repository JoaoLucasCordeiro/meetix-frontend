import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Star, MessageSquare, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import EventsLayout from '@/components/layouts/EventsLayouts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI, feedbackAPI } from '@/lib/api';
import type { Event } from '@/types/event';
import type { ApiError } from '@/types/auth';

export default function FeedbackFormPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hasAlreadyFeedback, setHasAlreadyFeedback] = useState(false);
    
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Você precisa estar logado');
            navigate('/login');
            return;
        }

        if (!eventId) {
            toast.error('Evento não encontrado');
            navigate('/eventos');
            return;
        }

        loadEvent();
        checkExistingFeedback();
    }, [eventId, isAuthenticated]);

    const loadEvent = async () => {
        try {
            setIsLoading(true);
            const data = await eventsAPI.getEventById(eventId!);
            setEvent(data);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar evento');
            navigate('/eventos');
        } finally {
            setIsLoading(false);
        }
    };

    const checkExistingFeedback = async () => {
        try {
            const result = await feedbackAPI.hasUserFeedback(eventId!);
            if (result.hasFeedback) {
                setHasAlreadyFeedback(true);
                toast.info('Você já enviou feedback para este evento');
            }
        } catch (error) {
            console.error('Erro ao verificar feedback:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Por favor, selecione uma avaliação');
            return;
        }

        if (hasAlreadyFeedback) {
            toast.error('Você já enviou feedback para este evento');
            return;
        }

        setIsSubmitting(true);

        try {
            await feedbackAPI.submitFeedback({
                eventId: eventId!,
                rating,
                comment: comment.trim() || undefined,
            });

            setIsSubmitted(true);
            toast.success('Feedback enviado com sucesso! Obrigado pela sua avaliação! 🎉');
            
            // Redirecionar após 3 segundos
            setTimeout(() => {
                navigate('/meus-eventos');
            }, 3000);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao enviar feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d] mx-auto mb-4" />
                        <p className="text-gray-600">Carregando...</p>
                    </div>
                </div>
            </EventsLayout>
        );
    }

    if (!event) return null;

    // Já enviou feedback - mensagem de sucesso
    if (isSubmitted) {
        return (
            <EventsLayout>
                <div className="container mx-auto px-4 py-16 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
                    >
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-[#191919] mb-4">
                                Feedback Enviado!
                            </h1>
                            <p className="text-lg text-gray-600 mb-2">
                                Obrigado por compartilhar sua experiência!
                            </p>
                            <p className="text-sm text-gray-500">
                                Seu feedback ajuda a melhorar nossos eventos.
                            </p>
                        </div>

                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 ${
                                        star <= rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={() => navigate('/meus-eventos')}
                            className="bg-[#ff914d] hover:bg-[#ff7b33]"
                        >
                            Voltar para Meus Eventos
                        </Button>
                    </motion.div>
                </div>
            </EventsLayout>
        );
    }

    // Já enviou feedback anteriormente
    if (hasAlreadyFeedback) {
        return (
            <EventsLayout>
                <div className="container mx-auto px-4 py-16 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
                    >
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="h-10 w-10 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-[#191919] mb-4">
                            Feedback Já Enviado
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Você já enviou seu feedback para este evento. Obrigado!
                        </p>
                        <Button
                            onClick={() => navigate('/meus-eventos')}
                            variant="outline"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar para Meus Eventos
                        </Button>
                    </motion.div>
                </div>
            </EventsLayout>
        );
    }

    // Formulário de feedback
    return (
        <EventsLayout>
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        onClick={() => navigate(`/eventos/${eventId}`)}
                        variant="outline"
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para Evento
                    </Button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <MessageSquare className="h-8 w-8 text-[#ff914d]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#191919]">
                                Avalie <span className="text-[#ff914d]">sua Experiência</span>
                            </h1>
                            <p className="text-gray-600">{event.title}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                    {/* Rating com Estrelas */}
                    <div className="mb-8">
                        <label className="block text-lg font-semibold text-[#191919] mb-4">
                            Como você avalia este evento?
                        </label>
                        <div className="flex justify-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`h-12 w-12 transition-colors ${
                                            star <= (hoverRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                {rating === 0 && 'Clique nas estrelas para avaliar'}
                                {rating === 1 && '⭐ Muito Ruim'}
                                {rating === 2 && '⭐⭐ Ruim'}
                                {rating === 3 && '⭐⭐⭐ Regular'}
                                {rating === 4 && '⭐⭐⭐⭐ Bom'}
                                {rating === 5 && '⭐⭐⭐⭐⭐ Excelente'}
                            </p>
                        </div>
                    </div>

                    {/* Comentário */}
                    <div className="mb-8">
                        <label className="block text-lg font-semibold text-[#191919] mb-3">
                            Deixe um comentário (opcional)
                        </label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte-nos mais sobre sua experiência no evento..."
                            className="min-h-[150px] rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] resize-none"
                            maxLength={500}
                        />
                        <p className="text-sm text-gray-500 mt-2 text-right">
                            {comment.length}/500 caracteres
                        </p>
                    </div>

                    {/* Botão de Enviar */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="w-full bg-[#ff914d] hover:bg-[#ff7b33] h-14 text-lg font-semibold"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5 mr-2" />
                                Enviar Feedback
                            </>
                        )}
                    </Button>
                </motion.form>
            </div>
        </EventsLayout>
    );
}
