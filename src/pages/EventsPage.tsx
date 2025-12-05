import { Search, TrendingUp, Zap, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/shared/all/Eventcard";
import EventsLayout from "@/components/layouts/EventsLayouts";
import { eventsAPI, participantsAPI, ticketsAPI } from "@/lib/api";
import type { Event, EventType } from "@/types/event";

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [participantCounts, setParticipantCounts] = useState<Map<string, number>>(new Map());
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                setIsLoadingParticipants(true);
                const data = await eventsAPI.getAllEvents();
                setEvents(data);

                // Fetch participant counts for all events
                await fetchParticipantCounts(data);
            } catch (error) {
                console.error('Error fetching events:', error);
                toast.error('Erro ao carregar eventos. Tente novamente.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const fetchParticipantCounts = async (eventList: Event[]) => {
        try {
            const counts = new Map<string, number>();

            // Fetch participant counts for each event in parallel
            await Promise.all(
                eventList.map(async (event) => {
                    try {
                        let totalCount = 0;

                        // For free events: count event-participants
                        if (!event.isPaid) {
                            const participants = await participantsAPI.getEventParticipants(event.id);
                            totalCount = participants.length;
                        } else {
                            // For paid events: count tickets (approved orders)
                            try {
                                const tickets = await ticketsAPI.getEventTickets(event.id);
                                // Count tickets that are VALID or USED (not CANCELLED)
                                totalCount = tickets.filter(t => t.ticketStatus !== 'CANCELLED').length;
                            } catch (error) {
                                // If tickets API fails, try to count from event-participants as fallback
                                const participants = await participantsAPI.getEventParticipants(event.id);
                                totalCount = participants.length;
                            }
                        }

                        counts.set(event.id, totalCount);
                    } catch (error) {
                        console.error(`Error fetching participants for event ${event.id}:`, error);
                        // If error fetching participants, set count to 0
                        counts.set(event.id, 0);
                    }
                })
            );

            setParticipantCounts(counts);
        } catch (error) {
            console.error('Error fetching participant counts:', error);
        } finally {
            setIsLoadingParticipants(false);
        }
    };

    // Filter events by search query and exclude events that have ended
    const filteredEvents = events.filter(event => {
        // Get current date/time in Brazil timezone (UTC-3)
        const now = new Date();
        const brasiliaOffset = -3 * 60; // Brazil is UTC-3 (in minutes)
        const localOffset = now.getTimezoneOffset(); // Current timezone offset
        const offsetDiff = localOffset - brasiliaOffset;
        const nowBrasilia = new Date(now.getTime() + offsetDiff * 60 * 1000);

        // Parse event end date
        // Backend sends in format YYYY-MM-DDTHH:mm:ss (without timezone)
        // We need to treat it as Brasilia time
        let eventEndDate: Date;
        if (event.endDateTime.includes('Z') || event.endDateTime.includes('+') || event.endDateTime.includes('-')) {
            // Already has timezone info
            eventEndDate = new Date(event.endDateTime);
        } else {
            // No timezone info - treat as Brasilia time
            // Parse as if it's already in Brasilia timezone
            eventEndDate = new Date(event.endDateTime);
        }

        // Event is considered ended if endDateTime has passed
        const isNotEnded = eventEndDate > nowBrasilia;

        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()));

        return isNotEnded && matchesSearch;
    });

    // Helper function to map EventType to category
    const mapEventTypeToCategory = (eventType: EventType): "workshop" | "palestra" | "minicurso" | "festa" => {
        const type = eventType.toLowerCase();
        if (type === 'outro') return 'workshop'; // Default to workshop for 'outro'
        return type as "workshop" | "palestra" | "minicurso" | "festa";
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Helper function to format time
    const formatTime = (startDateTime: string, endDateTime: string) => {
        const start = new Date(startDateTime);
        const end = new Date(endDateTime);
        return `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Convert Event to EventCard props
    const convertToEventCard = (event: Event) => {
        const participantCount = participantCounts.get(event.id) || 0;

        return {
            id: event.id,
            title: event.title,
            date: formatDate(event.startDateTime),
            time: formatTime(event.startDateTime, event.endDateTime),
            location: event.remote ? 'Online' : (event.location || 'Local não informado'),
            image: (event.imgUrl && event.imgUrl.trim() !== '') ? event.imgUrl : '/logo.png',
            category: mapEventTypeToCategory(event.eventType),
            price: event.isPaid ? event.price || 0 : null,
            participants: participantCount,
        };
    };

    // Use useMemo to only recalculate when participantCounts or filteredEvents change
    const eventCards = useMemo(() => {
        return {
            trending: filteredEvents.slice(0, 3).map(convertToEventCard),
            workshops: filteredEvents.filter(event => event.eventType === 'WORKSHOP').map(convertToEventCard),
            palestras: filteredEvents.filter(event => event.eventType === 'PALESTRA').map(convertToEventCard),
            minicursos: filteredEvents.filter(event => event.eventType === 'MINICURSO').map(convertToEventCard),
            festas: filteredEvents.filter(event => event.eventType === 'FESTA').map(convertToEventCard),
        };
    }, [filteredEvents, participantCounts]);

    const trendingEvents = eventCards.trending;
    const workshopEvents = eventCards.workshops;
    const palestraEvents = eventCards.palestras;
    const minicursoEvents = eventCards.minicursos;
    const festaEvents = eventCards.festas;

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
                            <Zap className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Explore <span className="text-[#ff914d]">Eventos</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70 mb-6">
                        Descubra palestras, workshops, festas e muito mais na sua universidade
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar eventos por nome, local ou categoria..."
                            className="pl-12 h-14 rounded-xl bg-white border-gray-300 focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </motion.div>

                {/* Loading State */}
                {(isLoading || isLoadingParticipants) ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mx-auto mb-4" />
                            <p className="text-lg text-[#191919]/70">Carregando eventos...</p>
                        </div>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <p className="text-xl font-semibold text-[#191919] mb-2">
                                {searchQuery ? 'Nenhum evento encontrado' : 'Ainda não há eventos disponíveis'}
                            </p>
                            <p className="text-[#191919]/70">
                                {searchQuery ? 'Tente buscar por outros termos' : 'Volte em breve para ver novos eventos'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Eventos em Alta */}
                        {trendingEvents.length > 0 && (
                            <section className="mb-16">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="flex items-center gap-3 mb-6"
                                >
                                    <TrendingUp className="h-6 w-6 text-[#ff914d]" />
                                    <h2 className="text-2xl font-bold text-[#191919]">
                                        Eventos em Alta
                                    </h2>
                                </motion.div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {trendingEvents.map((event, index) => (
                                        <EventCard key={event.id} {...event} delay={index * 0.1} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Workshops */}
                        {workshopEvents.length > 0 && (
                            <section className="mb-16">
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="text-2xl font-bold text-[#191919] mb-6"
                                >
                                    Workshops
                                </motion.h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {workshopEvents.map((event, index) => (
                                        <EventCard key={event.id} {...event} delay={index * 0.1} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Festas */}
                        {festaEvents.length > 0 && (
                            <section className="mb-16">
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="text-2xl font-bold text-[#191919] mb-6"
                                >
                                    Festas
                                </motion.h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {festaEvents.map((event, index) => (
                                        <EventCard key={event.id} {...event} delay={index * 0.1} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Palestras */}
                        {palestraEvents.length > 0 && (
                            <section className="mb-16">
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="text-2xl font-bold text-[#191919] mb-6"
                                >
                                    Palestras
                                </motion.h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {palestraEvents.map((event, index) => (
                                        <EventCard key={event.id} {...event} delay={index * 0.1} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Minicursos */}
                        {minicursoEvents.length > 0 && (
                            <section className="mb-16">
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="text-2xl font-bold text-[#191919] mb-6"
                                >
                                    Minicursos
                                </motion.h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {minicursoEvents.map((event, index) => (
                                        <EventCard key={event.id} {...event} delay={index * 0.1} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </EventsLayout>
    );
}
