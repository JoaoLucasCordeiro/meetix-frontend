import { Upload, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface PaymentProofUploadProps {
    onUpload: (url: string) => void;
    isLoading: boolean;
    currentProofUrl?: string;
}

export default function PaymentProofUpload({ onUpload, isLoading, currentProofUrl }: PaymentProofUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentProofUrl || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas imagens (JPG, PNG)');
            return;
        }

        // Validar tamanho (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB');
            return;
        }

        // Criar preview local
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Simular upload (você deve implementar upload real para S3/Cloudinary)
        setUploading(true);
        try {
            // TODO: Implementar upload real
            // const formData = new FormData();
            // formData.append('file', file);
            // const response = await uploadService.upload(formData);
            // const url = response.data.url;
            
            // Por ora, usar URL simulada (imgur, cloudinary, etc)
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay
            const fakeUrl = `https://example.com/uploads/${file.name}`;
            
            onUpload(fakeUrl);
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload. Tente novamente.');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-[#191919] mb-2">
                    Comprovante de Pagamento *
                </label>
                <p className="text-xs text-[#191919]/60 mb-3">
                    Envie o comprovante do pagamento PIX (JPG ou PNG, máx 5MB)
                </p>

                {!preview ? (
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="proof-upload"
                            disabled={isLoading || uploading}
                        />
                        <label
                            htmlFor="proof-upload"
                            className={`
                                flex flex-col items-center justify-center
                                border-2 border-dashed border-gray-300
                                rounded-xl p-8 cursor-pointer
                                hover:border-[#ff914d] hover:bg-[#ff914d]/5
                                transition-all duration-200
                                ${(isLoading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-12 w-12 text-[#ff914d] animate-spin mb-3" />
                                    <p className="text-sm text-[#191919]/70">Enviando...</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                                    <p className="text-sm font-semibold text-[#191919] mb-1">
                                        Clique para selecionar o comprovante
                                    </p>
                                    <p className="text-xs text-[#191919]/50">
                                        JPG, PNG (máx. 5MB)
                                    </p>
                                </>
                            )}
                        </label>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <img
                                src={preview}
                                alt="Comprovante de pagamento"
                                className="w-full h-64 object-contain bg-gray-50"
                            />
                        </div>
                        <Button
                            onClick={handleRemove}
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-white"
                            disabled={isLoading}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Remover
                        </Button>
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                            <ImageIcon className="h-4 w-4" />
                            <span>Comprovante carregado com sucesso</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
