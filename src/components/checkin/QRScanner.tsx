import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => Promise<void>;
    isProcessing?: boolean;
}

export default function QRScanner({ onScanSuccess, isProcessing }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [lastScan, setLastScan] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const qrCodeRegionId = 'qr-reader';

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, []);

    const startScanning = async () => {
        try {
            setCameraError(null);
            
            // Inicializar scanner
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrCodeRegionId, false);
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                verbose: false
            };

            await scannerRef.current.start(
                { facingMode: 'environment' }, // Câmera traseira no mobile
                config,
                async (decodedText) => {
                    // Evitar múltiplos scans do mesmo QR Code
                    if (decodedText === lastScan || isProcessing) {
                        return;
                    }

                    setLastScan(decodedText);
                    
                    // Chamar callback de sucesso
                    await onScanSuccess(decodedText);

                    // Resetar após 2 segundos para permitir novo scan
                    setTimeout(() => setLastScan(null), 2000);
                },
                () => {
                    // Ignorar erros de scan (quando não detecta QR Code)
                }
            );

            setIsScanning(true);
        } catch (error) {
            console.error('Erro ao iniciar scanner:', error);
            setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    };

    const stopScanning = async () => {
        try {
            if (scannerRef.current && isScanning) {
                await scannerRef.current.stop();
                setIsScanning(false);
            }
        } catch (error) {
            console.error('Erro ao parar scanner:', error);
        }
    };

    const toggleScanning = () => {
        if (isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    };

    return (
        <div className="space-y-4">
            {/* Container do Scanner */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 z-10">
                        <div className="text-center text-white p-6">
                            <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-semibold mb-2">Scanner Desativado</p>
                            <p className="text-sm opacity-75">Clique no botão abaixo para iniciar</p>
                        </div>
                    </div>
                )}

                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 z-20 backdrop-blur-sm">
                        <div className="text-center text-white p-6">
                            <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin" />
                            <p className="text-lg font-semibold">Validando ingresso...</p>
                        </div>
                    </div>
                )}

                <div 
                    id={qrCodeRegionId} 
                    className="w-full"
                    style={{ minHeight: '300px' }}
                />
            </div>

            {/* Erro de Câmera */}
            {cameraError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-red-900 mb-1">Erro ao Acessar Câmera</p>
                        <p className="text-sm text-red-700">{cameraError}</p>
                    </div>
                </div>
            )}

            {/* Botão de Controle */}
            <Button
                onClick={toggleScanning}
                disabled={isProcessing}
                className={`w-full h-14 text-lg font-semibold ${
                    isScanning
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-[#ff914d] hover:bg-[#ff7b33]'
                }`}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                    </>
                ) : isScanning ? (
                    <>
                        <CameraOff className="mr-2 h-5 w-5" />
                        Parar Scanner
                    </>
                ) : (
                    <>
                        <Camera className="mr-2 h-5 w-5" />
                        Iniciar Scanner
                    </>
                )}
            </Button>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-semibold text-blue-900 mb-2">Como usar:</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Posicione o QR Code do ingresso dentro do quadrado</li>
                            <li>• Mantenha o dispositivo estável</li>
                            <li>• O scan é automático ao detectar o código</li>
                            <li>• Aguarde a confirmação antes do próximo scan</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
