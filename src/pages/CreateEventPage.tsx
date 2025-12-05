import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Image as ImageIcon,
    X,
    Save,
    FileText,
    Tag,
    Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import EventsLayout from "@/components/layouts/EventsLayouts";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI } from "@/lib/api";
import type { EventType } from "@/types/event";
import type { ApiError } from "@/types/auth";

export default function CreateEventPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isFree, setIsFree] = useState(true);
    const [isRemote, setIsRemote] = useState(false);
    const [generateCertificate, setGenerateCertificate] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [pixKeyError, setPixKeyError] = useState<string>("");
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    
    // Form states
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "" as EventType | "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        eventUrl: "",
        maxParticipants: "",
        price: "",
        imgUrl: "",
        pixKey: "",
        pixKeyType: "CPF" as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validate PIX key when it changes
        if (field === "pixKey") {
            validatePixKey(value, formData.pixKeyType);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, imgUrl: url }));
        if (url) {
            setImagePreview(url);
            setUploadedImageFile(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Formato inválido. Use PNG ou JPEG.');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Imagem muito grande. Tamanho máximo: 5MB.');
            return;
        }

        setIsProcessingImage(true);

        // Compress and resize image
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Create canvas for resizing
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        toast.error('Erro ao processar imagem.');
                        setIsProcessingImage(false);
                        return;
                    }

                    // Max dimensions for event images (reduced for better compression)
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 600;

                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions maintaining aspect ratio
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width = Math.round((width * MAX_HEIGHT) / height);
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Draw resized image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to base64 with higher compression (0.5 quality)
                    let compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);

                    // Check final size and compress more if needed
                    let sizeInKB = Math.round((compressedBase64.length * 3) / 4 / 1024);

                    // If still too large, compress even more
                    if (sizeInKB > 200) {
                        compressedBase64 = canvas.toDataURL('image/jpeg', 0.3);
                        sizeInKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
                    }

                    console.log(`Imagem comprimida: ${sizeInKB}KB, ${compressedBase64.length} caracteres`);

                    if (sizeInKB > 300) {
                        toast.warning(`Imagem processada: ${sizeInKB}KB. Pode demorar um pouco para salvar.`);
                    }

                    setImagePreview(compressedBase64);
                    setUploadedImageFile(file);
                    setFormData(prev => ({ ...prev, imgUrl: '' }));
                    toast.success('Imagem processada com sucesso!');
                } catch (error) {
                    console.error('Error processing image:', error);
                    toast.error('Erro ao processar imagem.');
                } finally {
                    setIsProcessingImage(false);
                }
            };
            img.onerror = () => {
                toast.error('Erro ao carregar imagem.');
                setIsProcessingImage(false);
            };
            img.src = e.target?.result as string;
        };
        reader.onerror = () => {
            toast.error('Erro ao ler arquivo.');
            setIsProcessingImage(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setUploadedImageFile(null);
        setFormData(prev => ({ ...prev, imgUrl: '' }));
    };

    const handlePixKeyTypeChange = (value: string) => {
        handleInputChange("pixKeyType", value);
        // Re-validate current PIX key with new type
        if (formData.pixKey) {
            validatePixKey(formData.pixKey, value as typeof formData.pixKeyType);
        }
    };

    const validatePixKey = (key: string, type: typeof formData.pixKeyType): boolean => {
        if (!key.trim()) {
            setPixKeyError("");
            return true;
        }

        const patterns = {
            CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
            CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/,
            EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            PHONE: /^\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$|^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$|^\d{10,11}$/,
            RANDOM: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
        };

        const errorMessages = {
            CPF: "CPF inválido. Use o formato: 123.456.789-00 ou 12345678900",
            CNPJ: "CNPJ inválido. Use o formato: 12.345.678/0001-00 ou 12345678000100",
            EMAIL: "E-mail inválido. Use o formato: exemplo@email.com",
            PHONE: "Telefone inválido. Use o formato: (11) 98765-4321 ou 11987654321",
            RANDOM: "Chave aleatória inválida. Use o formato UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        };

        const isValid = patterns[type].test(key);
        setPixKeyError(isValid ? "" : errorMessages[type]);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated || !user) {
            toast.error('Você precisa estar logado para criar um evento');
            navigate('/login');
            return;
        }

        // Validações
        if (!formData.title.trim()) {
            toast.error('O título do evento é obrigatório');
            return;
        }

        if (!formData.description.trim()) {
            toast.error('A descrição do evento é obrigatória');
            return;
        }

        if (!formData.category) {
            toast.error('Selecione uma categoria para o evento');
            return;
        }

        if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
            toast.error('Preencha as datas e horários de início e término do evento');
            return;
        }

        if (!isRemote && !formData.location.trim()) {
            toast.error('O local do evento é obrigatório para eventos presenciais');
            return;
        }

        if (isRemote && !formData.eventUrl.trim()) {
            toast.error('A URL do evento é obrigatória para eventos remotos');
            return;
        }

        if (!formData.maxParticipants || parseInt(formData.maxParticipants) < 1) {
            toast.error('Defina um número válido de participantes');
            return;
        }

        if (!isFree && (!formData.price || parseFloat(formData.price) <= 0)) {
            toast.error('Defina um preço válido para o evento pago');
            return;
        }

        if (!isFree && !formData.pixKey.trim()) {
            toast.error('A chave PIX é obrigatória para eventos pagos');
            return;
        }

        if (!isFree && formData.pixKey.trim() && !validatePixKey(formData.pixKey, formData.pixKeyType)) {
            toast.error('Chave PIX inválida. Verifique o formato da chave.');
            return;
        }

        setIsLoading(true);

        try {
            // Combinar data e horários em formato ISO 8601
            const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
            const endDateTime = `${formData.endDate}T${formData.endTime}:00`;

            // Validar que data/horário de término é após o início
            if (new Date(endDateTime) <= new Date(startDateTime)) {
                toast.error('A data e horário de término devem ser após a data e horário de início');
                setIsLoading(false);
                return;
            }

            // Preparar dados para envio
            // Use base64 if file was uploaded, otherwise use URL
            const imageUrl = uploadedImageFile
                ? (imagePreview || undefined)
                : (formData.imgUrl?.trim() || undefined);

            const eventData = {
                eventType: formData.category as EventType,
                title: formData.title.trim(),
                description: formData.description.trim(),
                startDateTime,
                endDateTime,
                location: isRemote ? undefined : formData.location.trim(),
                eventUrl: isRemote ? formData.eventUrl.trim() : undefined,
                imgUrl: imageUrl,
                remote: isRemote,
                maxAttendees: parseInt(formData.maxParticipants),
                isPaid: !isFree,
                price: isFree ? undefined : parseFloat(formData.price),
                pixKey: (!isFree && formData.pixKey.trim()) ? formData.pixKey.trim() : undefined,
                pixKeyType: (!isFree && formData.pixKey.trim()) ? formData.pixKeyType : undefined,
                organizerId: user.id,
                generateCertificate: generateCertificate,
            };

            console.log('=== CRIANDO EVENTO ===');
            console.log('eventType:', eventData.eventType);
            console.log('title:', eventData.title);
            console.log('description:', eventData.description);
            console.log('startDateTime:', eventData.startDateTime);
            console.log('endDateTime:', eventData.endDateTime);
            console.log('location:', eventData.location);
            console.log('eventUrl:', eventData.eventUrl);
            console.log('remote:', eventData.remote);
            console.log('maxAttendees:', eventData.maxAttendees);
            console.log('isPaid:', eventData.isPaid);
            console.log('price:', eventData.price);
            console.log('pixKey:', eventData.pixKey);
            console.log('pixKeyType:', eventData.pixKeyType);
            console.log('organizerId:', eventData.organizerId);
            console.log('generateCertificate:', eventData.generateCertificate);
            console.log('imgUrl:', eventData.imgUrl ? `[BASE64 IMAGE - ${eventData.imgUrl.length} chars]` : 'undefined');
            console.log('======================');

            const createdEvent = await eventsAPI.createEvent(eventData);

            toast.success('Evento criado com sucesso!');
            navigate(`/eventos/${createdEvent.id}`);
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            const apiError = error as ApiError;

            if (apiError.status === 400) {
                toast.error(apiError.message || 'Dados inválidos. Verifique os campos preenchidos.');
            } else if (apiError.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                navigate('/login');
            } else if (apiError.status === 500) {
                console.error('Erro 500 detalhes:', {
                    message: apiError.message,
                    status: apiError.status,
                    error: apiError
                });
                toast.error(
                    `Erro no servidor ao criar evento. ${apiError.message || 'Verifique os logs do backend.'}`,
                    { autoClose: 7000 }
                );
            } else {
                toast.error(apiError.message || 'Erro ao criar evento. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <EventsLayout>
            <div className="container mx-auto px-6 py-12 max-w-4xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-[#ff914d]/10 rounded-full">
                            <Calendar className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Criar Novo <span className="text-[#ff914d]">Evento</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Preencha as informações abaixo para criar seu evento acadêmico
                    </p>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                >
                    {/* Informações Básicas */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <FileText className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Informações Básicas
                        </h2>

                        <div className="space-y-6">
                            {/* Título */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-[#191919] font-semibold">
                                    Título do Evento *
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    placeholder="Ex: Workshop de Inteligência Artificial"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[#191919] font-semibold">
                                    Descrição *
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Descreva seu evento de forma detalhada..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    className="min-h-32 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            {/* Categoria */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-[#191919] font-semibold">
                                    Categoria *
                                </Label>
                                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                                    <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]">
                                        <SelectValue placeholder="Selecione uma categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                        <SelectItem value="FESTA">Festa</SelectItem>
                                        <SelectItem value="PALESTRA">Palestra</SelectItem>
                                        <SelectItem value="MINICURSO">Minicurso</SelectItem>
                                        <SelectItem value="OUTRO">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </section>

                    {/* Data e Horário */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Calendar className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Data e Horário
                        </h2>

                        <div className="space-y-6">
                            {/* Início do Evento */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#191919] mb-4">Início do Evento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="startDate" className="text-[#191919] font-semibold">
                                            Data de Início *
                                        </Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => handleInputChange("startDate", e.target.value)}
                                            className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="startTime" className="text-[#191919] font-semibold">
                                            Hora de Início *
                                        </Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) => handleInputChange("startTime", e.target.value)}
                                            className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Término do Evento */}
                            <div>
                                <h3 className="text-lg font-semibold text-[#191919] mb-4">Término do Evento</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="endDate" className="text-[#191919] font-semibold">
                                            Data de Término *
                                        </Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => handleInputChange("endDate", e.target.value)}
                                            className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="endTime" className="text-[#191919] font-semibold">
                                            Hora de Término *
                                        </Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={formData.endTime}
                                            onChange={(e) => handleInputChange("endTime", e.target.value)}
                                            className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Opções Adicionais (Movido para antes de Localização) */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Tag className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Tipo de Evento
                        </h2>

                        <div className="space-y-4">
                            {/* Evento Remoto */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="isRemote"
                                    checked={isRemote}
                                    onCheckedChange={(checked) => setIsRemote(checked === true)}
                                    className="border-gray-300 data-[state=checked]:bg-[#ff914d] data-[state=checked]:border-[#ff914d]"
                                />
                                <Label htmlFor="isRemote" className="text-[#191919] font-semibold cursor-pointer">
                                    Evento Remoto (Online)
                                </Label>
                            </div>

                            {/* Gerar Certificado */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="generateCertificate"
                                    checked={generateCertificate}
                                    onCheckedChange={(checked) => setGenerateCertificate(checked === true)}
                                    className="border-gray-300 data-[state=checked]:bg-[#ff914d] data-[state=checked]:border-[#ff914d]"
                                />
                                <Label htmlFor="generateCertificate" className="text-[#191919] font-semibold cursor-pointer">
                                    Gerar Certificado para Participantes
                                </Label>
                            </div>
                        </div>
                    </section>

                    {/* Localização e Participantes */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <MapPin className="h-6 w-6 mr-3 text-[#ff914d]" />
                            {isRemote ? 'URL do Evento e Capacidade' : 'Localização e Capacidade'}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Localização ou URL do Evento */}
                            {isRemote ? (
                                <div className="space-y-2">
                                    <Label htmlFor="eventUrl" className="text-[#191919] font-semibold">
                                        URL do Evento Online *
                                    </Label>
                                    <Input
                                        id="eventUrl"
                                        type="url"
                                        placeholder="Ex: https://meet.google.com/abc-defg-hij"
                                        value={formData.eventUrl}
                                        onChange={(e) => handleInputChange("eventUrl", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                        required={isRemote}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-[#191919] font-semibold">
                                        Local do Evento *
                                    </Label>
                                    <Input
                                        id="location"
                                        type="text"
                                        placeholder="Ex: Auditório Central - Bloco A"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange("location", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                        required={!isRemote}
                                    />
                                </div>
                            )}

                            {/* Máximo de Participantes */}
                            <div className="space-y-2">
                                <Label htmlFor="maxParticipants" className="text-[#191919] font-semibold">
                                    Número Máximo de Participantes *
                                </Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        placeholder="Ex: 50"
                                        value={formData.maxParticipants}
                                        onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] pl-11"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Valor/Ingresso */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <DollarSign className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Valor do Ingresso
                        </h2>

                        <div className="space-y-6">
                            {/* Checkbox Gratuito */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="isFree"
                                    checked={isFree}
                                    onCheckedChange={(checked) => setIsFree(checked === true)}
                                    className="border-gray-300 data-[state=checked]:bg-[#ff914d] data-[state=checked]:border-[#ff914d]"
                                />
                                <Label htmlFor="isFree" className="text-[#191919] font-semibold cursor-pointer">
                                    Evento Gratuito
                                </Label>
                            </div>

                            {/* Campo de Preço (condicional) */}
                            {!isFree && (
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-[#191919] font-semibold">
                                        Valor do Ingresso (R$) *
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                            R$
                                        </span>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={(e) => handleInputChange("price", e.target.value)}
                                            className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] pl-12"
                                            min="0"
                                            required={!isFree}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Campos PIX (condicional) */}
                            {!isFree && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="pixKeyType" className="text-[#191919] font-semibold">
                                            Tipo de Chave PIX *
                                        </Label>
                                        <Select
                                            value={formData.pixKeyType}
                                            onValueChange={handlePixKeyTypeChange}
                                        >
                                            <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]">
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CPF">CPF</SelectItem>
                                                <SelectItem value="CNPJ">CNPJ</SelectItem>
                                                <SelectItem value="EMAIL">E-mail</SelectItem>
                                                <SelectItem value="PHONE">Telefone</SelectItem>
                                                <SelectItem value="RANDOM">Chave Aleatória</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="pixKey" className="text-[#191919] font-semibold">
                                            Chave PIX *
                                        </Label>
                                        <Input
                                            id="pixKey"
                                            type="text"
                                            placeholder={
                                                formData.pixKeyType === "CPF" ? "123.456.789-00 ou 12345678900" :
                                                formData.pixKeyType === "CNPJ" ? "12.345.678/0001-00 ou 12345678000100" :
                                                formData.pixKeyType === "EMAIL" ? "exemplo@email.com" :
                                                formData.pixKeyType === "PHONE" ? "(11) 98765-4321 ou 11987654321" :
                                                "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            }
                                            value={formData.pixKey}
                                            onChange={(e) => handleInputChange("pixKey", e.target.value)}
                                            className={`h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] ${
                                                pixKeyError ? "border-red-500 focus:border-red-500" : "border-gray-300"
                                            }`}
                                            required={!isFree}
                                        />
                                        {pixKeyError ? (
                                            <p className="text-sm text-red-600 flex items-center gap-1">
                                                {pixKeyError}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                Os participantes usarão esta chave para fazer o pagamento
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Imagem do Evento */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <ImageIcon className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Imagem do Evento (Opcional)
                        </h2>

                        <div className="space-y-6">
                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="imageFile" className="text-[#191919] font-semibold">
                                    Fazer Upload de Imagem
                                </Label>
                                <div className="flex items-center gap-4">
                                    <label
                                        htmlFor="imageFile"
                                        className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#ff914d] hover:bg-[#ff914d]/5 cursor-pointer transition-all"
                                    >
                                        <Upload className="h-5 w-5 text-[#ff914d]" />
                                        <span className="text-sm font-semibold text-[#191919]">
                                            Escolher arquivo
                                        </span>
                                    </label>
                                    <input
                                        id="imageFile"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={isProcessingImage}
                                    />
                                    {isProcessingImage ? (
                                        <span className="text-sm text-[#ff914d] flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff914d]"></div>
                                            Processando imagem...
                                        </span>
                                    ) : uploadedImageFile && (
                                        <span className="text-sm text-[#191919]/70">
                                            {uploadedImageFile.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-[#191919]/60">
                                    PNG ou JPEG, máximo 5MB
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                                <div className="flex-1 border-t border-gray-300"></div>
                                <span className="text-sm text-[#191919]/60 font-semibold">OU</span>
                                <div className="flex-1 border-t border-gray-300"></div>
                            </div>

                            {/* URL Input */}
                            <div className="space-y-2">
                                <Label htmlFor="imgUrl" className="text-[#191919] font-semibold">
                                    URL da Imagem
                                </Label>
                                <Input
                                    id="imgUrl"
                                    type="url"
                                    placeholder="https://exemplo.com/imagem.jpg"
                                    value={formData.imgUrl}
                                    onChange={handleImageChange}
                                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                    disabled={!!uploadedImageFile}
                                />
                                <p className="text-sm text-[#191919]/60">
                                    Cole o link de uma imagem para representar seu evento
                                </p>
                            </div>

                            {/* Preview */}
                            {imagePreview && (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        onError={() => setImagePreview(null)}
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/eventos")}
                            className="flex-1 h-14 text-base border-gray-300 hover:bg-gray-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 h-14 text-base bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] text-white shadow-lg shadow-[#ff914d]/30"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Criando evento...
                                </div>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Criar Evento
                                </>
                            )}
                        </Button>
                    </div>
                </motion.form>
            </div>
        </EventsLayout>
    );
}
