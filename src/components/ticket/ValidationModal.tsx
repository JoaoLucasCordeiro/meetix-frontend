import { CheckCircle, XCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { TicketOrder } from "@/types/ticket";

interface ValidationModalProps {
    order: TicketOrder;
    isOpen: boolean;
    onClose: () => void;
    onValidate: (approved: boolean, rejectionReason?: string, notes?: string) => Promise<void>;
}

export default function ValidationModal({ order, isOpen, onClose, onValidate }: ValidationModalProps) {
    const [isValidating, setIsValidating] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [notes, setNotes] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!isOpen) return null;

    const handleApprove = async () => {
        setIsValidating(true);
        try {
            await onValidate(true, undefined, notes || undefined);
            onClose();
        } catch (error) {
            console.error('Erro ao aprovar:', error);
        } finally {
            setIsValidating(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Por favor, informe o motivo da rejeição');
            return;
        }

        setIsValidating(true);
        try {
            await onValidate(false, rejectionReason, notes || undefined);
            onClose();
        } catch (error) {
            console.error('Erro ao rejeitar:', error);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#ff914d] to-[#ff7b33] p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Validar Pagamento</h2>
                    <p className="text-sm opacity-90">Pedido: {order.orderId.slice(0, 8)}...</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Informações do Pedido */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-[#191919]/60">Evento:</span>
                            <span className="font-semibold text-[#191919]">{order.eventTitle}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[#191919]/60">Participante:</span>
                            <span className="font-semibold text-[#191919]">{order.userName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-[#191919]/60">Valor:</span>
                            <span className="text-xl font-bold text-[#ff914d]">R$ {order.amount.toFixed(2)}</span>
                        </div>
                        {order.couponCode && (
                            <div className="flex justify-between">
                                <span className="text-sm text-[#191919]/60">Cupom aplicado:</span>
                                <span className="font-mono text-sm text-green-600">{order.couponCode}</span>
                            </div>
                        )}
                    </div>

                    {/* Comprovante */}
                    {order.paymentProofUrl ? (
                        <div>
                            <Label className="mb-2 block">Comprovante de Pagamento</Label>
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <img
                                    src={order.paymentProofUrl}
                                    alt="Comprovante de pagamento"
                                    className="w-full h-96 object-contain bg-gray-50"
                                />
                            </div>
                            <a
                                href={order.paymentProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#ff914d] hover:underline mt-2 inline-block"
                            >
                                Abrir em nova aba →
                            </a>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                            <ImageIcon className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="font-semibold text-yellow-800">Sem comprovante</p>
                                <p className="text-sm text-yellow-700">O usuário ainda não enviou o comprovante</p>
                            </div>
                        </div>
                    )}

                    {/* Notas Internas */}
                    {!showRejectForm && (
                        <div>
                            <Label htmlFor="notes" className="mb-2 block">
                                Notas Internas (Opcional)
                            </Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Adicione observações internas sobre este pedido..."
                                rows={3}
                                disabled={isValidating}
                            />
                            <p className="text-xs text-[#191919]/50 mt-1">
                                Essas notas são visíveis apenas para admins
                            </p>
                        </div>
                    )}

                    {/* Formulário de Rejeição */}
                    {showRejectForm && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                            <Label htmlFor="rejectionReason" className="text-red-800">
                                Motivo da Rejeição *
                            </Label>
                            <Textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Ex: Comprovante ilegível, valor incorreto, comprovante de outra pessoa..."
                                rows={3}
                                disabled={isValidating}
                                className="border-red-300 focus:border-red-500 focus:ring-red-500"
                            />
                            <p className="text-xs text-red-700">
                                Este motivo será enviado ao usuário
                            </p>
                        </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-3 pt-4">
                        {!showRejectForm ? (
                            <>
                                <Button
                                    onClick={handleApprove}
                                    disabled={isValidating || !order.paymentProofUrl}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-14"
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Aprovando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-5 w-5" />
                                            Aprovar Pagamento
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => setShowRejectForm(true)}
                                    disabled={isValidating}
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-14"
                                >
                                    <XCircle className="mr-2 h-5 w-5" />
                                    Rejeitar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={handleReject}
                                    disabled={isValidating || !rejectionReason.trim()}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white h-14"
                                >
                                    {isValidating ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Rejeitando...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="mr-2 h-5 w-5" />
                                            Confirmar Rejeição
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowRejectForm(false);
                                        setRejectionReason('');
                                    }}
                                    disabled={isValidating}
                                    variant="outline"
                                    className="flex-1 h-14"
                                >
                                    Cancelar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
