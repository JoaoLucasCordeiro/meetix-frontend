import { useState, useRef, useEffect } from 'react';
import { Keyboard, CheckCircle, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';

interface ManualValidationInputProps {
    onValidate: (code: string) => Promise<void>;
    isProcessing?: boolean;
}

export default function ManualValidationInput({ onValidate, isProcessing }: ManualValidationInputProps) {
    const [code, setCode] = useState('');
    const [isValidFormat, setIsValidFormat] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-foco no input quando componente montar
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        // Validar formato UUID
        const cleanCode = code.trim().toLowerCase();
        const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
        setIsValidFormat(uuidRegex.test(cleanCode));
    }, [code]);

    const handleValidate = async () => {
        if (!isValidFormat || isProcessing) return;

        const cleanCode = code.trim().toLowerCase().replace(/\s+/g, '');
        
        try {
            await onValidate(cleanCode);
            // Limpar input após sucesso
            setCode('');
            inputRef.current?.focus();
        } catch (error) {
            // Erro já tratado no callback
            console.error('Erro na validação:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValidFormat) {
            handleValidate();
        } else if (e.key === 'Escape') {
            setCode('');
            inputRef.current?.focus();
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setCode(text);
            toast.info('Código colado!');
        } catch (error) {
            toast.error('Erro ao colar código');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Keyboard className="h-8 w-8 text-[#ff914d]" />
                    <h3 className="text-2xl font-bold text-[#191919]">Validação Manual</h3>
                </div>
                <p className="text-[#191919]/60">
                    Cole ou digite o código de validação do ingresso
                </p>
            </div>

            {/* Input Area */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            ref={inputRef}
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="exemplo: a1b2c3d4-e5f6-7890-abcd-ef1234567890"
                            disabled={isProcessing}
                            className="w-full px-4 py-6 text-center text-lg font-mono border-2 border-gray-300 focus:border-[#ff914d] rounded-xl disabled:opacity-50"
                        />
                        {isValidFormat && !isProcessing && (
                            <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-green-500" />
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handlePaste}
                            variant="outline"
                            disabled={isProcessing}
                            className="flex-1 py-6 border-2 border-gray-300 hover:border-[#ff914d] hover:bg-[#ff914d]/5 transition-all"
                        >
                            <Copy className="mr-2 h-5 w-5" />
                            Colar Código
                        </Button>

                        <Button
                            onClick={handleValidate}
                            disabled={!isValidFormat || isProcessing}
                            className="flex-1 py-6 bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] text-white font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Validando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Validar Ingresso
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Dicas */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700 mb-2 font-semibold">💡 Dicas:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                        <li>• Pressione <kbd className="px-2 py-1 bg-white rounded border">Enter</kbd> para validar rapidamente</li>
                        <li>• Pressione <kbd className="px-2 py-1 bg-white rounded border">Esc</kbd> para limpar o campo</li>
                        <li>• O código pode ser colado com ou sem hífens</li>
                        <li>• Participante pode copiar o código na página "Meus Ingressos"</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
