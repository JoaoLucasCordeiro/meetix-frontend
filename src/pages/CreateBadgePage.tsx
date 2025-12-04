import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Download, Loader2, IdCard, Building2, Info, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EventsLayout from "@/components/layouts/EventsLayouts";
import { badgesAPI, eventsAPI, participantsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Event } from "@/types/event";
import type { BadgeRole, BadgeTemplate, Badge } from "@/types/badge";
import type { ApiError } from "@/types/auth";

export default function CreateBadgePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [existingBadge, setExistingBadge] = useState<Badge | null>(null);
    
    const [formData, setFormData] = useState({
        displayName: '',
        role: 'PARTICIPANT' as BadgeRole,
        template: 'MODERN_BLUE' as BadgeTemplate,
        company: '',
        additionalInfo: '',
        photoUrl: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchEventAndCheckRegistration();
    }, [id, isAuthenticated]);

    const fetchEventAndCheckRegistration = async () => {
        if (!id || !user) return;

        try {
            setIsLoading(true);
            
            // Fetch event details
            const eventData = await eventsAPI.getEventById(id);
            setEvent(eventData);

            // Check if user is registered
            const registrationStatus = await participantsAPI.isRegistered(id, user.id);

            if (!registrationStatus.isRegistered) {
                toast.error('Você precisa estar inscrito no evento para criar um crachá');
                navigate(`/eventos/${id}`);
                return;
            }

            // Pre-fill form with user data
            setFormData(prev => ({
                ...prev,
                displayName: `${user.firstName} ${user.lastName}`,
                company: user.university || '',
                additionalInfo: user.course || '',
            }));

            // Check if badge already exists (we'll need to add this endpoint or handle via error)
            // For now, we'll handle it when creating

        } catch (error) {
            console.error('Error fetching data:', error);
            const apiError = error as ApiError;
            toast.error(apiError.message || 'Erro ao carregar informações do evento');
            navigate('/eventos');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!id || !user) return;

        // Validation
        if (!formData.displayName.trim()) {
            toast.error('Nome de exibição é obrigatório');
            return;
        }

        if (formData.displayName.length > 100) {
            toast.error('Nome de exibição deve ter no máximo 100 caracteres');
            return;
        }

        if (formData.company && formData.company.length > 100) {
            toast.error('Nome da empresa deve ter no máximo 100 caracteres');
            return;
        }

        if (formData.additionalInfo && formData.additionalInfo.length > 500) {
            toast.error('Informações adicionais devem ter no máximo 500 caracteres');
            return;
        }

        try {
            setIsSubmitting(true);

            const badgeData = {
                userId: user.id,
                displayName: formData.displayName,
                role: formData.role,
                template: formData.template,
                ...(formData.company && { company: formData.company }),
                ...(formData.additionalInfo && { additionalInfo: formData.additionalInfo }),
                ...(formData.photoUrl && { photoUrl: formData.photoUrl }),
            };

            const createdBadge = await badgesAPI.createBadge(id, badgeData);
            setExistingBadge(createdBadge);
            
            toast.success('Crachá criado com sucesso!');
        } catch (error) {
            console.error('Error creating badge:', error);
            const apiError = error as ApiError;
            
            if (apiError.status === 409) {
                toast.info('Você já possui um crachá para este evento');
                // Could fetch existing badge here if backend provides that endpoint
            } else {
                toast.error(apiError.message || 'Erro ao criar crachá');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownload = async () => {
        if (!existingBadge) return;

        try {
            setIsDownloading(true);
            
            const blob = await badgesAPI.downloadBadgePDF(existingBadge.badgeId);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `cracha-${existingBadge.badgeId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success('Crachá baixado com sucesso!');
        } catch (error) {
            console.error('Error downloading badge:', error);
            toast.error('Erro ao baixar crachá');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <EventsLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#ff914d]" />
                </div>
            </EventsLayout>
        );
    }

    if (!event) {
        return (
            <EventsLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <p>Evento não encontrado</p>
                </div>
            </EventsLayout>
        );
    }

    return (
        <EventsLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(`/eventos/${id}`)}
                            className="mb-4 hover:bg-white/50"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar para o Evento
                        </Button>
                        
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                                    <IdCard className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Criar Crachá</h1>
                                    <p className="text-gray-600 mt-1">{event.title}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success State - Badge Created */}
                    {existingBadge ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <div className="text-center">
                                <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                    <IdCard className="h-10 w-10 text-green-600" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Crachá Criado com Sucesso!
                                </h2>
                                <p className="text-gray-600 mb-8">
                                    Seu crachá para o evento está pronto. Faça o download para apresentar no dia do evento.
                                </p>

                                {/* Badge Info */}
                                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                                    <div className="grid gap-4">
                                        <div>
                                            <Label className="text-gray-600 text-sm">Nome</Label>
                                            <p className="text-gray-900 font-semibold">{existingBadge.displayName}</p>
                                        </div>
                                        <div>
                                            <Label className="text-gray-600 text-sm">Função</Label>
                                            <p className="text-gray-900 font-semibold">{existingBadge.role}</p>
                                        </div>
                                        {existingBadge.company && (
                                            <div>
                                                <Label className="text-gray-600 text-sm">Empresa/Instituição</Label>
                                                <p className="text-gray-900 font-semibold">{existingBadge.company}</p>
                                            </div>
                                        )}
                                        <div>
                                            <Label className="text-gray-600 text-sm">Template</Label>
                                            <p className="text-gray-900 font-semibold">{existingBadge.template}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 text-lg shadow-lg"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Baixando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-5 w-5" />
                                            Baixar Crachá (PDF)
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Form - Create Badge */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg p-8"
                        >
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Display Name */}
                                <div>
                                    <Label htmlFor="displayName" className="flex items-center gap-2 mb-2">
                                        <IdCard className="h-4 w-4" />
                                        Nome de Exibição *
                                    </Label>
                                    <Input
                                        id="displayName"
                                        value={formData.displayName}
                                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                                        placeholder="Como seu nome aparecerá no crachá"
                                        maxLength={100}
                                        required
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formData.displayName.length}/100 caracteres
                                    </p>
                                </div>

                                {/* Role */}
                                <div>
                                    <Label htmlFor="role" className="flex items-center gap-2 mb-2">
                                        <IdCard className="h-4 w-4" />
                                        Função *
                                    </Label>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="PARTICIPANT">Participante</option>
                                        <option value="SPEAKER">Palestrante</option>
                                        <option value="VOLUNTEER">Voluntário</option>
                                        <option value="VIP">VIP</option>
                                        <option value="STAFF">Equipe</option>
                                        <option value="ORGANIZER">Organizador</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>

                                {/* Template */}
                                <div>
                                    <Label htmlFor="template" className="flex items-center gap-2 mb-2">
                                        <Camera className="h-4 w-4" />
                                        Template de Design
                                    </Label>
                                    <select
                                        id="template"
                                        value={formData.template}
                                        onChange={(e) => handleInputChange('template', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    >
                                        <option value="MODERN_BLUE">Moderno Azul</option>
                                        <option value="ELEGANT_BLACK">Elegante Preto</option>
                                        <option value="MINIMALIST">Minimalista</option>
                                        <option value="COLORFUL">Colorido</option>
                                        <option value="CORPORATE">Corporativo</option>
                                    </select>
                                </div>

                                {/* Company */}
                                <div>
                                    <Label htmlFor="company" className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-4 w-4" />
                                        Empresa/Instituição
                                    </Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder="Ex: Universidade Federal de Pernambuco"
                                        maxLength={100}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formData.company.length}/100 caracteres
                                    </p>
                                </div>

                                {/* Additional Info */}
                                <div>
                                    <Label htmlFor="additionalInfo" className="flex items-center gap-2 mb-2">
                                        <Info className="h-4 w-4" />
                                        Informações Adicionais
                                    </Label>
                                    <Textarea
                                        id="additionalInfo"
                                        value={formData.additionalInfo}
                                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                        placeholder="Ex: Ciência da Computação, Desenvolvedor Backend"
                                        maxLength={500}
                                        rows={3}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formData.additionalInfo.length}/500 caracteres
                                    </p>
                                </div>

                                {/* Photo URL */}
                                <div>
                                    <Label htmlFor="photoUrl" className="flex items-center gap-2 mb-2">
                                        <Camera className="h-4 w-4" />
                                        URL da Foto (Opcional)
                                    </Label>
                                    <Input
                                        id="photoUrl"
                                        value={formData.photoUrl}
                                        onChange={(e) => handleInputChange('photoUrl', e.target.value)}
                                        placeholder="https://exemplo.com/foto.jpg"
                                        type="url"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Cole o link de uma foto sua para aparecer no crachá
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-6 text-lg shadow-lg"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Criando Crachá...
                                            </>
                                        ) : (
                                            <>
                                                <IdCard className="mr-2 h-5 w-5" />
                                                Criar Crachá
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Info Box */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
                    >
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Informações Importantes
                        </h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• O crachá será gerado em formato PDF para impressão</li>
                            <li>• Apresente seu crachá no dia do evento para facilitar o check-in</li>
                            <li>• Você pode personalizar as informações e escolher um template de design</li>
                            <li>• O QR Code no crachá contém suas informações de participação</li>
                        </ul>
                    </motion.div>
                </motion.div>
            </div>
        </EventsLayout>
    );
}
