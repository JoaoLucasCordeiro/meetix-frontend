import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Ticket, Loader2, Filter, AlertCircle, Download } from "lucide-react";
import EventsLayout from "@/components/layouts/EventsLayouts";
import TicketCard from "@/components/ticket/TicketCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ticketsAPI } from "@/lib/api";
import type { EventTicket, TicketStatus } from "@/types/ticket";
import type { ApiError } from "@/types/auth";

const STATUS_FILTERS: Array<{ value: TicketStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'VALID', label: 'Válidos' },
    { value: 'USED', label: 'Usados' },
    { value: 'CANCELLED', label: 'Cancelados' },
];

export default function MyTicketsPage() {
    const { isAuthenticated } = useAuth();
    const [tickets, setTickets] = useState<EventTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<EventTicket[]>([]);
    const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Você precisa estar logado');
            return;
        }

        loadTickets();
    }, [isAuthenticated]);

    useEffect(() => {
        applyFilters();
    }, [tickets, statusFilter]);

    const loadTickets = async () => {
        try {
            setIsLoading(true);
            const data = await ticketsAPI.getMyTickets();
            setTickets(data);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar ingressos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadTickets();
        setIsRefreshing(false);
        toast.success('Lista atualizada!');
    };

    const applyFilters = () => {
        let filtered = [...tickets];

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(ticket => ticket.ticketStatus === statusFilter);
        }

        // Ordenar: VALID primeiro, depois por data de emissão
        filtered.sort((a, b) => {
            // Status priority: VALID > USED > CANCELLED
            const statusPriority: Record<TicketStatus, number> = { VALID: 0, USED: 1, CANCELLED: 2 };
            const priorityDiff = statusPriority[a.ticketStatus] - statusPriority[b.ticketStatus];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // Se mesmo status, mais recente primeiro
            const dateA = a.issueDate || a.issuedAt || '';
            const dateB = b.issueDate || b.issuedAt || '';
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setFilteredTickets(filtered);
    };

    const handleDownloadAll = async () => {
        const validTickets = tickets.filter(t => t.ticketStatus === 'VALID');
        
        if (validTickets.length === 0) {
            toast.error('Nenhum ingresso válido para baixar');
            return;
        }

        toast.info(`Baixando ${validTickets.length} ${validTickets.length === 1 ? 'ingresso' : 'ingressos'}...`);

        for (const ticket of validTickets) {
            try {
                await ticketsAPI.downloadTicketPDF(ticket.validationCode);
                // Pequeno delay entre downloads
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Erro ao baixar ingresso ${ticket.validationCode}:`, error);
            }
        }

        toast.success('Download concluído!');
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="container mx-auto px-6 py-12 max-w-7xl">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mx-auto mb-4" />
                            <p className="text-lg text-[#191919]/70">Carregando ingressos...</p>
                        </div>
                    </div>
                </div>
            </EventsLayout>
        );
    }

    return (
        <EventsLayout>
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <Ticket className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Meus <span className="text-[#ff914d]">Ingressos</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Seus ingressos aprovados e códigos QR para check-in
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <Filter className="h-5 w-5 text-[#191919]/50" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'ALL')}
                                className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] text-sm"
                            >
                                {STATUS_FILTERS.map(filter => (
                                    <option key={filter.value} value={filter.value}>
                                        {filter.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                variant="outline"
                                className="flex-1 sm:flex-none"
                            >
                                {isRefreshing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Atualizando...
                                    </>
                                ) : (
                                    'Atualizar'
                                )}
                            </Button>

                            {tickets.filter(t => t.ticketStatus === 'VALID').length > 0 && (
                                <Button
                                    onClick={handleDownloadAll}
                                    className="flex-1 sm:flex-none bg-[#ff914d] hover:bg-[#ff7b33]"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Baixar Todos
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-[#191919]/60">
                        <span>Total: {filteredTickets.length} {filteredTickets.length === 1 ? 'ingresso' : 'ingressos'}</span>
                        {tickets.filter(t => t.ticketStatus === 'VALID').length > 0 && (
                            <span className="text-green-600 font-semibold">
                                • {tickets.filter(t => t.ticketStatus === 'VALID').length} válidos
                            </span>
                        )}
                    </div>
                </motion.div>

                {/* Tickets Grid */}
                {filteredTickets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-[#ff914d]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-10 w-10 text-[#ff914d]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#191919] mb-2">
                                Nenhum ingresso encontrado
                            </h2>
                            <p className="text-[#191919]/70 mb-6">
                                {statusFilter === 'ALL' 
                                    ? 'Você ainda não tem ingressos. Compre um ingresso e aguarde a aprovação!'
                                    : `Você não tem ingressos com status "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}".`
                                }
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() => window.location.href = '/eventos'}
                                    className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                >
                                    Explorar Eventos
                                </Button>
                                <Button
                                    onClick={() => window.location.href = '/meus-pedidos'}
                                    variant="outline"
                                >
                                    Ver Meus Pedidos
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTickets.map((ticket, index) => (
                            <motion.div
                                key={ticket.ticketId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <TicketCard 
                                    ticket={ticket}
                                    onDownload={() => ticketsAPI.downloadTicketPDF(ticket.validationCode)}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                {tickets.length > 0 && tickets.some(t => t.ticketStatus === 'VALID') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800"
                    >
                        <p className="font-semibold mb-1">✅ Seus ingressos estão prontos!</p>
                        <ul className="list-disc list-inside space-y-1 text-green-700">
                            <li>Baixe o PDF para ter uma cópia offline</li>
                            <li>Apresente o QR code no dia do evento para fazer check-in</li>
                            <li>Você pode visualizar os ingressos nesta página a qualquer momento</li>
                            <li>Guarde o código de validação em local seguro</li>
                        </ul>
                    </motion.div>
                )}
            </div>
        </EventsLayout>
    );
}
