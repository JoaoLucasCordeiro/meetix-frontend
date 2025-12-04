import { Ticket, Download, CheckCircle, XCircle, Ban, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventTicket, TicketStatus } from "@/types/ticket";

interface TicketCardProps {
    ticket: EventTicket;
    onDownload: (validationCode: string) => void;
    isDownloading?: boolean;
}

const statusConfig: Record<TicketStatus, { label: string; icon: React.ElementType; bgColor: string; textColor: string }> = {
    VALID: {
        label: 'VÁLIDO',
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700'
    },
    USED: {
        label: 'UTILIZADO',
        icon: CheckCircle,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700'
    },
    CANCELLED: {
        label: 'CANCELADO',
        icon: Ban,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700'
    }
};

export default function TicketCard({ ticket, onDownload, isDownloading }: TicketCardProps) {
    const config = statusConfig[ticket.ticketStatus];
    const StatusIcon = config.icon;

    // Garantir que o QR Code tenha o prefixo correto
    const hasQrCode = ticket.qrCodeData && ticket.qrCodeData.length > 0;
    const qrCodeSrc = hasQrCode
        ? (ticket.qrCodeData!.startsWith('data:image')
            ? ticket.qrCodeData
            : `data:image/png;base64,${ticket.qrCodeData}`)
        : undefined;

    // Função para formatar data de forma segura
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'Data não disponível';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.error('Data inválida:', dateString);
                return 'Data inválida';
            }
            
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error, dateString);
            return 'Erro ao formatar data';
        }
    };

    return (
        <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
            {/* Header com Status */}
            <div className="bg-gradient-to-r from-[#ff914d] to-[#ff7b33] p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        <span className="font-semibold">Ingresso</span>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-xs font-bold">{config.label}</span>
                    </div>
                </div>
                <h3 className="font-bold text-lg">{ticket.eventTitle}</h3>
            </div>

            {/* QR Code */}
            <div className="p-6 bg-gray-50 flex justify-center">
                {hasQrCode ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200">
                        <img
                            src={qrCodeSrc}
                            alt="QR Code do ingresso"
                            className="w-48 h-48 object-contain"
                            onError={(e) => {
                                console.error('Erro ao carregar QR Code do ticket:', ticket.ticketId);
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJybyBhbyBjYXJyZWdhcjwvdGV4dD48L3N2Zz4=';
                            }}
                        />
                    </div>
                ) : (
                    <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200 w-48 h-48 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <XCircle className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">QR Code não disponível</p>
                            <p className="text-xs mt-1">(Aguardando geração)</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Informações */}
            <div className="p-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-[#191919]/60" />
                    <div>
                        <p className="text-xs text-[#191919]/60">Participante</p>
                        <p className="font-semibold text-[#191919]">{ticket.userName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-[#191919]/60" />
                    <div>
                        <p className="text-xs text-[#191919]/60">Emitido em</p>
                        <p className="font-semibold text-[#191919]">
                            {formatDate(ticket.issueDate || ticket.issuedAt)}
                        </p>
                    </div>
                </div>

                {ticket.ticketStatus === 'USED' && ticket.checkedInAt && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-semibold mb-1">✓ Check-in realizado</p>
                        <p className="text-xs text-blue-600">
                            {formatDate(ticket.checkedInAt)}
                        </p>
                    </div>
                )}

                <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-[#191919]/50 mb-2 text-center">
                        Código de validação
                    </p>
                    <p className="font-mono text-sm text-center bg-gray-100 rounded px-3 py-2 text-[#191919]">
                        {ticket.validationCode}
                    </p>
                </div>
            </div>

            {/* Botão Download */}
            {ticket.ticketStatus !== 'CANCELLED' && (
                <div className="px-6 pb-6">
                    <Button
                        onClick={() => onDownload(ticket.validationCode)}
                        disabled={isDownloading}
                        className="w-full bg-[#ff914d] hover:bg-[#ff7b33]"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Baixando...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar PDF
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
