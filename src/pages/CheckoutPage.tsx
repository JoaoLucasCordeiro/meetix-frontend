import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    ShoppingCart,
    Calendar,
    MapPin,
    Loader2,
    ArrowLeft,
    Tag,
    DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EventsLayout from "@/components/layouts/EventsLayouts";
import PixKeyDisplay from "@/components/ticket/PixKeyDisplay";
import PaymentProofUpload from "@/components/ticket/PaymentProofUpload";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI, ticketOrdersAPI, couponAPI } from "@/lib/api";
import type { Event } from "@/types/event";
import type { TicketOrder } from "@/types/ticket";
import type { ApiError } from "@/types/auth";
import type { Coupon } from "@/types/coupon";

export default function CheckoutPage() {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [event, setEvent] = useState<Event | null>(null);
    const [order, setOrder] = useState<TicketOrder | null>(null);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [proofUrl, setProofUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Você precisa estar logado para comprar ingressos');
            navigate('/login', { state: { returnTo: `/checkout/${eventId}` } });
            return;
        }

        if (!eventId) {
            navigate('/eventos');
            return;
        }

        loadData();
    }, [eventId, isAuthenticated]);

    const loadData = async () => {
        try {
            setIsLoading(true);

            // Buscar evento
            const eventData = await eventsAPI.getEventById(eventId!);

            if (!eventData.isPaid) {
                toast.error('Este evento é gratuito');
                navigate(`/eventos/${eventId}`);
                return;
            }

            setEvent(eventData);

            // Verificar se já existe um pedido pendente (ignorar cancelados)
            try {
                const existingOrders = await ticketOrdersAPI.getMyOrders();
                const pendingOrder = existingOrders.find(order =>
                    order.eventId === eventId &&
                    (order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'AWAITING_VALIDATION')
                );

                if (pendingOrder) {
                    // Usar pedido existente
                    setOrder(pendingOrder);

                    if (pendingOrder.orderStatus === 'AWAITING_VALIDATION') {
                        toast.info('Você já enviou um comprovante para este evento. Aguardando validação.');
                    } else {
                        toast.info('Pedido existente encontrado. Complete o pagamento abaixo.');
                    }
                    return;
                }

                // Verificar se há pedido aprovado (não permitir duplicar)
                const approvedOrder = existingOrders.find(order =>
                    order.eventId === eventId &&
                    order.orderStatus === 'APPROVED'
                );

                if (approvedOrder) {
                    toast.error('Você já possui um ingresso aprovado para este evento!');
                    navigate('/meus-ingressos');
                    return;
                }
            } catch (error) {
                console.error('Error checking existing orders:', error);
            }

            // Criar novo pedido apenas se não houver pendente
            try {
                const orderData = await ticketOrdersAPI.createOrder({
                    eventId: eventId!,
                });

                setOrder(orderData);
                toast.success('Pedido criado! Complete o pagamento abaixo');
            } catch (createError) {
                const apiError = createError as ApiError;

                // Se já existe ordem, buscar ela
                if (apiError.message?.toLowerCase().includes('já') ||
                    apiError.message?.toLowerCase().includes('already') ||
                    apiError.status === 409) {

                    const existingOrders = await ticketOrdersAPI.getMyOrders();

                    // Procurar apenas por pedidos ativos (não cancelados/rejeitados)
                    const activeOrder = existingOrders.find(order =>
                        order.eventId === eventId &&
                        (order.orderStatus === 'PENDING_PAYMENT' ||
                         order.orderStatus === 'AWAITING_VALIDATION' ||
                         order.orderStatus === 'APPROVED')
                    );

                    if (activeOrder) {
                        if (activeOrder.orderStatus === 'APPROVED') {
                            toast.error('Você já possui um ingresso aprovado para este evento!');
                            navigate('/meus-ingressos');
                            return;
                        } else {
                            setOrder(activeOrder);
                            toast.info('Continuando com seu pedido existente.');
                            return;
                        }
                    }

                    // Se não encontrou pedido ativo, verificar se há apenas cancelados/rejeitados
                    const cancelledOrRejectedOrder = existingOrders.find(order =>
                        order.eventId === eventId &&
                        (order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED')
                    );

                    if (cancelledOrRejectedOrder) {
                        console.error('Backend bloqueando criação de pedido devido a ordem cancelada/rejeitada:', cancelledOrRejectedOrder);
                        toast.error(
                            'Erro no backend: Não é possível criar novo pedido pois existe um pedido cancelado/rejeitado. ' +
                            'Isso é um problema do servidor que precisa ser corrigido pelo desenvolvedor backend.',
                            { autoClose: 10000 }
                        );
                        navigate('/meus-pedidos');
                        return;
                    }

                    // Se não encontrou nenhum pedido, o erro pode ser outra coisa
                    console.warn('Backend reportou pedido existente, mas não encontramos nenhum pedido. Erro inesperado.');
                }

                throw createError;
            }
        } catch (error) {
            const apiError = error as ApiError;

            // Mensagens de erro mais específicas
            if (apiError.status === 500) {
                toast.error('Erro no servidor ao criar pedido. Verifique os logs do backend Spring Boot.');
            } else if (apiError.status === 404) {
                toast.error('Evento não encontrado');
            } else if (apiError.status === 401) {
                toast.error('Você precisa estar logado. Redirecionando...');
                setTimeout(() => navigate('/login'), 2000);
                return;
            } else if (apiError.message?.includes('isPaid')) {
                toast.error('Este evento não está configurado para venda de ingressos');
            } else {
                toast.error(apiError.message || 'Erro ao carregar checkout');
            }

            navigate('/eventos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Digite um código de cupom');
            return;
        }

        if (!eventId) return;

        setIsApplyingCoupon(true);
        try {
            const coupon = await couponAPI.applyCoupon({
                code: couponCode.trim(),
                eventId: eventId,
            });
            
            setAppliedCoupon(coupon);
            toast.success(`Cupom aplicado! ${coupon.discount}% de desconto`);
        } catch (error) {
            const apiError = error as ApiError;
            
            if (apiError.status === 404) {
                toast.error('Cupom não encontrado');
            } else if (apiError.status === 400) {
                toast.error('Cupom expirado ou limite de uso atingido');
            } else {
                toast.error(apiError.message || 'Cupom inválido');
            }
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleSubmitPayment = async () => {
        if (!proofUrl) {
            toast.error('Por favor, envie o comprovante de pagamento');
            return;
        }

        if (!order) return;

        setIsSubmitting(true);
        try {
            await ticketOrdersAPI.uploadProof(order.orderId, { paymentProofUrl: proofUrl });
            toast.success('Comprovante enviado! Aguarde a validação do organizador');
            navigate('/meus-pedidos');
        } catch (error) {
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao enviar comprovante');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="container mx-auto px-6 py-12 max-w-6xl">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mx-auto mb-4" />
                            <p className="text-lg text-[#191919]/70">Carregando checkout...</p>
                        </div>
                    </div>
                </div>
            </EventsLayout>
        );
    }

    if (!event || !order) return null;

    // Calcular preço com desconto do cupom
    const originalPrice = event.price || 0;
    const discountAmount = appliedCoupon ? (originalPrice * appliedCoupon.discount / 100) : 0;
    const finalPrice = originalPrice - discountAmount;

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
                        onClick={() => navigate(`/eventos/${eventId}`)}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para o Evento
                    </Button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <ShoppingCart className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            <span className="text-[#ff914d]">Checkout</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Complete o pagamento para garantir seu ingresso
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Coluna Esquerda - Resumo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Resumo do Evento */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-[#191919] mb-4">Resumo do Pedido</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-[#191919] mb-2">{event.title}</h3>
                                    <div className="space-y-2 text-sm text-[#191919]/70">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {new Date(event.startDateTime).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    {appliedCoupon ? (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#191919]/60">Valor original:</span>
                                                <span className="line-through text-[#191919]/60">
                                                    R$ {originalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#191919]/60">Desconto ({appliedCoupon.discount}%):</span>
                                                <span className="text-green-600 font-semibold">
                                                    - R$ {discountAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs bg-green-50 px-3 py-2 rounded-lg mt-2">
                                                <Tag className="h-3 w-3 text-green-600" />
                                                <span className="text-green-700 font-medium">
                                                    Cupom "{appliedCoupon.code}" aplicado
                                                </span>
                                            </div>
                                        </>
                                    ) : order.originalAmount && order.originalAmount > order.amount ? (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#191919]/60">Valor original:</span>
                                                <span className="line-through text-[#191919]/60">
                                                    R$ {order.originalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#191919]/60">Desconto ({order.discountPercentage}%):</span>
                                                <span className="text-green-600 font-semibold">
                                                    - R$ {order.discountAmount?.toFixed(2)}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#191919]/60">Valor do ingresso:</span>
                                            <span className="text-[#191919]">R$ {originalPrice.toFixed(2)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-lg font-bold text-[#191919]">Total:</span>
                                        <span className="text-3xl font-bold text-[#ff914d]">
                                            R$ {appliedCoupon ? finalPrice.toFixed(2) : order.amount.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cupom de Desconto */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-lg font-bold text-[#191919] mb-4 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-[#ff914d]" />
                                Cupom de Desconto
                            </h2>
                            {appliedCoupon ? (
                                <div className="space-y-3">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-green-800">Cupom aplicado!</p>
                                                <p className="text-sm text-green-600">
                                                    Código: {appliedCoupon.code} • {appliedCoupon.discount}% de desconto
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setAppliedCoupon(null);
                                                    setCouponCode('');
                                                    toast.info('Cupom removido');
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                Remover
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        placeholder="Digite o código do cupom"
                                        className="flex-1"
                                        disabled={isApplyingCoupon}
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={isApplyingCoupon || !couponCode.trim()}
                                        className="bg-[#ff914d] hover:bg-[#ff7b33]"
                                    >
                                        {isApplyingCoupon ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Aplicar'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Coluna Direita - Pagamento */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Chave PIX */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-[#191919] mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-[#ff914d]" />
                                Pagamento via PIX
                            </h2>
                            <PixKeyDisplay pixKey={order.pixKey} pixKeyType={order.pixKeyType} />
                        </div>

                        {/* Upload Comprovante */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-xl font-bold text-[#191919] mb-4">
                                Enviar Comprovante
                            </h2>
                            <PaymentProofUpload
                                onUpload={setProofUrl}
                                isLoading={isSubmitting}
                            />
                        </div>

                        {/* Botão Finalizar */}
                        <Button
                            onClick={handleSubmitPayment}
                            disabled={!proofUrl || isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                'Confirmar Pagamento'
                            )}
                        </Button>

                        <p className="text-xs text-center text-[#191919]/50">
                            Seu pedido será validado pelo organizador em até 24 horas
                        </p>
                    </motion.div>
                </div>
            </div>
        </EventsLayout>
    );
}
