import { Receipt, Clock, CheckCircle, XCircle, Ban, Upload, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TicketOrder, OrderStatus } from "@/types/ticket";

interface OrderCardProps {
    order: TicketOrder;
    onUploadProof?: (orderId: string) => void;
    onViewProof?: (proofUrl: string) => void;
    onCancel?: (orderId: string) => void;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; bgColor: string; textColor: string; borderColor: string }> = {
    PENDING_PAYMENT: {
        label: 'Aguardando Pagamento',
        icon: Clock,
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200'
    },
    AWAITING_VALIDATION: {
        label: 'Em Análise',
        icon: Clock,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
    },
    APPROVED: {
        label: 'Aprovado',
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
    },
    REJECTED: {
        label: 'Rejeitado',
        icon: XCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200'
    },
    CANCELLED: {
        label: 'Cancelado',
        icon: Ban,
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        borderColor: 'border-gray-200'
    }
};

export default function OrderCard({ order, onUploadProof, onViewProof, onCancel }: OrderCardProps) {
    const config = statusConfig[order.orderStatus];
    const StatusIcon = config.icon;

    const canUploadProof = order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'REJECTED';
    const canCancel = order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'AWAITING_VALIDATION';
    const hasProof = !!order.paymentProofUrl;

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#ff914d]/10 rounded-lg">
                        <Receipt className="h-6 w-6 text-[#ff914d]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[#191919] text-lg">{order.eventTitle}</h3>
                        <p className="text-sm text-[#191919]/60">
                            Pedido: {order.orderId.slice(0, 8)}...
                        </p>
                    </div>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{config.label}</span>
                </div>
            </div>

            {/* Valores */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                {order.originalAmount && order.originalAmount > order.amount && (
                    <>
                        <div className="flex justify-between text-sm">
                            <span className="text-[#191919]/60">Valor original:</span>
                            <span className="line-through text-[#191919]/60">R$ {order.originalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[#191919]/60">Desconto ({order.discountPercentage}%):</span>
                            <span className="text-green-600 font-semibold">- R$ {order.discountAmount?.toFixed(2)}</span>
                        </div>
                        {order.couponCode && (
                            <div className="flex justify-between text-sm">
                                <span className="text-[#191919]/60">Cupom:</span>
                                <span className="font-mono text-[#ff914d]">{order.couponCode}</span>
                            </div>
                        )}
                    </>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-[#191919]">Total:</span>
                    <span className="text-xl font-bold text-[#ff914d]">R$ {order.amount.toFixed(2)}</span>
                </div>
            </div>

            {/* Motivo de rejeição */}
            {order.orderStatus === 'REJECTED' && order.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-red-700 mb-1">Motivo da rejeição:</p>
                    <p className="text-sm text-red-600">{order.rejectionReason}</p>
                </div>
            )}

            {/* Comprovante */}
            {hasProof && onViewProof && (
                <Button
                    onClick={() => onViewProof(order.paymentProofUrl!)}
                    variant="outline"
                    size="sm"
                    className="w-full mb-3"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Comprovante Enviado
                </Button>
            )}

            {/* Ações */}
            <div className="flex gap-3">
                {canUploadProof && onUploadProof && (
                    <Button
                        onClick={() => onUploadProof(order.orderId)}
                        className="flex-1 bg-[#ff914d] hover:bg-[#ff7b33]"
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {hasProof ? 'Reenviar Comprovante' : 'Enviar Comprovante'}
                    </Button>
                )}

                {canCancel && onCancel && (
                    <Button
                        onClick={() => onCancel(order.orderId)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                )}

                {order.orderStatus === 'APPROVED' && (
                    <Button
                        onClick={() => window.location.href = '/meus-ingressos'}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Ver Ingresso
                    </Button>
                )}
            </div>

            {/* Data */}
            <p className="text-xs text-[#191919]/50 mt-4 text-center">
                Criado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </p>
        </div>
    );
}
