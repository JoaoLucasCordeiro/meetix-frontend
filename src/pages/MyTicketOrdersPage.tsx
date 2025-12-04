import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Receipt, Loader2, Filter, AlertCircle } from "lucide-react";
import EventsLayout from "@/components/layouts/EventsLayouts";
import OrderCard from "@/components/ticket/OrderCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ticketOrdersAPI } from "@/lib/api";
import type { TicketOrder, OrderStatus } from "@/types/ticket";
import type { ApiError } from "@/types/auth";

const STATUS_FILTERS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'Todos' },
    { value: 'PENDING_PAYMENT', label: 'Aguardando Pagamento' },
    { value: 'AWAITING_VALIDATION', label: 'Aguardando Validação' },
    { value: 'APPROVED', label: 'Aprovados' },
    { value: 'REJECTED', label: 'Rejeitados' },
    { value: 'CANCELLED', label: 'Cancelados' },
];

export default function MyTicketOrdersPage() {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<TicketOrder[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<TicketOrder[]>([]);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Você precisa estar logado');
            return;
        }

        loadOrders();
    }, [isAuthenticated]);

    useEffect(() => {
        applyFilters();
    }, [orders, statusFilter]);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            const data = await ticketOrdersAPI.getMyOrders();
            setOrders(data);
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar pedidos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadOrders();
        setIsRefreshing(false);
        toast.success('Lista atualizada!');
    };

    const applyFilters = () => {
        let filtered = [...orders];

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.orderStatus === statusFilter);
        }

        // Ordenar por data (mais recente primeiro)
        filtered.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setFilteredOrders(filtered);
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="container mx-auto px-6 py-12 max-w-6xl">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mx-auto mb-4" />
                            <p className="text-lg text-[#191919]/70">Carregando pedidos...</p>
                        </div>
                    </div>
                </div>
            </EventsLayout>
        );
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
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <Receipt className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Meus <span className="text-[#ff914d]">Pedidos</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Acompanhe seus pedidos de ingressos
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
                                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                                className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff914d] text-sm"
                            >
                                {STATUS_FILTERS.map(filter => (
                                    <option key={filter.value} value={filter.value}>
                                        {filter.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            variant="outline"
                            className="w-full sm:w-auto"
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
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-[#191919]/60">
                        <span>Total: {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}</span>
                    </div>
                </motion.div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
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
                                Nenhum pedido encontrado
                            </h2>
                            <p className="text-[#191919]/70 mb-6">
                                {statusFilter === 'ALL' 
                                    ? 'Você ainda não fez nenhum pedido de ingresso.'
                                    : `Você não tem pedidos com status "${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}".`
                                }
                            </p>
                            <Button
                                onClick={() => window.location.href = '/eventos'}
                                className="bg-[#ff914d] hover:bg-[#ff7b33]"
                            >
                                Explorar Eventos
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order, index) => (
                            <motion.div
                                key={order.orderId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <OrderCard 
                                    order={order}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                {orders.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800"
                    >
                        <p className="font-semibold mb-1">ℹ️ Informações importantes:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Pedidos aprovados geram ingressos automaticamente</li>
                            <li>Você pode enviar o comprovante novamente se for rejeitado</li>
                            <li>Pedidos pendentes podem ser cancelados</li>
                            <li>A validação é feita pelo organizador do evento</li>
                        </ul>
                    </motion.div>
                )}
            </div>
        </EventsLayout>
    );
}
