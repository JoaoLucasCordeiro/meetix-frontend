import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    Settings,
    Users,
    UserPlus,
    Trash2,
    Edit,
    Save,
    X,
    CheckCircle,
    Clock,
    Mail,
    Shield,
    ArrowLeft,
    IdCard,
    Loader2,
    Plus,
    Building2,
    Info,
    Camera,
    FileText,
    Calendar,
    Download,
    Receipt,
    DollarSign,
    QrCode,
    MessageSquare,
    Star,
    Award,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventsLayout from "@/components/layouts/EventsLayouts";
import ValidationModal from "@/components/ticket/ValidationModal";
import ConfirmationModal from "@/components/shared/all/ConfirmationModal";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI, participantsAPI, badgesAPI, ticketOrdersAPI, ticketsAPI, feedbackAPI, certificateAPI, couponAPI } from "@/lib/api";
import type { Event } from "@/types/event";
import type { EventParticipant } from "@/types/participant";
import type { ApiError } from "@/types/auth";
import type { Badge, BadgeRole, BadgeTemplate } from "@/types/badge";
import type { TicketOrder, EventTicket } from "@/types/ticket";
import type { Feedback, FeedbackStats } from "@/types/feedback";
import type { Certificate } from "@/types/certificate";
import type { Coupon } from "@/types/coupon";
import { Textarea } from "@/components/ui/textarea";

interface EventAdmin {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    invitedBy: string;
    invitedByName: string;
    invitedAt: string;
    accepted: boolean;
    acceptedAt: string | null;
}

