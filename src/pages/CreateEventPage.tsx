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
    Tag
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
    
    // Form states
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "" as EventType | "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        maxParticipants: "",
        price: "",
        imgUrl: "",
        pixKey: "",
        pixKeyType: "CPF" as 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM'
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, imgUrl: url }));
        if (url) {
            setImagePreview(url);
        }
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

        if (!formData.date || !formData.startTime || !formData.endTime) {
            toast.error('Preencha data e horários do evento');
            return;
        }

        if (!formData.location.trim()) {
            toast.error('O local do evento é obrigatório');
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

        setIsLoading(true);

        try {
            // Combinar data e horários em formato ISO 8601
            const startDateTime = `${formData.date}T${formData.startTime}:00`;
            const endDateTime = `${formData.date}T${formData.endTime}:00`;

            // Validar que horário de término é após o início
            if (new Date(endDateTime) <= new Date(startDateTime)) {
                toast.error('O horário de término deve ser após o horário de início');
                setIsLoading(false);
                return;
            }

            // Preparar dados para envio
            const eventData = {
                eventType: formData.category as EventType,
                title: formData.title.trim(),
                description: formData.description.trim(),
                startDateTime,
                endDateTime,
                location: formData.location.trim(),
                imgUrl: formData.imgUrl?.trim() || undefined,
                remote: isRemote,
                maxAttendees: parseInt(formData.maxParticipants),
                isPaid: !isFree,
                price: isFree ? undefined : parseFloat(formData.price),
                pixKey: (!isFree && formData.pixKey.trim()) ? formData.pixKey.trim() : undefined,
                pixKeyType: (!isFree && formData.pixKey.trim()) ? formData.pixKeyType : undefined,
                organizerId: user.id,
                generateCertificate: generateCertificate,
            };

            const createdEvent = await eventsAPI.createEvent(eventData);
            
            toast.success('Evento criado com sucesso! 🎉');
            navigate(`/eventos/${createdEvent.id}`);
        } catch (error) {
            const apiError = error as ApiError;
            
            if (apiError.status === 400) {
                toast.error(apiError.message || 'Dados inválidos. Verifique os campos preenchidos.');
            } else if (apiError.status === 401) {
                toast.error('Sessão expirada. Faça login novamente.');
                navigate('/login');
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Data */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-[#191919] font-semibold">
                                    Data *
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange("date", e.target.value)}
                                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                    required
                                />
                            </div>

                            {/* Hora Início */}
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

                            {/* Hora Fim */}
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
                    </section>

                    {/* Localização e Participantes */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <MapPin className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Localização e Capacidade
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Localização */}
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
                                    required
                                />
                            </div>

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
                                            onValueChange={(value) => handleInputChange("pixKeyType", value)}
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
                                            placeholder="Digite sua chave PIX"
                                            value={formData.pixKey}
                                            onChange={(e) => handleInputChange("pixKey", e.target.value)}
                                            className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                            required={!isFree}
                                        />
                                        <p className="text-sm text-gray-500">
                                            Os participantes usarão esta chave para fazer o pagamento
                                        </p>
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

                        <div className="space-y-4">
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
                                        onClick={() => {
                                            setImagePreview(null);
                                            setFormData(prev => ({ ...prev, imgUrl: '' }));
                                        }}
                                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Opções Adicionais */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Tag className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Opções Adicionais
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
