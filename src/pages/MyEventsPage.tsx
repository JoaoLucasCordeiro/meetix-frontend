import { motion } from "framer-motion";
import { Calendar, Plus, Ticket, Trophy, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import EventCard from "@/components/shared/all/Eventcard";
import EventsLayout from "@/components/layouts/EventsLayouts";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI, participantsAPI } from "@/lib/api";
import type { Event } from "@/types/event";
import type { ApiError } from "@/types/auth";

// Helper para converter Event do backend para formato do EventCard
const eventToCardProps = (event: Event) => {
    const categoryMap: Record<string, "workshop" | "festa" | "palestra" | "minicurso"> = {
        WORKSHOP: "workshop",
        FESTA: "festa",
        PALESTRA: "palestra",
        MINICURSO: "minicurso",
        OUTRO: "workshop" // fallback
    };

    // Formatar data e hora
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);
    
    const dateStr = startDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
    
    const timeStr = `${startDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    })}-${endDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    })}`;

    return {
        id: event.id,
        title: event.title,
        date: dateStr,
        time: timeStr,
        location: event.location || "Local a definir",
        image: (event.imgUrl && event.imgUrl.trim() !== '') ? event.imgUrl : "/logo.png",
        category: categoryMap[event.eventType] || "workshop",
        price: event.isPaid && event.price ? event.price : null,
        participants: event.maxAttendees || 0,
    };
};

export default function MyEventsPage() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
    const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
    const [isLoadingParticipating, setIsLoadingParticipating] = useState(true);
    const [isLoadingCreated, setIsLoadingCreated] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            toast.info('Faça login para ver seus eventos');
            navigate('/login');
            return;
        }

        fetchParticipatingEvents();
        fetchCreatedEvents();
    }, [isAuthenticated, user]);

    const fetchParticipatingEvents = async () => {
        if (!user) return;

        try {
            setIsLoadingParticipating(true);
            const participations = await participantsAPI.getUserParticipations(user.id);
            
            // Buscar detalhes de cada evento
            const eventsPromises = participations.map(p => 
                eventsAPI.getEventById(p.eventId)
            );
            const events = await Promise.all(eventsPromises);
            
            setParticipatingEvents(events);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar eventos de participação');
        } finally {
            setIsLoadingParticipating(false);
        }
    };

    const fetchCreatedEvents = async () => {
        if (!user) return;

        try {
            setIsLoadingCreated(true);
            const events = await eventsAPI.getEventsByOrganizer(user.id);
            setCreatedEvents(events);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar eventos criados');
        } finally {
            setIsLoadingCreated(false);
        }
    };

    const calculateTotalReach = (): number => {
        return createdEvents.reduce((total: number, event: Event) => {
            return total + (event.maxAttendees || 0);
        }, 0);
    };

    return (
        <EventsLayout>
            <div className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <Calendar className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Meus <span className="text-[#ff914d]">Eventos</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Gerencie seus eventos e acompanhe suas participações
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* Total de Participações */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Ticket className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">{participatingEvents.length}</p>
                                <p className="text-sm opacity-90">eventos</p>
                            </div>
                        </div>
                        <p className="font-semibold">Participações</p>
                        <p className="text-sm opacity-90">Eventos que você se inscreveu</p>
                    </div>

                    {/* Eventos Criados */}
                    <div className="bg-gradient-to-br from-[#ff914d] to-[#ff7b33] rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Plus className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">{createdEvents.length}</p>
                                <p className="text-sm opacity-90">eventos</p>
                            </div>
                        </div>
                        <p className="font-semibold">Organizados</p>
                        <p className="text-sm opacity-90">Eventos que você criou</p>
                    </div>

                    {/* Total de Participantes */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Trophy className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">
                                    {calculateTotalReach()}
                                </p>
                                <p className="text-sm opacity-90">vagas</p>
                            </div>
                        </div>
                        <p className="font-semibold">Alcance Total</p>
                        <p className="text-sm opacity-90">Em eventos que você organizou</p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Tabs defaultValue="participating" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-gray-100 rounded-xl p-1">
                            <TabsTrigger 
                                value="participating" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Ticket className="h-5 w-5 mr-2" />
                                Participando ({participatingEvents.length})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="created" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Criados ({createdEvents.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: Eventos que estou participando */}
                        <TabsContent value="participating" className="mt-8">
                            {isLoadingParticipating ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="h-12 w-12 animate-spin text-[#ff914d]" />
                                </div>
                            ) : participatingEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {participatingEvents.map((event, index) => (
                                        <EventCard key={event.id} {...eventToCardProps(event)} delay={index * 0.1} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Ticket}
                                    title="Nenhuma participação ainda"
                                    description="Você ainda não se inscreveu em nenhum evento. Explore os eventos disponíveis e participe!"
                                    actionLabel="Explorar Eventos"
                                    actionLink="/eventos"
                                />
                            )}
                        </TabsContent>

                        {/* Tab: Eventos que criei */}
                        <TabsContent value="created" className="mt-8">
                            {isLoadingCreated ? (
                                <div className="flex justify-center items-center py-20">
                                    <Loader2 className="h-12 w-12 animate-spin text-[#ff914d]" />
                                </div>
                            ) : createdEvents.length > 0 ? (
                                <>
                                    <div className="flex justify-end mb-6">
                                        <Link to="/criar-evento">
                                            <Button className="bg-[#ff914d] hover:bg-[#ff7b33] shadow-lg shadow-[#ff914d]/30">
                                                <Plus className="h-5 w-5 mr-2" />
                                                Criar Novo Evento
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {createdEvents.map((event, index) => (
                                            <EventCard key={event.id} {...eventToCardProps(event)} delay={index * 0.1} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    icon={Plus}
                                    title="Nenhum evento criado"
                                    description="Você ainda não criou nenhum evento. Comece agora e compartilhe suas ideias com a comunidade!"
                                    actionLabel="Criar Primeiro Evento"
                                    actionLink="/criar-evento"
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </EventsLayout>
    );
}

// Componente de Empty State
interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    actionLabel: string;
    actionLink: string;
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionLink }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-300"
        >
            <div className="p-6 bg-gray-100 rounded-full mb-6">
                <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-[#191919] mb-3">{title}</h3>
            <p className="text-[#191919]/70 text-center max-w-md mb-8">{description}</p>
            <Link to={actionLink}>
                <Button className="bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] shadow-lg shadow-[#ff914d]/30">
                    {actionLabel}
                </Button>
            </Link>
        </motion.div>
    );
}
