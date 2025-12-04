import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
    QrCode, 
    CheckCircle, 
    XCircle, 
    AlertTriangle, 
    Clock, 
    Users,
    ArrowLeft,
    History
} from 'lucide-react';
import EventsLayout from '@/components/layouts/EventsLayouts';
import QRScanner from '@/components/checkin/QRScanner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { eventsAPI, ticketsAPI } from '@/lib/api';
import type { Event } from '@/types/event';
import type { ApiError } from '@/types/auth';

interface ScanHistory {
    id: string;
    timestamp: Date;
    participantName: string;
    ticketId: string;
    status: 'success' | 'error' | 'duplicate';
    message: string;
}

export default function CheckInScannerPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        validated: 0,
        pending: 0
    });

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
        loadStats();
    }, [eventId, isAuthenticated]);

    const loadEvent = async () => {
        try {
            setIsLoading(true);
            const data = await eventsAPI.getEventById(eventId!);
            
            // Verificar se usuário é organizador
            if (data.organizer?.id !== user?.id) {
                toast.error('Apenas o organizador pode fazer check-in');
                navigate(`/eventos/${eventId}`);
                return;
            }

            setEvent(data);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar evento');
            navigate('/eventos');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const tickets = await ticketsAPI.getEventTickets(eventId!);
            const validated = tickets.filter(t => t.ticketStatus === 'USED').length;
            
            setStats({
                total: tickets.length,
                validated,
                pending: tickets.length - validated
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            // O QR Code contém o validationCode (UUID)
            console.log('QR Code detectado:', decodedText);

            // Validar o ingresso
            const ticket = await ticketsAPI.validateTicket(decodedText);

            // Sucesso!
            const historyEntry: ScanHistory = {
                id: Date.now().toString(),
                timestamp: new Date(),
                participantName: ticket.userName,
                ticketId: ticket.ticketId,
                status: 'success',
                message: 'Check-in realizado com sucesso!'
            };

            setScanHistory(prev => [historyEntry, ...prev]);
            
            // Atualizar estatísticas
            setStats(prev => ({
                ...prev,
                validated: prev.validated + 1,
                pending: prev.pending - 1
            }));

            // Feedback sonoro e visual
            toast.success(`✅ Check-in: ${ticket.userName}`, {
                autoClose: 2000
            });

            // Som de sucesso (opcional)
            playSuccessSound();

        } catch (error) {
            const apiError = error as ApiError;
            
            let errorMessage = 'Erro ao validar ingresso';
            let errorStatus: 'error' | 'duplicate' = 'error';

            if (apiError.message.includes('já foi validado')) {
                errorMessage = 'Ingresso já utilizado';
                errorStatus = 'duplicate';
            } else if (apiError.message.includes('cancelado')) {
                errorMessage = 'Ingresso cancelado';
            } else if (apiError.message.includes('inválido')) {
                errorMessage = 'QR Code inválido';
            } else {
                errorMessage = apiError.message || errorMessage;
            }

            const historyEntry: ScanHistory = {
                id: Date.now().toString(),
                timestamp: new Date(),
                participantName: 'Desconhecido',
                ticketId: decodedText,
                status: errorStatus,
                message: errorMessage
            };

            setScanHistory(prev => [historyEntry, ...prev]);

            toast.error(`❌ ${errorMessage}`, {
                autoClose: 3000
            });

            // Som de erro (opcional)
            playErrorSound();
        } finally {
            setIsProcessing(false);
        }
    };

    const playSuccessSound = () => {
        // Opcional: adicionar áudio de sucesso
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    };

    const playErrorSound = () => {
        // Opcional: adicionar áudio de erro
        const audio = new Audio('/sounds/error.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    };

    const getStatusIcon = (status: ScanHistory['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'duplicate':
                return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-600" />;
        }
    };

    const getStatusColor = (status: ScanHistory['status']) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'duplicate':
                return 'bg-yellow-50 border-yellow-200';
            case 'error':
                return 'bg-red-50 border-red-200';
        }
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d] mx-auto mb-4" />
                        <p className="text-gray-600">Carregando scanner...</p>
                    </div>
                </div>
            </EventsLayout>
        );
    }

    if (!event) return null;

    return (
        <EventsLayout>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        onClick={() => navigate(`/eventos/${eventId}/gerenciar`)}
                        variant="outline"
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para Gerenciar
                    </Button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <QrCode className="h-8 w-8 text-[#ff914d]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[#191919]">
                                Check-in <span className="text-[#ff914d]">via QR Code</span>
                            </h1>
                            <p className="text-gray-600">{event.title}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Estatísticas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="h-8 w-8 opacity-80" />
                            <span className="text-3xl font-bold">{stats.total}</span>
                        </div>
                        <p className="font-semibold">Total de Ingressos</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="h-8 w-8 opacity-80" />
                            <span className="text-3xl font-bold">{stats.validated}</span>
                        </div>
                        <p className="font-semibold">Check-ins Realizados</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="h-8 w-8 opacity-80" />
                            <span className="text-3xl font-bold">{stats.pending}</span>
                        </div>
                        <p className="font-semibold">Aguardando Check-in</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Scanner */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                                <QrCode className="h-6 w-6 mr-3 text-[#ff914d]" />
                                Scanner de QR Code
                            </h2>
                            <QRScanner 
                                onScanSuccess={handleScanSuccess}
                                isProcessing={isProcessing}
                            />
                        </div>
                    </motion.div>

                    {/* Histórico */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                                <History className="h-6 w-6 mr-3 text-[#ff914d]" />
                                Histórico de Scans
                            </h2>

                            {scanHistory.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <p>Nenhum scan realizado ainda</p>
                                    <p className="text-sm mt-2">Os scans aparecerão aqui em tempo real</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {scanHistory.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className={`p-4 rounded-lg border ${getStatusColor(entry.status)}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getStatusIcon(entry.status)}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {entry.participantName}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {entry.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {entry.timestamp.toLocaleTimeString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </EventsLayout>
    );
}
