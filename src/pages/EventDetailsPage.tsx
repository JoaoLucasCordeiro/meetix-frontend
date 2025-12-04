import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, DollarSign, Share2, Heart, ArrowLeft, Ticket, Award, Globe, Loader2, CheckCircle, Settings, MessageSquare, Info, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import EventsLayout from "@/components/layouts/EventsLayouts";
import { eventsAPI, participantsAPI, certificateAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Event } from "@/types/event";
import type { ApiError } from "@/types/auth";
import type { Certificate } from "@/types/certificate";
import type { EventParticipant } from "@/types/participant";

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [participantsCount, setParticipantsCount] = useState(0);
    const [userParticipation, setUserParticipation] = useState<EventParticipant | null>(null);
    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!id) {
                toast.error('ID do evento não encontrado');
                navigate('/eventos');
                return;
            }

            try {
                setIsLoading(true);
                const eventData = await eventsAPI.getEventById(id);
                setEvent(eventData);

                // Get participants count
                const participants = await participantsAPI.getEventParticipants(id);
                setParticipantsCount(participants.length);

                // Check if user is registered and get participation data
                if (isAuthenticated && user) {
                    const registrationStatus = await participantsAPI.isRegistered(id, user.id);
                    setIsRegistered(registrationStatus.isRegistered);
                    
                    // Get user's participation details (to check if attended)
                    if (registrationStatus.isRegistered) {
                        const userParticipationData = participants.find(p => p.participant.email === user.email);
                        setUserParticipation(userParticipationData || null);
                    }
                }
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error('Erro ao carregar detalhes do evento');
                navigate('/eventos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDetails();
    }, [id, navigate, isAuthenticated, user]);

    const handleRegister = async () => {
        // Wait for auth to finish loading before checking authentication
        if (authLoading) {
            return;
        }

        if (!isAuthenticated || !user) {
            toast.info('Faça login para se inscrever no evento');
            navigate('/login');
            return;
        }

        if (!id || !event) return;

        // Verificar se evento é pago
        if (event.isPaid) {
            // Verificar se sistema de ingressos pagos está disponível
            toast.info('Redirecionando para checkout...');
            navigate(`/checkout/${id}`);
            return;
        }

        // Evento gratuito: inscrição direta
        try {
            setIsRegistering(true);
            await participantsAPI.registerForEvent({
                eventId: id,
                userId: user.id,
            });
            
            setIsRegistered(true);
            setParticipantsCount(prev => prev + 1);
            toast.success('Inscrição realizada com sucesso! 🎉');
        } catch (error) {
            const apiError = error as ApiError;
            
            if (apiError.status === 409) {
                toast.error('Você já está inscrito neste evento');
                setIsRegistered(true);
            } else if (apiError.status === 400) {
                toast.error('Evento lotado! Não há mais vagas disponíveis.');
            } else {
                toast.error(apiError.message || 'Erro ao realizar inscrição');
            }
        } finally {
            setIsRegistering(false);
        }
    };

    const handleGenerateAndDownloadCertificate = async () => {
        if (!userParticipation || !event) return;

        try {
            setIsGeneratingCertificate(true);

            // Generate certificate if not already generated
            if (!certificate) {
                const generatedCertificate = await certificateAPI.generateCertificate(userParticipation.id);
                setCertificate(generatedCertificate);
            }

            // Download certificate
            const certificateToDownload = certificate || await certificateAPI.generateCertificate(userParticipation.id);
            const blob = await certificateAPI.downloadCertificate(certificateToDownload.validationCode);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificado-${event.title.replace(/\s+/g, '-')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Certificado baixado com sucesso!');
        } catch (error) {
            const apiError = error as ApiError;
            
            if (apiError.status === 409) {
                toast.error('Certificado já foi gerado anteriormente');
            } else if (apiError.status === 400) {
                toast.error('Você não atende aos requisitos para o certificado');
            } else {
                toast.error(apiError.message || 'Erro ao gerar certificado');
            }
        } finally {
            setIsGeneratingCertificate(false);
        }
    };

    // Helper functions
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric' 
        });
    };

    const formatTime = (startDateTime: string, endDateTime: string) => {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        return `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    const getCategoryColor = (eventType: string) => {
        const colors: Record<string, string> = {
            'WORKSHOP': 'bg-blue-500',
            'PALESTRA': 'bg-purple-500',
            'MINICURSO': 'bg-green-500',
            'FESTA': 'bg-pink-500',
            'OUTRO': 'bg-gray-500',
        };
        return colors[eventType] || 'bg-gray-500';
    };

    const getCategoryLabel = (eventType: string) => {
        const labels: Record<string, string> = {
            'WORKSHOP': 'Workshop',
            'PALESTRA': 'Palestra',
            'MINICURSO': 'Minicurso',
            'FESTA': 'Festa',
            'OUTRO': 'Outro',
        };
        return labels[eventType] || eventType;
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mx-auto mb-4" />
                        <p className="text-lg text-[#191919]/70">Carregando evento...</p>
                    </div>
                </div>
            </EventsLayout>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <EventsLayout>
            <div className="min-h-screen">
                {/* Hero Section with Image */}
                <div className="relative h-96 overflow-hidden">
                    <img
                        src={event.imgUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Back Button */}
                    <Link to="/eventos">
                        <Button
                            variant="outline"
                            className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="container mx-auto max-w-6xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className={`inline-block ${getCategoryColor(event.eventType)} text-white text-sm font-bold px-4 py-2 rounded-full`}>
                                        {getCategoryLabel(event.eventType)}
                                    </span>
                                    {event.remote && (
                                        <span className="inline-block bg-green-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                                            <Globe className="inline h-4 w-4 mr-1" />
                                            Online
                                        </span>
                                    )}
                                    {event.generateCertificate && (
                                        <span className="inline-block bg-yellow-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                                            <Award className="inline h-4 w-4 mr-1" />
                                            Certificado
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    {event.title}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-white/90">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        <span>{formatDate(event.startDateTime)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        <span>{formatTime(event.startDateTime, event.endDateTime)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 mr-2" />
                                        <span>{participantsCount}/{event.maxAttendees} inscritos</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 py-12 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#191919] mb-4 flex items-center gap-2">
                                    <Info className="h-6 w-6 text-[#ff914d]" />
                                    Sobre o Evento
                                </h2>
                                <p className="text-[#191919]/70 leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </motion.section>

                            {/* Event Details Grid */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center gap-2">
                                    <TrendingUp className="h-6 w-6 text-[#ff914d]" />
                                    Informações Importantes
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Data e Hora */}
                                    <div className="p-5 bg-gradient-to-br from-[#ff914d]/5 to-transparent rounded-xl border border-[#ff914d]/10 hover:border-[#ff914d]/30 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-[#ff914d]/10 rounded-lg">
                                                <Calendar className="h-5 w-5 text-[#ff914d]" />
                                            </div>
                                            <p className="font-semibold text-[#191919]">Data e Horário</p>
                                        </div>
                                        <p className="text-[#191919]/70 ml-11">
                                            {formatDate(event.startDateTime)}
                                        </p>
                                        <p className="text-sm text-[#191919]/60 ml-11 mt-1">
                                            {formatTime(event.startDateTime, event.endDateTime)}
                                        </p>
                                    </div>

                                    {/* Localização */}
                                    <div className="p-5 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                {event.remote ? (
                                                    <Globe className="h-5 w-5 text-blue-500" />
                                                ) : (
                                                    <MapPin className="h-5 w-5 text-blue-500" />
                                                )}
                                            </div>
                                            <p className="font-semibold text-[#191919]">Local</p>
                                        </div>
                                        <p className="text-[#191919]/70 ml-11">
                                            {event.remote ? 'Evento Online' : (event.location || 'A definir')}
                                        </p>
                                    </div>

                                    {/* Capacidade */}
                                    <div className="p-5 bg-gradient-to-br from-green-500/5 to-transparent rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-500/10 rounded-lg">
                                                <Users className="h-5 w-5 text-green-500" />
                                            </div>
                                            <p className="font-semibold text-[#191919]">Vagas</p>
                                        </div>
                                        <div className="ml-11">
                                            <p className="text-[#191919]/70">
                                                {participantsCount} / {event.maxAttendees} inscritos
                                            </p>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div 
                                                    className="bg-green-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${(participantsCount / event.maxAttendees) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-[#191919]/50 mt-1">
                                                {event.maxAttendees - participantsCount} vagas restantes
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tipo de Evento */}
                                    <div className="p-5 bg-gradient-to-br from-purple-500/5 to-transparent rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                                <Award className="h-5 w-5 text-purple-500" />
                                            </div>
                                            <p className="font-semibold text-[#191919]">Categoria</p>
                                        </div>
                                        <p className="text-[#191919]/70 ml-11">
                                            {getCategoryLabel(event.eventType)}
                                        </p>
                                    </div>
                                </div>

                                {/* Recursos do Evento */}
                                {event.generateCertificate && (
                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <p className="text-sm font-semibold text-[#191919] mb-3">Este evento oferece:</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium border border-yellow-200">
                                                <Award className="h-4 w-4" />
                                                Certificado Digital
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </motion.section>

                            {/* Event URL for remote events */}
                            {event.remote && event.eventUrl && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-2xl p-8 shadow-lg border border-green-200"
                                >
                                    <h2 className="text-xl font-bold text-[#191919] mb-4 flex items-center gap-2">
                                        <Globe className="h-6 w-6 text-green-600" />
                                        Link do Evento Online
                                    </h2>
                                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-green-200">
                                        <Globe className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <a
                                            href={event.eventUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:text-green-700 font-medium break-all hover:underline"
                                        >
                                            {event.eventUrl}
                                        </a>
                                    </div>
                                    <p className="text-sm text-green-700/70 mt-3">
                                        O link ficará disponível para participantes inscritos
                                    </p>
                                </motion.section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-6 space-y-6"
                            >
                                {/* Registration Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="mb-6">
                                        {!event.isPaid ? (
                                            <div className="text-center">
                                                <p className="text-sm text-[#191919]/60 mb-2">
                                                    Entrada
                                                </p>
                                                <p className="text-4xl font-bold text-green-500">
                                                    GRÁTIS
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-sm text-[#191919]/60 mb-2">
                                                    Ingresso
                                                </p>
                                                <div className="flex items-center justify-center">
                                                    <DollarSign className="h-6 w-6 text-[#ff914d]" />
                                                    <p className="text-4xl font-bold text-[#191919]">
                                                        {(event.price || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botão de Gerenciar para Organizador */}
                                    {user && event.organizer?.id === user.id ? (
                                        <Button 
                                            onClick={() => navigate(`/eventos/${id}/gerenciar`)}
                                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 text-lg mb-4 shadow-lg shadow-purple-500/30"
                                        >
                                            <Settings className="mr-2 h-5 w-5" />
                                            Gerenciar Evento
                                        </Button>
                                    ) : isRegistered ? (
                                        <>
                                            <Button 
                                                disabled
                                                className="w-full bg-green-500 hover:bg-green-500 text-white font-bold py-6 text-lg mb-4 shadow-lg"
                                            >
                                                <CheckCircle className="mr-2 h-5 w-5" />
                                                Já Inscrito
                                            </Button>
                                            
                                            {/* Botão de Feedback - aparece apenas após o evento terminar */}
                                            {new Date(event.endDateTime) < new Date() && (
                                                <>
                                                    <Button 
                                                        onClick={() => navigate(`/eventos/${id}/feedback`)}
                                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-6 text-lg mb-4 shadow-lg shadow-blue-500/30"
                                                    >
                                                        <MessageSquare className="mr-2 h-5 w-5" />
                                                        Dar Feedback
                                                    </Button>

                                                    {/* Botão de Certificado - aparece se evento gera certificado e usuário fez check-in */}
                                                    {event.generateCertificate && userParticipation?.attended && (
                                                        <Button 
                                                            onClick={handleGenerateAndDownloadCertificate}
                                                            disabled={isGeneratingCertificate}
                                                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-6 text-lg mb-4 shadow-lg shadow-yellow-500/30"
                                                        >
                                                            {isGeneratingCertificate ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                    Gerando Certificado...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Award className="mr-2 h-5 w-5" />
                                                                    Baixar Certificado
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Button 
                                            onClick={handleRegister}
                                            disabled={authLoading || isRegistering || participantsCount >= event.maxAttendees}
                                            className="w-full bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] text-white font-bold py-6 text-lg mb-4 shadow-lg shadow-[#ff914d]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {authLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Carregando...
                                                </>
                                            ) : isRegistering ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    {event.isPaid ? 'Redirecionando...' : 'Inscrevendo...'}
                                                </>
                                            ) : participantsCount >= event.maxAttendees ? (
                                                'Evento Lotado'
                                            ) : (
                                                <>
                                                    <Ticket className="mr-2 h-5 w-5" />
                                                    {event.isPaid ? 'Comprar Ingresso' : 'Confirmar Presença'}
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all">
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Organizer Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="font-bold text-[#191919] mb-4 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-[#ff914d]" />
                                        Organizado por
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${event.organizer.firstName}+${event.organizer.lastName}&background=ff914d&color=fff&size=128`}
                                            alt={`${event.organizer.firstName} ${event.organizer.lastName}`}
                                            className="h-14 w-14 rounded-full ring-2 ring-[#ff914d]/20"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-[#191919] text-base">
                                                {event.organizer.firstName} {event.organizer.lastName}
                                            </p>
                                            <p className="text-sm text-[#191919]/60">
                                                {event.organizer.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats Card */}
                                <div className="bg-gradient-to-br from-[#ff914d]/5 to-transparent rounded-2xl p-6 shadow-lg border border-[#ff914d]/20">
                                    <h3 className="font-bold text-[#191919] mb-4 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-[#ff914d]" />
                                        Estatísticas
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <span className="text-sm text-[#191919]/70 font-medium">Inscritos</span>
                                            <span className="text-lg font-bold text-[#ff914d]">{participantsCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <span className="text-sm text-[#191919]/70 font-medium">Vagas Totais</span>
                                            <span className="text-lg font-bold text-[#191919]">{event.maxAttendees}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                            <span className="text-sm text-[#191919]/70 font-medium">Disponível</span>
                                            <span className="text-lg font-bold text-green-500">
                                                {event.maxAttendees - participantsCount}
                                            </span>
                                        </div>
                                        {event.isPaid && (
                                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                                <span className="text-sm text-[#191919]/70 font-medium">Valor</span>
                                                <span className="text-lg font-bold text-[#ff914d]">
                                                    R$ {(event.price || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </EventsLayout>
    );
}
