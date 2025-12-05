import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Receipt, Loader2, Filter, AlertCircle, Upload, X } from "lucide-react";
import EventsLayout from "@/components/layouts/EventsLayouts";
import OrderCard from "@/components/ticket/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

    // Upload proof modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [proofUrl, setProofUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // View proof modal state
    const [showViewProofModal, setShowViewProofModal] = useState(false);
    const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

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

    const handleUploadProof = (orderId: string) => {
        setSelectedOrderId(orderId);
        setProofUrl('');
        setShowUploadModal(true);
    };

    const handleSubmitProof = async () => {
        if (!selectedOrderId || !proofUrl.trim()) {
            toast.error('Por favor, insira o link do comprovante');
            return;
        }

        // Validate URL format
        try {
            new URL(proofUrl);
        } catch {
            toast.error('URL inválida. Por favor, insira um link válido');
            return;
        }

        try {
            setIsUploading(true);
            await ticketOrdersAPI.uploadProof(selectedOrderId, {
                paymentProofUrl: proofUrl.trim()
            });

            toast.success('Comprovante enviado com sucesso!');
            setShowUploadModal(false);
            setProofUrl('');
            setSelectedOrderId(null);

            // Refresh orders list
            await loadOrders();
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao enviar comprovante');
        } finally {
            setIsUploading(false);
        }
    };

    const handleViewProof = (proofUrl: string) => {
        setViewingProofUrl(proofUrl);
        setShowViewProofModal(true);
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Tem certeza que deseja cancelar este pedido?')) {
            return;
        }

        try {
            await ticketOrdersAPI.cancelOrder(orderId);
            toast.success('Pedido cancelado com sucesso!');

            // Refresh orders list
            await loadOrders();
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao cancelar pedido');
        }
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
                                    onUploadProof={handleUploadProof}
                                    onViewProof={handleViewProof}
                                    onCancel={handleCancelOrder}
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

                {/* Upload Proof Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-[#191919]">
                                    Enviar Comprovante
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setProofUrl('');
                                        setSelectedOrderId(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="proofUrl">Link do Comprovante *</Label>
                                    <Input
                                        id="proofUrl"
                                        type="url"
                                        value={proofUrl}
                                        onChange={(e) => setProofUrl(e.target.value)}
                                        placeholder="https://exemplo.com/comprovante.jpg"
                                        className="mt-1"
                                    />
                                    <p className="text-xs text-[#191919]/60 mt-1">
                                        Cole o link da imagem do comprovante de pagamento
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Dica:</strong> Você pode fazer upload da imagem em serviços como Imgur, Google Drive (link público) ou similares.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setProofUrl('');
                                            setSelectedOrderId(null);
                                        }}
                                        variant="outline"
                                        className="flex-1"
                                        disabled={isUploading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSubmitProof}
                                        className="flex-1 bg-[#ff914d] hover:bg-[#ff7b33]"
                                        disabled={isUploading || !proofUrl.trim()}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Enviar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* View Proof Modal */}
                {showViewProofModal && viewingProofUrl && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-[#191919]">
                                    Comprovante de Pagamento
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowViewProofModal(false);
                                        setViewingProofUrl(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <img
                                    src={viewingProofUrl}
                                    alt="Comprovante de pagamento"
                                    className="w-full rounded-lg border border-gray-200"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML += '<p class="text-center text-red-600 py-8">Não foi possível carregar a imagem</p>';
                                    }}
                                />

                                <Button
                                    onClick={() => window.open(viewingProofUrl, '_blank')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Abrir em Nova Aba
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </EventsLayout>
    );
}
