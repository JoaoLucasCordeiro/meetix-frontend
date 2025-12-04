import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import type { PixKeyType } from "@/types/ticket";

interface PixKeyDisplayProps {
    pixKey: string;
    pixKeyType: PixKeyType;
}

const pixKeyTypeLabels: Record<PixKeyType, string> = {
    CPF: "CPF",
    CNPJ: "CNPJ",
    EMAIL: "E-mail",
    PHONE: "Telefone",
    RANDOM: "Chave Aleatória"
};

const pixKeyTypeIcons: Record<PixKeyType, string> = {
    CPF: "👤",
    CNPJ: "🏢",
    EMAIL: "📧",
    PHONE: "📱",
    RANDOM: "🔑"
};

export default function PixKeyDisplay({ pixKey, pixKeyType }: PixKeyDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(pixKey);
            setCopied(true);
            toast.success('Chave PIX copiada!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Erro ao copiar chave PIX');
        }
    };

    return (
        <div className="bg-gradient-to-br from-[#ff914d]/10 to-[#ff7b33]/5 rounded-xl p-6 border border-[#ff914d]/20">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{pixKeyTypeIcons[pixKeyType]}</span>
                <div>
                    <p className="text-sm text-[#191919]/60">Chave PIX</p>
                    <p className="text-xs text-[#191919]/50">{pixKeyTypeLabels[pixKeyType]}</p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-3 border border-gray-200">
                <p className="font-mono text-sm text-[#191919] break-all">
                    {pixKey}
                </p>
            </div>

            <Button
                onClick={handleCopy}
                className="w-full bg-[#ff914d] hover:bg-[#ff7b33]"
                disabled={copied}
            >
                {copied ? (
                    <>
                        <Check className="mr-2 h-4 w-4" />
                        Copiado!
                    </>
                ) : (
                    <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Chave PIX
                    </>
                )}
            </Button>

            <p className="text-xs text-[#191919]/50 mt-3 text-center">
                Após realizar o pagamento, envie o comprovante abaixo
            </p>
        </div>
    );
}
