import { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings as SettingsIcon,
    User,
    Mail,
    Lock,
    Camera,
    FileText,
    Shield,
    Palette,
    MessageSquare,
    Phone,
    MapPin,
    Instagram,
    Save,
    Eye,
    EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import EventsLayout from "@/components/layouts/EventsLayouts";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>("https://ui-avatars.com/api/?name=João+Lucas&background=ff914d&color=fff&size=256");
    const [theme, setTheme] = useState("light");

    // User data state
    const [userData, setUserData] = useState({
        name: "João Lucas Silva",
        email: "joao.lucas@universidade.edu.br",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simular salvamento
        setTimeout(() => {
            console.log("Profile saved:", userData);
            setIsLoading(false);
        }, 1500);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simular mudança de senha
        setTimeout(() => {
            console.log("Password changed");
            setUserData(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            }));
            setIsLoading(false);
        }, 1500);
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
                            <SettingsIcon className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Configurações <span className="text-[#ff914d]">da Conta</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Gerencie suas informações pessoais e preferências
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {/* Foto do Perfil */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <User className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Foto do Perfil
                        </h2>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#ff914d]/20 shadow-lg">
                                    <img
                                        src={profileImage || "https://ui-avatars.com/api/?name=User&background=ff914d&color=fff&size=256"}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <label
                                    htmlFor="profile-image"
                                    className="absolute bottom-0 right-0 h-10 w-10 bg-[#ff914d] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#ff7b33] transition-colors shadow-lg group-hover:scale-110 transition-transform"
                                >
                                    <Camera className="h-5 w-5 text-white" />
                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-[#191919] mb-2">
                                    {userData.name}
                                </h3>
                                <p className="text-[#191919]/60 mb-4">{userData.email}</p>
                                <p className="text-sm text-[#191919]/70">
                                    Clique no ícone da câmera para alterar sua foto de perfil.
                                    Recomendamos uma imagem quadrada de pelo menos 256x256px.
                                </p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Informações Pessoais */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Mail className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Informações Pessoais
                        </h2>

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[#191919] font-semibold">
                                    Nome Completo
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={userData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[#191919] font-semibold">
                                    E-mail Acadêmico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                />
                                <p className="text-sm text-[#191919]/60">
                                    Ao alterar seu e-mail, você precisará verificá-lo novamente.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#ff914d] hover:bg-[#ff7b33] shadow-lg shadow-[#ff914d]/30"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Salvando...
                                    </div>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-5 w-5" />
                                        Salvar Alterações
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.section>

                    {/* Segurança - Alterar Senha */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Lock className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Segurança
                        </h2>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword" className="text-[#191919] font-semibold">
                                    Senha Atual
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={userData.currentPassword}
                                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] pr-12"
                                        placeholder="Digite sua senha atual"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#ff914d]"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-[#191919] font-semibold">
                                    Nova Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={userData.newPassword}
                                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                        className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d] pr-12"
                                        placeholder="Digite sua nova senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#ff914d]"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-[#191919] font-semibold">
                                    Confirmar Nova Senha
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={userData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]"
                                    placeholder="Confirme sua nova senha"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#ff914d] hover:bg-[#ff7b33] shadow-lg shadow-[#ff914d]/30"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Alterando...
                                    </div>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-5 w-5" />
                                        Alterar Senha
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.section>

                    {/* Aparência - Tema */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <Palette className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Aparência
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="theme" className="text-[#191919] font-semibold">
                                    Tema do Sistema
                                </Label>
                                <Select value={theme} onValueChange={setTheme}>
                                    <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:ring-2 focus:ring-[#ff914d]">
                                        <SelectValue placeholder="Selecione um tema" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">☀️ Claro</SelectItem>
                                        <SelectItem value="dark">🌙 Escuro</SelectItem>
                                        <SelectItem value="system">💻 Sistema</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-[#191919]/60">
                                    Escolha como o Meetix aparece para você. O tema do sistema ajusta automaticamente
                                    com base nas configurações do seu dispositivo.
                                </p>
                            </div>

                            {/* Preview dos temas */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-white">
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <p className="text-sm text-center mt-4 font-semibold text-[#191919]">Claro</p>
                                </div>
                                <div className="border-2 border-gray-700 rounded-xl p-4 bg-gray-900">
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                    <p className="text-sm text-center mt-4 font-semibold text-white">Escuro</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Termos e Políticas */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <FileText className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Documentos Legais
                        </h2>

                        <div className="space-y-4">
                            <Link
                                to="/termos-de-uso"
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#ff914d] hover:bg-[#ff914d]/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#ff914d]/10 rounded-lg group-hover:bg-[#ff914d]/20 transition-colors">
                                        <FileText className="h-5 w-5 text-[#ff914d]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#191919]">Termos de Uso</p>
                                        <p className="text-sm text-[#191919]/60">
                                            Leia os termos de uso da plataforma
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className="h-5 w-5 text-gray-400 group-hover:text-[#ff914d] transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>

                            <Link
                                to="/politica-de-privacidade"
                                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#ff914d] hover:bg-[#ff914d]/5 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#ff914d]/10 rounded-lg group-hover:bg-[#ff914d]/20 transition-colors">
                                        <Shield className="h-5 w-5 text-[#ff914d]" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#191919]">Política de Privacidade</p>
                                        <p className="text-sm text-[#191919]/60">
                                            Saiba como protegemos seus dados
                                        </p>
                                    </div>
                                </div>
                                <svg
                                    className="h-5 w-5 text-gray-400 group-hover:text-[#ff914d] transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Contato da Equipe */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-gradient-to-br from-[#ff914d]/10 to-[#ff7b33]/5 rounded-2xl p-8 border border-[#ff914d]/20"
                    >
                        <h2 className="text-2xl font-bold text-[#191919] mb-6 flex items-center">
                            <MessageSquare className="h-6 w-6 mr-3 text-[#ff914d]" />
                            Fale com a Equipe
                        </h2>

                        <p className="text-[#191919]/70 mb-6">
                            Precisa de ajuda ou tem alguma sugestão? Entre em contato conosco através dos canais abaixo:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <div className="p-2 bg-[#ff914d]/10 rounded-lg">
                                    <Mail className="h-5 w-5 text-[#ff914d]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#191919]/60">E-mail</p>
                                    <p className="font-semibold text-[#191919]">contato@meetix.com</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <div className="p-2 bg-[#ff914d]/10 rounded-lg">
                                    <Phone className="h-5 w-5 text-[#ff914d]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#191919]/60">Telefone</p>
                                    <p className="font-semibold text-[#191919]">+55 (48) 99999-9999</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <div className="p-2 bg-[#ff914d]/10 rounded-lg">
                                    <MapPin className="h-5 w-5 text-[#ff914d]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#191919]/60">Localização</p>
                                    <p className="font-semibold text-[#191919]">Garanhuns, PE</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl">
                                <div className="p-2 bg-[#ff914d]/10 rounded-lg">
                                    <Instagram className="h-5 w-5 text-[#ff914d]" />
                                </div>
                                <div>
                                    <p className="text-sm text-[#191919]/60">Instagram</p>
                                    <p className="font-semibold text-[#191919]">@meetix.oficial</p>
                                </div>
                            </div>
                        </div>

                        <Link to="/contato">
                            <Button className="w-full mt-6 bg-[#ff914d] hover:bg-[#ff7b33] shadow-lg shadow-[#ff914d]/30">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Enviar Mensagem
                            </Button>
                        </Link>
                    </motion.section>
                </div>
            </div>
        </EventsLayout>
    );
}