export default function EventManagePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [event, setEvent] = useState<Event | null>(null);
    const [participants, setParticipants] = useState<EventParticipant[]>([]);
    const [admins, setAdmins] = useState<EventAdmin[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [badgeStats, setBadgeStats] = useState<{ generatedCount: number } | null>(null);
    const [orders, setOrders] = useState<TicketOrder[]>([]);
    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
    const [certificates, setCertificates] = useState<Map<string, Certificate>>(new Map());
    const [generatingCertificates, setGeneratingCertificates] = useState<Set<string>>(new Set());
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
    const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount: '',
        validDate: '',
        usageLimit: ''
    });
    const [isLoadingEvent, setIsLoadingEvent] = useState(true);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
    const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);
    const [isLoadingBadges, setIsLoadingBadges] = useState(true);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingEvent, setIsDeletingEvent] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    
    // Order validation states
    const [selectedOrder, setSelectedOrder] = useState<TicketOrder | null>(null);
    const [showValidationModal, setShowValidationModal] = useState(false);
    
    // Badge creation states
    const [showBadgeForm, setShowBadgeForm] = useState(false);
    const [isCreatingBadge, setIsCreatingBadge] = useState(false);
    const [isDownloadingBadge, setIsDownloadingBadge] = useState<string | null>(null);
    const [selectedParticipant, setSelectedParticipant] = useState<EventParticipant | null>(null);
    const [badgeForm, setBadgeForm] = useState({
        displayName: '',
        role: 'PARTICIPANT' as BadgeRole,
        template: 'MODERN_BLUE' as BadgeTemplate,
        company: '',
        additionalInfo: '',
        photoUrl: '',
    });

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        location: "",
        maxAttendees: "",
    });

    useEffect(() => {
        if (!isAuthenticated || !user) {
            toast.error('Você precisa estar logado');
            navigate('/login');
            return;
        }

        if (!id) {
            navigate('/eventos');
            return;
        }

        fetchEventData();
        fetchParticipants();
        fetchAdmins();
        fetchBadges();
        fetchBadgeStats();
        fetchOrders();
        fetchTickets();
        fetchFeedbacks();
        fetchFeedbackStats();
        fetchCoupons();
    }, [id, isAuthenticated, user]);

    const fetchEventData = async () => {
        if (!id) return;

        try {
            setIsLoadingEvent(true);
            const eventData = await eventsAPI.getEventById(id);
            setEvent(eventData);
            
            // Preencher formulário de edição
            setEditForm({
                title: eventData.title,
                description: eventData.description,
                location: eventData.location || "",
                maxAttendees: eventData.maxAttendees?.toString() || "",
            });
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar evento');
            navigate('/meus-eventos');
        } finally {
            setIsLoadingEvent(false);
        }
    };

    const fetchParticipants = async () => {
        if (!id) return;

        try {
            setIsLoadingParticipants(true);
            const data = await participantsAPI.getEventParticipants(id);
            setParticipants(data);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar participantes');
        } finally {
            setIsLoadingParticipants(false);
        }
    };

    const fetchAdmins = async () => {
        if (!id) return;

        try {
            setIsLoadingAdmins(true);
            // TODO: Implementar endpoint de admins
            // const data = await eventsAPI.getEventAdmins(id);
            // setAdmins(data);
            setAdmins([]);
        } catch (error) {
            console.error('Erro ao carregar admins:', error);
        } finally {
            setIsLoadingAdmins(false);
        }
    };

    const fetchBadges = async () => {
        if (!id) return;

        try {
            setIsLoadingBadges(true);
            const data = await badgesAPI.getEventBadges(id);
            setBadges(data);
        } catch (error) {
            console.error('Erro ao carregar crachás:', error);
            // Não mostrar toast de erro aqui para não ser intrusivo
        } finally {
            setIsLoadingBadges(false);
        }
    };

    const fetchBadgeStats = async () => {
        if (!id) return;

        try {
            const stats = await badgesAPI.getBadgeStats(id);
            setBadgeStats(stats);
        } catch (error) {
            console.error('Erro ao carregar estatísticas de crachás:', error);
        }
    };

    const fetchOrders = async () => {
        if (!id) return;

        try {
            setIsLoadingOrders(true);
            const data = await ticketOrdersAPI.getEventOrders(id);
            setOrders(data);
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
            // Não mostrar toast de erro aqui para não ser intrusivo
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchTickets = async () => {
        if (!id) return;

        try {
            const data = await ticketsAPI.getEventTickets(id);
            setTickets(data);
        } catch (error) {
            console.error('Erro ao carregar ingressos:', error);
            // Não mostrar toast de erro aqui para não ser intrusivo
        }
    };

    const fetchFeedbacks = async () => {
        if (!id) return;

        try {
            setIsLoadingFeedbacks(true);
            const data = await feedbackAPI.getEventFeedbacks(id);
            setFeedbacks(data);
        } catch (error) {
            console.error('Erro ao carregar feedbacks:', error);
            const apiError = error as ApiError;
            // Se erro 403, usuário não é organizador
            if (apiError.status === 403) {
                toast.error('Apenas o organizador pode ver os feedbacks deste evento');
            } else if (apiError.status === 500) {
                console.warn('⚠️ Endpoint de feedbacks ainda não implementado no backend');
            }
            setFeedbacks([]); // Array vazio em caso de erro
        } finally {
            setIsLoadingFeedbacks(false);
        }
    };

    const fetchFeedbackStats = async () => {
        if (!id) return;

        try {
            const data = await feedbackAPI.getFeedbackStats(id);
            setFeedbackStats(data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas de feedbacks:', error);
            // Setar stats padrão em caso de erro (compatível com novo formato do backend)
            setFeedbackStats({
                total: 0,
                averageRating: 0,
                rating1: 0,
                rating2: 0,
                rating3: 0,
                rating4: 0,
                rating5: 0
            });
        }
    };

    const fetchCoupons = async () => {
        if (!id) return;

        try {
            setIsLoadingCoupons(true);
            const data = await couponAPI.getValidCoupons(id);
            setCoupons(data);
        } catch (error) {
            console.error('Erro ao carregar cupons:', error);
        } finally {
            setIsLoadingCoupons(false);
        }
    };

    const handleCreateCoupon = async () => {
        if (!id) return;

        // Validações
        if (!newCoupon.code.trim()) {
            toast.error('Digite o código do cupom');
            return;
        }

        const discount = parseInt(newCoupon.discount);
        if (isNaN(discount) || discount < 1 || discount > 100) {
            toast.error('Desconto deve ser entre 1% e 100%');
            return;
        }

        if (!newCoupon.validDate) {
            toast.error('Selecione a data de validade');
            return;
        }

        try {
            setIsCreatingCoupon(true);

            // Converter data para timestamp
            const validTimestamp = new Date(newCoupon.validDate).getTime();

            const couponData = {
                code: newCoupon.code.trim().toUpperCase(),
                discount: discount,
                valid: validTimestamp,
                usageLimit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : undefined,
            };

            await couponAPI.createCoupon(id, couponData);
            
            toast.success('Cupom criado com sucesso!');
            setNewCoupon({ code: '', discount: '', validDate: '', usageLimit: '' });
            fetchCoupons(); // Recarregar lista
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao criar cupom');
        } finally {
            setIsCreatingCoupon(false);
        }
    };

    const handleGenerateCertificate = async (participantId: string) => {
        try {
            setGeneratingCertificates(prev => new Set(prev).add(participantId));
            
            const certificate = await certificateAPI.generateCertificate(participantId);
            
            setCertificates(prev => new Map(prev).set(participantId, certificate));
            toast.success('Certificado gerado com sucesso!');
        } catch (error) {
            const apiError = error as ApiError;
            
            if (apiError.status === 409) {
                toast.error('Certificado já foi gerado para este participante');
            } else if (apiError.status === 400) {
                toast.error('Participante não atende aos requisitos para certificado');
            } else {
                toast.error(apiError.message || 'Erro ao gerar certificado');
            }
        } finally {
            setGeneratingCertificates(prev => {
                const newSet = new Set(prev);
                newSet.delete(participantId);
                return newSet;
            });
        }
    };

    const handleDownloadCertificate = async (validationCode: string, participantName: string) => {
        try {
            const blob = await certificateAPI.downloadCertificate(validationCode);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificado-${participantName.replace(/\s+/g, '-')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Certificado baixado com sucesso!');
        } catch (error) {
            console.error('Erro ao baixar certificado:', error);
            toast.error('Erro ao baixar certificado');
        }
    };

    const handleOrderValidation = () => {
        // Atualizar lista após validação
        fetchOrders();
        fetchTickets(); // Atualizar tickets também
        setShowValidationModal(false);
        setSelectedOrder(null);
    };

    const handleValidateOrder = async (approved: boolean, rejectionReason?: string, notes?: string) => {
        if (!selectedOrder) return;

        try {
            await ticketOrdersAPI.validateOrder(selectedOrder.orderId, {
                approved,
                rejectionReason,
                notes
            });
            
            toast.success(approved ? 'Pedido aprovado!' : 'Pedido rejeitado');
            handleOrderValidation();
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao validar pedido');
            throw error; // Re-throw para o modal tratar o loading
        }
    };

    const handleDownloadBadge = async (badgeId: string) => {
        try {
            setIsDownloadingBadge(badgeId);
            
            // Find badge to check if it needs to be generated
            const badge = badges.find(b => b.badgeId === badgeId);
            
            console.log('Badge data:', badge);
            console.log('Badge ID:', badgeId);
            console.log('Badge generated status:', badge?.generated);
            
            // Generate badge if not already generated
            if (badge && !badge.generated) {
                console.log('Generating badge...');
                try {
                    await badgesAPI.generateBadge(badgeId);
                    console.log('Badge generated successfully');
                    // Refresh badges list to update generated status
                    await fetchBadges();
                    await fetchBadgeStats();
                } catch (genError) {
                    console.error('Error generating badge:', genError);
                    const apiError = genError as ApiError;
                    toast.error(`Erro ao gerar crachá: ${apiError.message}`);
                    return;
                }
            }
            
            console.log('Downloading badge PDF...');
            const blob = await badgesAPI.downloadBadgePDF(badgeId);
            console.log('PDF blob received, size:', blob.size);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = badge ? `cracha_${badge.displayName.replace(/\s/g, '_')}.pdf` : `cracha-${badgeId}.pdf`;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Crachá baixado com sucesso!');
        } catch (error) {
            console.error('Error downloading badge:', error);
            const apiError = error as ApiError;
            
            // Show more helpful error message for 500 errors
            if (apiError.status === 500) {
                toast.error('Erro ao gerar PDF do crachá. Verifique se o backend está funcionando corretamente.', {
                    autoClose: 5000,
                });
            } else {
                toast.error(apiError.message || 'Erro ao baixar crachá');
            }
        } finally {
            setIsDownloadingBadge(null);
        }
    };

    const handleSaveChanges = async () => {
        if (!id || !event) return;

        if (!editForm.title.trim()) {
            toast.error('O título não pode estar vazio');
            return;
        }

        if (!editForm.maxAttendees || parseInt(editForm.maxAttendees) < participants.length) {
            toast.error(`O número máximo de participantes não pode ser menor que ${participants.length} (inscritos atuais)`);
            return;
        }

        try {
            setIsSaving(true);
            
            const updateData = {
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                location: editForm.location.trim(),
                maxAttendees: parseInt(editForm.maxAttendees),
            };

            await eventsAPI.updateEvent(id, updateData);
            
            toast.success('Evento atualizado com sucesso!');
            setIsEditing(false);
            fetchEventData();
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao atualizar evento');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!id || !event) return;

        setIsDeletingEvent(true);

        try {
            await eventsAPI.deleteEvent(id);
            toast.success('Evento deletado com sucesso');
            setShowDeleteModal(false);
            navigate('/meus-eventos');
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao deletar evento');
        } finally {
            setIsDeletingEvent(false);
        }
    };

    const handleInviteAdmin = async () => {
        if (!id) return;

        if (!inviteEmail.trim()) {
            toast.error('Digite um e-mail válido');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            toast.error('Digite um e-mail válido');
            return;
        }

        try {
            setIsSendingInvite(true);
            // TODO: Implementar endpoint de convite
            // await eventsAPI.inviteAdmin(id, inviteEmail);
            toast.success('Convite enviado com sucesso!');
            setInviteEmail("");
            fetchAdmins();
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao enviar convite');
        } finally {
            setIsSendingInvite(false);
        }
    };

    if (isLoadingEvent) {
        return (
            <EventsLayout>
                <div className="container mx-auto px-6 py-12 max-w-6xl">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                    </div>
                </div>
            </EventsLayout>
        );
    }

    if (!event) {
        return null;
    }

    // Verificar se o usuário é o organizador
    const isOrganizer = event.organizer?.id === user?.id;

    if (!isOrganizer) {
        toast.error('Você não tem permissão para gerenciar este evento');
        navigate(`/eventos/${id}`);
        return null;
    }

    return (
        <EventsLayout>
            <div className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/eventos/${id}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para o Evento
                    </Button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <Settings className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Gerenciar <span className="text-[#ff914d]">Evento</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        {event.title}
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">{participants.length}</p>
                                <p className="text-sm opacity-90">/{event.maxAttendees}</p>
                            </div>
                        </div>
                        <p className="font-semibold">Participantes</p>
                        <p className="text-sm opacity-90">Inscritos no evento</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#ff914d] to-[#ff7b33] rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Shield className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">{admins.length}</p>
                                <p className="text-sm opacity-90">admins</p>
                            </div>
                        </div>
                        <p className="font-semibold">Administradores</p>
                        <p className="text-sm opacity-90">Gerenciando o evento</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">
                                    {participants.filter(p => p.attended).length}
                                </p>
                                <p className="text-sm opacity-90">check-ins</p>
                            </div>
                        </div>
                        <p className="font-semibold">Presenças</p>
                        <p className="text-sm opacity-90">Confirmadas no evento</p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className="grid w-full grid-cols-9 h-14 bg-gray-100 rounded-xl p-1 mb-8">
                            <TabsTrigger 
                                value="details" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Edit className="h-5 w-5 mr-2" />
                                Detalhes
                            </TabsTrigger>
                            <TabsTrigger 
                                value="participants" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Users className="h-5 w-5 mr-2" />
                                Participantes
                            </TabsTrigger>
                            <TabsTrigger 
                                value="badges" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <IdCard className="h-5 w-5 mr-2" />
                                Crachás
                            </TabsTrigger>
                            <TabsTrigger 
                                value="checkins" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <QrCode className="h-5 w-5 mr-2" />
                                Check-ins
                            </TabsTrigger>
                            <TabsTrigger 
                                value="certificates" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Award className="h-5 w-5 mr-2" />
                                Certificados
                            </TabsTrigger>
                            <TabsTrigger 
                                value="coupons" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Tag className="h-5 w-5 mr-2" />
                                Cupons
                            </TabsTrigger>
                            <TabsTrigger 
                                value="feedbacks" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Feedbacks
                            </TabsTrigger>
                            <TabsTrigger 
                                value="orders" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Receipt className="h-5 w-5 mr-2" />
                                Pedidos
                            </TabsTrigger>
                            <TabsTrigger 
                                value="admins" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Shield className="h-5 w-5 mr-2" />
                                Admins
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: Detalhes do Evento */}
                        <TabsContent value="details">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-[#191919]">
                                        Informações do Evento
                                    </h2>
                                    {!isEditing ? (
                                        <Button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditForm({
                                                        title: event.title,
                                                        description: event.description,
                                                        location: event.location || "",
                                                        maxAttendees: event.maxAttendees?.toString() || "",
                                                    });
                                                }}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleSaveChanges}
                                                disabled={isSaving}
                                                className="bg-green-500 hover:bg-green-600"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Salvar
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[#191919] font-semibold">Título</Label>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="h-12 rounded-xl"
                                            />
                                        ) : (
                                            <p className="text-[#191919]/70 p-3 bg-gray-50 rounded-xl">{event.title}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[#191919] font-semibold">Descrição</Label>
                                        {isEditing ? (
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full min-h-32 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#ff914d] focus:border-transparent resize-none"
                                            />
                                        ) : (
                                            <p className="text-[#191919]/70 p-3 bg-gray-50 rounded-xl whitespace-pre-wrap">{event.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[#191919] font-semibold">Local</Label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.location}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                                    className="h-12 rounded-xl"
                                                />
                                            ) : (
                                                <p className="text-[#191919]/70 p-3 bg-gray-50 rounded-xl">{event.location || 'Não informado'}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#191919] font-semibold">Máximo de Participantes</Label>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    min={participants.length}
                                                    value={editForm.maxAttendees}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, maxAttendees: e.target.value }))}
                                                    className="h-12 rounded-xl"
                                                />
                                            ) : (
                                                <p className="text-[#191919]/70 p-3 bg-gray-50 rounded-xl">{event.maxAttendees}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="mt-8 pt-8 border-t border-gray-200">
                                    <h3 className="text-xl font-bold text-red-600 mb-4">Zona de Perigo</h3>
                                    <p className="text-[#191919]/70 mb-4">
                                        Deletar este evento removerá permanentemente todos os dados, incluindo participantes e inscrições.
                                    </p>
                                    <Button
                                        onClick={() => setShowDeleteModal(true)}
                                        variant="outline"
                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Deletar Evento
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Participantes */}
                        <TabsContent value="participants">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-[#191919] mb-6">
                                    Lista de Participantes
                                </h2>

                                {isLoadingParticipants ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                                    </div>
                                ) : participants.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-semibold text-[#191919]">Nenhum participante ainda</p>
                                        <p className="text-[#191919]/70">Aguarde as primeiras inscrições</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {participants.map((participant) => (
                                            <div
                                                key={participant.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#ff914d]/10 rounded-full flex items-center justify-center">
                                                        <Users className="h-6 w-6 text-[#ff914d]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#191919]">
                                                            {participant.participant.firstName} {participant.participant.lastName}
                                                        </p>
                                                        <p className="text-sm text-[#191919]/60">
                                                            {participant.participant.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {participant.attended ? (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span className="text-sm font-semibold">Presente</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <Clock className="h-5 w-5" />
                                                            <span className="text-sm font-semibold">Inscrito</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Crachás */}
                        <TabsContent value="badges">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-[#191919]">
                                        Gerenciar Crachás
                                    </h2>
                                    {participants.length > 0 && (
                                        <Button
                                            onClick={() => {
                                                setShowBadgeForm(!showBadgeForm);
                                                if (!showBadgeForm) {
                                                    setSelectedParticipant(null);
                                                    setBadgeForm({
                                                        displayName: '',
                                                        role: 'PARTICIPANT',
                                                        template: 'MODERN_BLUE',
                                                        company: '',
                                                        additionalInfo: '',
                                                        photoUrl: '',
                                                    });
                                                }
                                            }}
                                            className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                        >
                                            {showBadgeForm ? (
                                                <>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancelar
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Criar Crachá
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                {/* Badge Stats Card */}
                                {badgeStats && (
                                    <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-purple-500 rounded-lg">
                                                    <IdCard className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                                                        Total de Crachás Gerados
                                                    </h3>
                                                    <p className="text-3xl font-bold text-purple-700">
                                                        {badgeStats.generatedCount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Badge Creation Form */}
                                {showBadgeForm && (
                                    <div className="mb-8 p-6 bg-[#ff914d]/10 rounded-xl border border-[#ff914d]/30">
                                        <h3 className="text-lg font-semibold text-[#191919] mb-4 flex items-center">
                                            <IdCard className="h-5 w-5 mr-2 text-[#ff914d]" />
                                            Criar Novo Crachá
                                        </h3>

                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            
                                            if (!selectedParticipant) {
                                                toast.error('Selecione um participante');
                                                return;
                                            }

                                            if (!badgeForm.displayName.trim()) {
                                                toast.error('Nome de exibição é obrigatório');
                                                return;
                                            }

                                            try {
                                                setIsCreatingBadge(true);
                                                
                                                const badgeData = {
                                                    userId: selectedParticipant.participant.id,
                                                    displayName: badgeForm.displayName,
                                                    role: badgeForm.role,
                                                    template: badgeForm.template,
                                                    ...(badgeForm.company && { company: badgeForm.company }),
                                                    ...(badgeForm.additionalInfo && { additionalInfo: badgeForm.additionalInfo }),
                                                    ...(badgeForm.photoUrl && { photoUrl: badgeForm.photoUrl }),
                                                };

                                                await badgesAPI.createBadge(id!, badgeData);
                                                toast.success('Crachá criado com sucesso!');
                                                
                                                // Refresh badges list
                                                await fetchBadges();
                                                await fetchBadgeStats();
                                                
                                                // Reset form
                                                setShowBadgeForm(false);
                                                setSelectedParticipant(null);
                                                setBadgeForm({
                                                    displayName: '',
                                                    role: 'PARTICIPANT',
                                                    template: 'MODERN_BLUE',
                                                    company: '',
                                                    additionalInfo: '',
                                                    photoUrl: '',
                                                });
                                            } catch (error) {
                                                const apiError = error as ApiError;
                                                toast.error(apiError.message || 'Erro ao criar crachá');
                                            } finally {
                                                setIsCreatingBadge(false);
                                            }
                                        }} className="space-y-4">
                                            {/* Select Participant */}
                                            <div>
                                                <Label className="flex items-center gap-2 mb-2">
                                                    <Users className="h-4 w-4" />
                                                    Selecionar Participante *
                                                </Label>
                                                <select
                                                    value={selectedParticipant?.id || ''}
                                                    onChange={(e) => {
                                                        const participant = participants.find(p => p.id === e.target.value);
                                                        setSelectedParticipant(participant || null);
                                                        if (participant) {
                                                            setBadgeForm(prev => ({
                                                                ...prev,
                                                                displayName: `${participant.participant.firstName} ${participant.participant.lastName}`,
                                                            }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                                    required
                                                    disabled={participants.length === 0}
                                                >
                                                    <option value="">
                                                        {participants.length === 0 
                                                            ? "Nenhum participante inscrito no evento" 
                                                            : "Selecione um participante..."}
                                                    </option>
                                                    {participants.map((participant) => (
                                                        <option key={participant.id} value={participant.id}>
                                                            {participant.participant.firstName} {participant.participant.lastName} ({participant.participant.email})
                                                        </option>
                                                    ))}
                                                </select>
                                                {participants.length === 0 && (
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Aguardando participantes se inscreverem no evento
                                                    </p>
                                                )}
                                            </div>

                                            {/* Display Name */}
                                            <div>
                                                <Label htmlFor="displayName" className="flex items-center gap-2 mb-2">
                                                    <IdCard className="h-4 w-4" />
                                                    Nome de Exibição *
                                                </Label>
                                                <Input
                                                    id="displayName"
                                                    value={badgeForm.displayName}
                                                    onChange={(e) => setBadgeForm(prev => ({ ...prev, displayName: e.target.value }))}
                                                    placeholder="Como o nome aparecerá no crachá"
                                                    maxLength={100}
                                                    required
                                                />
                                            </div>

                                            {/* Role */}
                                            <div>
                                                <Label htmlFor="role" className="flex items-center gap-2 mb-2">
                                                    <Shield className="h-4 w-4" />
                                                    Função *
                                                </Label>
                                                <select
                                                    id="role"
                                                    value={badgeForm.role}
                                                    onChange={(e) => setBadgeForm(prev => ({ ...prev, role: e.target.value as BadgeRole }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                                >
                                                    <option value="PARTICIPANT">Participante</option>
                                                    <option value="SPEAKER">Palestrante</option>
                                                    <option value="VOLUNTEER">Voluntário</option>
                                                    <option value="VIP">VIP</option>
                                                    <option value="STAFF">Equipe</option>
                                                    <option value="ORGANIZER">Organizador</option>
                                                    <option value="ADMIN">Administrador</option>
                                                </select>
                                            </div>

                                            {/* Template */}
                                            <div>
                                                <Label htmlFor="template" className="flex items-center gap-2 mb-2">
                                                    <Camera className="h-4 w-4" />
                                                    Template de Design
                                                </Label>
                                                <select
                                                    id="template"
                                                    value={badgeForm.template}
                                                    onChange={(e) => setBadgeForm(prev => ({ ...prev, template: e.target.value as BadgeTemplate }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                                >
                                                    <option value="MODERN_BLUE">Moderno Azul</option>
                                                    <option value="ELEGANT_BLACK">Elegante Preto</option>
                                                    <option value="MINIMALIST">Minimalista</option>
                                                    <option value="COLORFUL">Colorido</option>
                                                    <option value="CORPORATE">Corporativo</option>
                                                </select>
                                            </div>

                                            {/* Company */}
                                            <div>
                                                <Label htmlFor="company" className="flex items-center gap-2 mb-2">
                                                    <Building2 className="h-4 w-4" />
                                                    Empresa/Instituição
                                                </Label>
                                                <Input
                                                    id="company"
                                                    value={badgeForm.company}
                                                    onChange={(e) => setBadgeForm(prev => ({ ...prev, company: e.target.value }))}
                                                    placeholder="Ex: Universidade Federal de Pernambuco"
                                                    maxLength={100}
                                                />
                                            </div>

                                            {/* Additional Info */}
                                            <div>
                                                <Label htmlFor="additionalInfo" className="flex items-center gap-2 mb-2">
                                                    <Info className="h-4 w-4" />
                                                    Informações Adicionais
                                                </Label>
                                                <Textarea
                                                    id="additionalInfo"
                                                    value={badgeForm.additionalInfo}
                                                    onChange={(e) => setBadgeForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                                                    placeholder="Ex: Desenvolvedor Backend, Ciência da Computação"
                                                    maxLength={500}
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Photo URL */}
                                            <div>
                                                <Label htmlFor="photoUrl" className="flex items-center gap-2 mb-2">
                                                    <Camera className="h-4 w-4" />
                                                    URL da Foto (Opcional)
                                                </Label>
                                                <Input
                                                    id="photoUrl"
                                                    value={badgeForm.photoUrl}
                                                    onChange={(e) => setBadgeForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                                                    placeholder="https://exemplo.com/foto.jpg"
                                                    type="url"
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                disabled={isCreatingBadge}
                                                className="w-full bg-[#ff914d] hover:bg-[#ff7b33]"
                                            >
                                                {isCreatingBadge ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                        Criando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <IdCard className="mr-2 h-5 w-5" />
                                                        Criar Crachá
                                                    </>
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                )}

                                {/* Info Box */}
                                <div className="mb-6 bg-[#ff914d]/10 border border-[#ff914d]/30 rounded-xl p-4">
                                    <h3 className="font-semibold text-[#191919] mb-2 flex items-center gap-2">
                                        <Info className="h-5 w-5 text-[#ff914d]" />
                                        Sobre os Crachás
                                    </h3>
                                    <ul className="text-sm text-[#191919]/70 space-y-1">
                                        <li>• Crie crachás personalizados para os participantes do evento</li>
                                        <li>• Os crachás serão gerados em formato PDF</li>
                                        <li>• Selecione o participante, personalize as informações e escolha um template</li>
                                        <li>• O organizador pode criar crachás para qualquer participante inscrito</li>
                                    </ul>
                                </div>

                                {/* Badges List or Empty State */}
                                {isLoadingBadges ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                                    </div>
                                ) : participants.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-semibold text-[#191919]">Nenhum participante inscrito</p>
                                        <p className="text-[#191919]/70 mb-4">
                                            Aguarde participantes se inscreverem no evento para criar crachás
                                        </p>
                                        <Button
                                            onClick={() => navigate(`/eventos/${id}`)}
                                            variant="outline"
                                            className="border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10"
                                        >
                                            Ver Página do Evento
                                        </Button>
                                    </div>
                                ) : badges.length === 0 ? (
                                    <div className="text-center py-12">
                                        <IdCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-semibold text-[#191919]">Nenhum crachá criado ainda</p>
                                        <p className="text-[#191919]/70 mb-4">
                                            Clique em "Criar Crachá" para gerar crachás para os participantes
                                        </p>
                                        <p className="text-sm text-[#191919]/60">
                                            {participants.length} {participants.length === 1 ? 'participante inscrito' : 'participantes inscritos'}
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-[#191919]">
                                                Crachás Criados ({badges.length})
                                            </h3>
                                        </div>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {badges.map((badge) => (
                                                <div 
                                                    key={badge.badgeId}
                                                    className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-full bg-[#ff914d]/10 flex items-center justify-center">
                                                                <IdCard className="h-6 w-6 text-[#ff914d]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-[#191919]">{badge.displayName}</h4>
                                                                <p className="text-sm text-[#191919]/60">
                                                                    {badge.role === 'ORGANIZER' && 'Organizador'}
                                                                    {badge.role === 'ADMIN' && 'Administrador'}
                                                                    {badge.role === 'PARTICIPANT' && 'Participante'}
                                                                    {badge.role === 'SPEAKER' && 'Palestrante'}
                                                                    {badge.role === 'VOLUNTEER' && 'Voluntário'}
                                                                    {badge.role === 'VIP' && 'VIP'}
                                                                    {badge.role === 'STAFF' && 'Staff'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {badge.generated && (
                                                            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                                <CheckCircle className="h-3.5 w-3.5" />
                                                                <span>Gerado</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center gap-2 text-sm text-[#191919]/70">
                                                            <FileText className="h-4 w-4" />
                                                            <span>Template: {badge.template}</span>
                                                        </div>
                                                        {badge.company && (
                                                            <div className="flex items-center gap-2 text-sm text-[#191919]/70">
                                                                <Building2 className="h-4 w-4" />
                                                                <span>{badge.company}</span>
                                                            </div>
                                                        )}
                                                        {badge.additionalInfo && (
                                                            <div className="flex items-start gap-2 text-sm text-[#191919]/70">
                                                                <Info className="h-4 w-4 mt-0.5" />
                                                                <span className="line-clamp-2">{badge.additionalInfo}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-xs text-[#191919]/50">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>Criado em {new Date(badge.createdAt).toLocaleDateString('pt-BR', { 
                                                                day: '2-digit', 
                                                                month: 'short', 
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}</span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleDownloadBadge(badge.badgeId)}
                                                        disabled={isDownloadingBadge === badge.badgeId}
                                                        className="w-full bg-[#ff914d] hover:bg-[#ff7b33]"
                                                        size="sm"
                                                    >
                                                        {isDownloadingBadge === badge.badgeId ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                {badge.generated ? 'Baixando...' : 'Gerando e baixando...'}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Baixar PDF
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Pedidos (Orders) */}
                        <TabsContent value="orders">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-[#191919] mb-2">
                                            Pedidos de Ingressos
                                        </h2>
                                        <p className="text-[#191919]/60">
                                            Valide pagamentos para aprovar ou rejeitar pedidos
                                        </p>
                                    </div>
                                    <Button
                                        onClick={fetchOrders}
                                        variant="outline"
                                    >
                                        <Loader2 className={`h-4 w-4 mr-2 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                                        Atualizar
                                    </Button>
                                </div>

                                {isLoadingOrders ? (
                                    <div className="flex justify-center items-center py-20">
                                        <div className="text-center">
                                            <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mx-auto mb-4" />
                                            <p className="text-[#191919]/70">Carregando pedidos...</p>
                                        </div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                                        <Receipt className="h-16 w-16 text-[#191919]/30 mx-auto mb-4" />
                                        <p className="text-[#191919]/60 text-lg">
                                            Nenhum pedido ainda
                                        </p>
                                        <p className="text-[#191919]/40 text-sm mt-2">
                                            Pedidos de ingressos aparecerão aqui
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Filter tabs */}
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="data-[active=true]:bg-yellow-100 data-[active=true]:text-yellow-700 data-[active=true]:border-yellow-300"
                                            >
                                                Pendentes ({orders.filter(o => o.orderStatus === 'AWAITING_VALIDATION').length})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="data-[active=true]:bg-green-100 data-[active=true]:text-green-700 data-[active=true]:border-green-300"
                                            >
                                                Aprovados ({orders.filter(o => o.orderStatus === 'APPROVED').length})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="data-[active=true]:bg-red-100 data-[active=true]:text-red-700 data-[active=true]:border-red-300"
                                            >
                                                Rejeitados ({orders.filter(o => o.orderStatus === 'REJECTED').length})
                                            </Button>
                                        </div>

                                        {/* Orders awaiting validation */}
                                        {orders.filter(o => o.orderStatus === 'AWAITING_VALIDATION').length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#191919] mb-4 flex items-center">
                                                    <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                                                    Aguardando Validação ({orders.filter(o => o.orderStatus === 'AWAITING_VALIDATION').length})
                                                </h3>
                                                <div className="space-y-4">
                                                    {orders
                                                        .filter(o => o.orderStatus === 'AWAITING_VALIDATION')
                                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                        .map(order => (
                                                            <div
                                                                key={order.orderId}
                                                                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                                                            >
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-3 mb-2">
                                                                            <span className="font-bold text-lg text-[#191919]">
                                                                                Pedido #{order.orderId}
                                                                            </span>
                                                                            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">
                                                                                Aguardando
                                                                            </span>
                                                                        </div>
                                                                        <div className="space-y-1 text-sm text-[#191919]/70">
                                                                            <div className="flex items-center gap-2">
                                                                                <Mail className="h-4 w-4" />
                                                                                <span>{order.userName}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <DollarSign className="h-4 w-4" />
                                                                                <span className="font-semibold text-[#191919]">
                                                                                    R$ {order.amount.toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Calendar className="h-4 w-4" />
                                                                                <span>
                                                                                    {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        onClick={() => {
                                                                            setSelectedOrder(order);
                                                                            setShowValidationModal(true);
                                                                        }}
                                                                        className="bg-[#ff914d] hover:bg-[#ff7b33] shrink-0"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                                        Validar
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* All orders list */}
                                        <div className="border-t border-gray-200 pt-6">
                                            <h3 className="text-lg font-semibold text-[#191919] mb-4">
                                                Todos os Pedidos ({orders.length})
                                            </h3>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#191919]/70 uppercase">ID</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#191919]/70 uppercase">Usuário</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#191919]/70 uppercase">Valor</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#191919]/70 uppercase">Status</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#191919]/70 uppercase">Data</th>
                                                            <th className="px-4 py-3 text-left text-xs font-semibold text-[#191919]/70 uppercase">Ações</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {orders
                                                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                            .map(order => (
                                                                <tr key={order.orderId} className="hover:bg-gray-50">
                                                                    <td className="px-4 py-3 text-sm font-medium text-[#191919]">
                                                                        #{order.orderId}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-[#191919]/70">
                                                                        {order.userName}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-semibold text-[#191919]">
                                                                        R$ {order.amount.toFixed(2)}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                                            order.orderStatus === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                                                                            order.orderStatus === 'AWAITING_VALIDATION' ? 'bg-blue-100 text-blue-700' :
                                                                            order.orderStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                                            order.orderStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                            'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                            {order.orderStatus === 'PENDING_PAYMENT' ? 'Pagamento Pendente' :
                                                                             order.orderStatus === 'AWAITING_VALIDATION' ? 'Aguardando' :
                                                                             order.orderStatus === 'APPROVED' ? 'Aprovado' :
                                                                             order.orderStatus === 'REJECTED' ? 'Rejeitado' :
                                                                             'Cancelado'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm text-[#191919]/70">
                                                                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm">
                                                                        {order.orderStatus === 'AWAITING_VALIDATION' && (
                                                                            <Button
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setSelectedOrder(order);
                                                                                    setShowValidationModal(true);
                                                                                }}
                                                                                className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                                                            >
                                                                                Validar
                                                                            </Button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Check-ins */}
                        <TabsContent value="checkins">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-[#191919]">
                                        Validações de Check-in
                                    </h2>
                                    <Button
                                        onClick={() => navigate(`/eventos/${id}/check-in`)}
                                        className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                    >
                                        <QrCode className="h-5 w-5 mr-2" />
                                        Abrir Scanner
                                    </Button>
                                </div>

                                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 mb-1">Total de Ingressos</p>
                                                <p className="text-3xl font-bold text-blue-900">
                                                    {tickets.length}
                                                </p>
                                            </div>
                                            <Users className="h-10 w-10 text-blue-400" />
                                        </div>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-600 mb-1">Check-ins Realizados</p>
                                                <p className="text-3xl font-bold text-green-900">
                                                    {tickets.filter(t => t.ticketStatus === 'USED').length}
                                                </p>
                                            </div>
                                            <CheckCircle className="h-10 w-10 text-green-400" />
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-orange-600 mb-1">Aguardando</p>
                                                <p className="text-3xl font-bold text-orange-900">
                                                    {tickets.filter(t => t.ticketStatus === 'VALID').length}
                                                </p>
                                            </div>
                                            <Clock className="h-10 w-10 text-orange-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de Ingressos */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-[#191919]">
                                            Lista de Ingressos ({tickets.length})
                                        </h3>
                                    </div>

                                    {tickets.length === 0 ? (
                                        <div className="text-center py-12 text-gray-400">
                                            <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                            <p className="text-lg font-semibold mb-2">Nenhum ingresso emitido</p>
                                            <p className="text-sm">Os ingressos aprovados aparecerão aqui</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {tickets
                                                .sort((a, b) => {
                                                    // USED primeiro, depois VALID, depois CANCELLED
                                                    const statusOrder = { USED: 0, VALID: 1, CANCELLED: 2 };
                                                    return (statusOrder[a.ticketStatus] || 99) - (statusOrder[b.ticketStatus] || 99);
                                                })
                                                .map((ticket) => (
                                                    <div
                                                        key={ticket.ticketId}
                                                        className={`p-4 rounded-lg border-2 ${
                                                            ticket.ticketStatus === 'USED'
                                                                ? 'bg-green-50 border-green-200'
                                                                : ticket.ticketStatus === 'VALID'
                                                                ? 'bg-blue-50 border-blue-200'
                                                                : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                {ticket.ticketStatus === 'USED' ? (
                                                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                                                ) : ticket.ticketStatus === 'VALID' ? (
                                                                    <Clock className="h-6 w-6 text-blue-600" />
                                                                ) : (
                                                                    <X className="h-6 w-6 text-gray-600" />
                                                                )}
                                                                
                                                                <div>
                                                                    <p className="font-semibold text-gray-900">
                                                                        {ticket.userName}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600">
                                                                        {ticket.ticketStatus === 'USED'
                                                                            ? `Check-in: ${ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString('pt-BR') : 'Realizado'}`
                                                                            : ticket.ticketStatus === 'VALID'
                                                                            ? 'Aguardando check-in'
                                                                            : 'Ingresso cancelado'
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <span
                                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                        ticket.ticketStatus === 'USED'
                                                                            ? 'bg-green-200 text-green-800'
                                                                            : ticket.ticketStatus === 'VALID'
                                                                            ? 'bg-blue-200 text-blue-800'
                                                                            : 'bg-gray-200 text-gray-800'
                                                                    }`}
                                                                >
                                                                    {ticket.ticketStatus === 'USED'
                                                                        ? 'VALIDADO'
                                                                        : ticket.ticketStatus === 'VALID'
                                                                        ? 'VÁLIDO'
                                                                        : 'CANCELADO'
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Certificados */}
                        <TabsContent value="certificates">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                                    <Award className="h-7 w-7 mr-3 text-[#ff914d]" />
                                    Certificados do Evento
                                </h2>

                                {/* Informações sobre certificados */}
                                {!event?.generateCertificate ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-yellow-900 mb-1">
                                                    Geração de Certificados Desabilitada
                                                </p>
                                                <p className="text-sm text-yellow-700">
                                                    Este evento não está configurado para gerar certificados automaticamente.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : new Date(event?.endDateTime || '') > new Date() ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-blue-900 mb-1">
                                                    Aguardando Término do Evento
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    Certificados só podem ser gerados após o evento terminar.
                                                    Data de término: {new Date(event?.endDateTime || '').toLocaleString('pt-BR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-green-900 mb-1">
                                                    Certificados Disponíveis para Geração
                                                </p>
                                                <p className="text-sm text-green-700">
                                                    Participantes que fizeram check-in podem gerar seus certificados.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Estatísticas de Certificados */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-blue-700 font-semibold">Participantes Elegíveis</span>
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <p className="text-3xl font-bold text-blue-900">
                                            {participants.filter(p => p.attended).length}
                                        </p>
                                        <p className="text-sm text-blue-600 mt-1">
                                            Fizeram check-in
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-green-700 font-semibold">Certificados Gerados</span>
                                            <Award className="h-6 w-6 text-green-600" />
                                        </div>
                                        <p className="text-3xl font-bold text-green-900">
                                            {certificates.size}
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">
                                            Disponíveis para download
                                        </p>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-purple-700 font-semibold">Pendentes</span>
                                            <Clock className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <p className="text-3xl font-bold text-purple-900">
                                            {participants.filter(p => p.attended).length - certificates.size}
                                        </p>
                                        <p className="text-sm text-purple-600 mt-1">
                                            Aguardando geração
                                        </p>
                                    </div>
                                </div>

                                {/* Lista de Participantes */}
                                {isLoadingParticipants ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                                    </div>
                                ) : participants.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-semibold text-[#191919]">Nenhum participante inscrito</p>
                                        <p className="text-[#191919]/70">Participantes inscritos aparecerão aqui</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#191919] mb-4">
                                            Todos os Participantes ({participants.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {participants.map((participant) => {
                                                const certificate = certificates.get(participant.id);
                                                const isGenerating = generatingCertificates.has(participant.id);
                                                const isEligible = participant.attended && 
                                                                  event?.generateCertificate && 
                                                                  new Date(event?.endDateTime || '') < new Date();

                                                return (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#ff914d]/30 transition-all"
                                                    >
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className="w-12 h-12 bg-gradient-to-br from-[#ff914d] to-[#ff7b33] rounded-full flex items-center justify-center">
                                                                <span className="text-white font-bold text-lg">
                                                                    {participant.participant.firstName.charAt(0).toUpperCase()}
                                                                    {participant.participant.lastName.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-[#191919]">
                                                                    {participant.participant.firstName} {participant.participant.lastName}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    {participant.participant.email}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {participant.attended ? (
                                                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                                                            ✓ Check-in realizado
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                                                            Sem check-in
                                                                        </span>
                                                                    )}
                                                                    {certificate && (
                                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                                            Certificado gerado
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Botões de Ação */}
                                                        <div className="flex items-center gap-2">
                                                            {certificate ? (
                                                                <Button
                                                                    onClick={() => handleDownloadCertificate(certificate.validationCode, `${participant.participant.firstName}-${participant.participant.lastName}`)}
                                                                    className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                                                    size="sm"
                                                                >
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Baixar PDF
                                                                </Button>
                                                            ) : isEligible ? (
                                                                <Button
                                                                    onClick={() => handleGenerateCertificate(participant.id)}
                                                                    disabled={isGenerating}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    size="sm"
                                                                >
                                                                    {isGenerating ? (
                                                                        <>
                                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                            Gerando...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Award className="h-4 w-4 mr-2" />
                                                                            Gerar Certificado
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    disabled
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-gray-400"
                                                                >
                                                                    {!participant.attended ? (
                                                                        'Sem check-in'
                                                                    ) : !event?.generateCertificate ? (
                                                                        'Certificados desabilitados'
                                                                    ) : (
                                                                        'Aguardando término'
                                                                    )}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Cupons */}
                        <TabsContent value="coupons">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                                    <Tag className="h-7 w-7 mr-3 text-[#ff914d]" />
                                    Cupons de Desconto
                                </h2>

                                {/* Verificar se evento é pago */}
                                {!event?.isPaid ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                        <div className="flex items-start gap-3">
                                            <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-yellow-900 mb-1">
                                                    Cupons Não Disponíveis
                                                </p>
                                                <p className="text-sm text-yellow-700">
                                                    Cupons de desconto só estão disponíveis para eventos pagos.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Formulário de Criar Cupom */}
                                        <div className="bg-gradient-to-br from-[#ff914d]/5 to-[#ff7b33]/5 rounded-xl p-6 mb-8 border border-[#ff914d]/20">
                                            <h3 className="text-lg font-semibold text-[#191919] mb-4 flex items-center gap-2">
                                                <Plus className="h-5 w-5 text-[#ff914d]" />
                                                Criar Novo Cupom
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <Label htmlFor="coupon-code">Código do Cupom *</Label>
                                                    <Input
                                                        id="coupon-code"
                                                        value={newCoupon.code}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                                        placeholder="Ex: DESCONTO20"
                                                        className="mt-1"
                                                        maxLength={50}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">3-50 caracteres, será convertido para maiúsculas</p>
                                                </div>

                                                <div>
                                                    <Label htmlFor="coupon-discount">Desconto (%) *</Label>
                                                    <Input
                                                        id="coupon-discount"
                                                        type="number"
                                                        min="1"
                                                        max="100"
                                                        value={newCoupon.discount}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                                                        placeholder="20"
                                                        className="mt-1"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Entre 1% e 100%</p>
                                                </div>

                                                <div>
                                                    <Label htmlFor="coupon-valid">Data de Validade *</Label>
                                                    <Input
                                                        id="coupon-valid"
                                                        type="datetime-local"
                                                        value={newCoupon.validDate}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, validDate: e.target.value })}
                                                        className="mt-1"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Cupom expira nesta data</p>
                                                </div>

                                                <div>
                                                    <Label htmlFor="coupon-limit">Limite de Uso (opcional)</Label>
                                                    <Input
                                                        id="coupon-limit"
                                                        type="number"
                                                        min="1"
                                                        value={newCoupon.usageLimit}
                                                        onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                                                        placeholder="50"
                                                        className="mt-1"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">Deixe vazio para ilimitado</p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={handleCreateCoupon}
                                                disabled={isCreatingCoupon}
                                                className="bg-[#ff914d] hover:bg-[#ff7b33] w-full md:w-auto"
                                            >
                                                {isCreatingCoupon ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Criando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Criar Cupom
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Lista de Cupons */}
                                        {isLoadingCoupons ? (
                                            <div className="flex justify-center py-12">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                                            </div>
                                        ) : coupons.length === 0 ? (
                                            <div className="text-center py-12">
                                                <Tag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                                <p className="text-xl font-semibold text-[#191919]">Nenhum cupom criado</p>
                                                <p className="text-[#191919]/70">Crie cupons de desconto para seus participantes</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#191919] mb-4">
                                                    Cupons Ativos ({coupons.length})
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {coupons.map((coupon) => {
                                                        const isExpired = new Date(coupon.valid) < new Date();
                                                        const isLimitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;
                                                        const isValid = !isExpired && !isLimitReached;

                                                        return (
                                                            <div
                                                                key={coupon.id}
                                                                className={`p-6 rounded-xl border-2 ${
                                                                    isValid 
                                                                        ? 'border-green-200 bg-green-50' 
                                                                        : 'border-gray-200 bg-gray-50 opacity-60'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Tag className={`h-5 w-5 ${isValid ? 'text-green-600' : 'text-gray-400'}`} />
                                                                        <span className="text-2xl font-bold text-[#191919]">
                                                                            {coupon.code}
                                                                        </span>
                                                                    </div>
                                                                    {isValid && (
                                                                        <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                                                            ATIVO
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm text-gray-600">Desconto:</span>
                                                                        <span className="text-lg font-bold text-[#ff914d]">
                                                                            {coupon.discount}%
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600">Válido até:</span>
                                                                        <span className={isExpired ? 'text-red-600 font-medium' : 'text-gray-900'}>
                                                                            {new Date(coupon.valid).toLocaleDateString('pt-BR')}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="text-gray-600">Usos:</span>
                                                                        <span className="text-gray-900 font-medium">
                                                                            {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}
                                                                        </span>
                                                                    </div>

                                                                    {isExpired && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                                            <span className="text-xs text-red-600 font-medium">
                                                                                ⚠️ Cupom expirado
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {isLimitReached && (
                                                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                                                            <span className="text-xs text-orange-600 font-medium">
                                                                                ⚠️ Limite de uso atingido
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Feedbacks */}
                        <TabsContent value="feedbacks">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                                    <MessageSquare className="h-7 w-7 mr-3 text-[#ff914d]" />
                                    Feedbacks do Evento
                                </h2>

                                {/* Estatísticas de Feedback */}
                                {feedbackStats && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {/* Total de Feedbacks */}
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-purple-700 font-semibold">Total de Feedbacks</span>
                                                <MessageSquare className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-purple-900">
                                                {feedbackStats.total || feedbackStats.totalFeedbacks || 0}
                                            </p>
                                        </div>

                                        {/* Média de Avaliação */}
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-yellow-700 font-semibold">Média de Avaliação</span>
                                                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                                            </div>
                                            <p className="text-3xl font-bold text-yellow-900">
                                                {(feedbackStats.averageRating ?? 0).toFixed(1)} / 5.0
                                            </p>
                                            <div className="flex gap-1 mt-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-5 w-5 ${
                                                            star <= Math.round(feedbackStats.averageRating ?? 0)
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-gray-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Distribuição de Avaliações */}
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-blue-700 font-semibold">Distribuição</span>
                                            </div>
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((stars) => {
                                                    // Compatibilidade com backend novo (rating1-5) e antigo (ratingDistribution)
                                                    const count = feedbackStats[`rating${stars}` as keyof FeedbackStats] as number || 
                                                                  feedbackStats.ratingDistribution?.[`stars${stars}` as keyof typeof feedbackStats.ratingDistribution] || 
                                                                  0;
                                                    const total = feedbackStats.total || feedbackStats.totalFeedbacks || 0;
                                                    const percentage = total > 0 ? (count / total) * 100 : 0;
                                                    
                                                    return (
                                                        <div key={stars} className="flex items-center gap-2 text-sm">
                                                            <span className="w-8 text-blue-700 font-medium">{stars}★</span>
                                                            <div className="flex-1 bg-blue-200 rounded-full h-2 overflow-hidden">
                                                                <div 
                                                                    className="bg-blue-600 h-full transition-all duration-300" 
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-12 text-right text-blue-900 font-medium">{count}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Lista de Feedbacks */}
                                {isLoadingFeedbacks ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                                    </div>
                                ) : feedbacks.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-semibold text-[#191919]">Nenhum feedback recebido</p>
                                        <p className="text-[#191919]/70">Os participantes poderão enviar feedbacks após o evento</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-[#191919] mb-4">
                                            Todos os Feedbacks ({feedbacks.length})
                                        </h3>
                                        {feedbacks.map((feedback) => (
                                            <div
                                                key={feedback.feedbackId}
                                                className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#ff914d]/30 transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-[#ff914d] to-[#ff7b33] rounded-full flex items-center justify-center">
                                                            <span className="text-white font-bold text-lg">
                                                                {feedback.userName.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-[#191919]">
                                                                {feedback.userName}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {new Date(feedback.sentAt || feedback.createdAt || '').toLocaleString('pt-BR', {
                                                                    day: '2-digit',
                                                                    month: 'long',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Estrelas de Avaliação */}
                                                    {feedback.rating && (
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-5 w-5 ${
                                                                        star <= feedback.rating!
                                                                            ? 'text-yellow-500 fill-yellow-500'
                                                                            : 'text-gray-300'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Comentário */}
                                                {(feedback.message || feedback.comment) && (
                                                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                                        <p className="text-[#191919] leading-relaxed whitespace-pre-wrap">
                                                            {feedback.message || feedback.comment}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Tipo de Feedback */}
                                                {feedback.feedbackType && (
                                                    <div className="mt-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                            feedback.feedbackType === 'PRAISE' ? 'bg-green-100 text-green-800' :
                                                            feedback.feedbackType === 'SUGGESTION' ? 'bg-blue-100 text-blue-800' :
                                                            feedback.feedbackType === 'COMPLAINT' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {feedback.feedbackType === 'PRAISE' ? '👏 Elogio' :
                                                             feedback.feedbackType === 'SUGGESTION' ? '💡 Sugestão' :
                                                             feedback.feedbackType === 'COMPLAINT' ? '⚠️ Reclamação' :
                                                             '📝 Feedback'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Tab: Admins */}
                        <TabsContent value="admins">
                            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-[#191919] mb-6">
                                    Administradores do Evento
                                </h2>

                                {/* Invite Admin */}
                                <div className="mb-8 p-6 bg-[#ff914d]/5 rounded-xl">
                                    <h3 className="text-lg font-semibold text-[#191919] mb-4 flex items-center">
                                        <UserPlus className="h-5 w-5 mr-2 text-[#ff914d]" />
                                        Convidar Administrador
                                    </h3>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Input
                                                type="email"
                                                placeholder="Digite o e-mail do usuário"
                                                value={inviteEmail}
                                                onChange={(e) => setInviteEmail(e.target.value)}
                                                className="h-12 rounded-xl"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleInviteAdmin}
                                            disabled={isSendingInvite || !inviteEmail.trim()}
                                            className="bg-[#ff914d] hover:bg-[#ff7b33] h-12 px-6"
                                        >
                                            {isSendingInvite ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : (
                                                <>
                                                    <Mail className="h-4 w-4 mr-2" />
                                                    Enviar Convite
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-sm text-[#191919]/60 mt-2">
                                        O usuário receberá uma notificação para aceitar o convite
                                    </p>
                                </div>

                                {/* Admins List */}
                                {isLoadingAdmins ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff914d]"></div>
                                    </div>
                                ) : admins.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-xl font-semibold text-[#191919]">Nenhum administrador convidado</p>
                                        <p className="text-[#191919]/70">Convide pessoas para ajudar a gerenciar o evento</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {admins.map((admin) => (
                                            <div
                                                key={admin.id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-[#ff914d]/10 rounded-full flex items-center justify-center">
                                                        <Shield className="h-6 w-6 text-[#ff914d]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#191919]">
                                                            {admin.userName}
                                                        </p>
                                                        <p className="text-sm text-[#191919]/60">
                                                            {admin.userEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {admin.accepted ? (
                                                        <div className="flex items-center gap-2 text-green-600">
                                                            <CheckCircle className="h-5 w-5" />
                                                            <span className="text-sm font-semibold">Ativo</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-yellow-600">
                                                            <Clock className="h-5 w-5" />
                                                            <span className="text-sm font-semibold">Pendente</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>

            {/* Validation Modal */}
            {selectedOrder && (
                <ValidationModal
                    order={selectedOrder}
                    isOpen={showValidationModal}
                    onClose={() => {
                        setShowValidationModal(false);
                        setSelectedOrder(null);
                    }}
                    onValidate={handleValidateOrder}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteEvent}
                title="Deletar Evento"
                message={`Tem certeza que deseja deletar o evento "${event?.title}"? Esta ação não pode ser desfeita e todos os participantes, ingressos e dados relacionados serão removidos permanentemente.`}
                confirmText="Sim, deletar"
                cancelText="Cancelar"
                variant="danger"
                isLoading={isDeletingEvent}
            />
        </EventsLayout>
    );
}
