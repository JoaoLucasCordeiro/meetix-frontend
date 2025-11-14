import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Image as ImageIcon,
    Plus,
    X,
    Save,
    Clock,
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

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFree, setIsFree] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    // Form states
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        maxParticipants: "",
        price: "",
        image: null as File | null
    });

    // Requirements list
    const [requirements, setRequirements] = useState<string[]>([""]);
    
    // Schedule items
    const [schedule, setSchedule] = useState<Array<{ time: string; activity: string }>>([
        { time: "", activity: "" }
    ]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addRequirement = () => {
        setRequirements([...requirements, ""]);
    };

    const updateRequirement = (index: number, value: string) => {
        const updated = [...requirements];
        updated[index] = value;
        setRequirements(updated);
    };

    const removeRequirement = (index: number) => {
        setRequirements(requirements.filter((_, i) => i !== index));
    };

    const addScheduleItem = () => {
        setSchedule([...schedule, { time: "", activity: "" }]);
    };

    const updateScheduleItem = (index: number, field: "time" | "activity", value: string) => {
        const updated = [...schedule];
        updated[index][field] = value;
        setSchedule(updated);
    };

    const removeScheduleItem = (index: number) => {
        setSchedule(schedule.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simular envio
        setTimeout(() => {
            console.log("Form Data:", formData);
            console.log("Requirements:", requirements);
            console.log("Schedule:", schedule);
            setIsLoading(false);
            navigate("/meus-eventos");
        }, 2000);
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
                            <Plus className="h-6 w-6 text-[#ff914d]" />
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
                                        <SelectItem value="workshop">Workshop</SelectItem>
                                        <SelectItem value="festa">Festa</SelectItem>
                                        <SelectItem value="palestra">Palestra</SelectItem>
                                        <SelectItem value="minicurso">Minicurso</SelectItem>
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
                        </div>
                    </section>

                    {/* Imagem do Evento */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <ImageIcon className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Imagem do Evento
                        </h2>

                        <div className="space-y-4">
                            {/* Upload Input */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#ff914d] transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <label htmlFor="image" className="cursor-pointer">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-[#191919] font-semibold mb-2">
                                        Clique para fazer upload da imagem
                                    </p>
                                    <p className="text-sm text-[#191919]/60">
                                        PNG, JPG ou JPEG (máx. 5MB)
                                    </p>
                                </label>
                            </div>

                            {/* Preview */}
                            {imagePreview && (
                                <div className="relative rounded-xl overflow-hidden">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-64 object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setFormData(prev => ({ ...prev, image: null }));
                                        }}
                                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Requisitos (Opcional) */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Tag className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Requisitos (Opcional)
                        </h2>

                        <div className="space-y-4">
                            {requirements.map((req, index) => (
                                <div key={index} className="flex gap-3">
                                    <Input
                                        type="text"
                                        placeholder="Ex: Notebook próprio"
                                        value={req}
                                        onChange={(e) => updateRequirement(index, e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                    />
                                    {requirements.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeRequirement(index)}
                                            className="h-12 px-4 border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addRequirement}
                                className="w-full border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Adicionar Requisito
                            </Button>
                        </div>
                    </section>

                    {/* Programação (Opcional) */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Clock className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Programação do Evento (Opcional)
                        </h2>

                        <div className="space-y-4">
                            {schedule.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input
                                        type="time"
                                        placeholder="Horário"
                                        value={item.time}
                                        onChange={(e) => updateScheduleItem(index, "time", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                    />
                                    <Input
                                        type="text"
                                        placeholder="Atividade"
                                        value={item.activity}
                                        onChange={(e) => updateScheduleItem(index, "activity", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] md:col-span-2"
                                    />
                                    {schedule.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => removeScheduleItem(index)}
                                            className="h-12 px-4 border-red-300 text-red-600 hover:bg-red-50 md:col-span-3"
                                        >
                                            <X className="h-5 w-5 mr-2" />
                                            Remover
                                        </Button>
                                    )}
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addScheduleItem}
                                className="w-full border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Adicionar Item à Programação
                            </Button>
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
