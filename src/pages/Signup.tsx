import { Eye, EyeOff, User, Mail, Lock, Book, Instagram, GraduationCap, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiError } from "@/types/auth";

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        instagram: "",
        university: "",
        course: "",
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validação de campos obrigatórios
        if (!formData.firstName.trim()) {
            toast.error('Por favor, insira seu primeiro nome');
            setIsLoading(false);
            return;
        }

        if (!formData.lastName.trim()) {
            toast.error('Por favor, insira seu sobrenome');
            setIsLoading(false);
            return;
        }

        if (!formData.email.trim()) {
            toast.error('Por favor, insira seu e-mail');
            setIsLoading(false);
            return;
        }

        // Validação de formato de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Por favor, insira um e-mail válido');
            setIsLoading(false);
            return;
        }

        if (!formData.password.trim()) {
            toast.error('Por favor, insira uma senha');
            setIsLoading(false);
            return;
        }

        // Validação de senha forte
        if (formData.password.length < 6) {
            toast.error('A senha deve ter no mínimo 6 caracteres');
            setIsLoading(false);
            return;
        }

        if (!formData.university.trim()) {
            toast.error('Por favor, insira sua universidade');
            setIsLoading(false);
            return;
        }

        if (!formData.course.trim()) {
            toast.error('Por favor, insira seu curso');
            setIsLoading(false);
            return;
        }

        if (!acceptedTerms) {
            toast.error('Você precisa aceitar os Termos de Serviço para continuar');
            setIsLoading(false);
            return;
        }

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                instagram: formData.instagram || undefined,
                university: formData.university,
                course: formData.course,
            });
            toast.success('Conta criada com sucesso! Bem-vindo(a) ao Zuê! 🎉');
            // Redirect to events page after successful registration
            setTimeout(() => navigate("/eventos"), 1000);
        } catch (err) {
            const apiError = err as ApiError;
            
            // Tratamento específico de erros
            if (apiError.status === 409) {
                toast.error('Este e-mail já está cadastrado. Tente fazer login.');
            } else if (apiError.status === 400) {
                toast.error('Dados inválidos. Verifique os campos e tente novamente.');
            } else if (apiError.status === 0) {
                toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
            } else if (apiError.status && apiError.status >= 500) {
                toast.error('Erro no servidor. Tente novamente mais tarde.');
            } else {
                toast.error(apiError.message || 'Erro ao criar conta. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#ff914d]/20 rounded-full filter blur-3xl"></div>
                <div className="absolute top-1/4 -right-20 w-60 h-60 bg-[#ff914d]/10 rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#ff7b33]/15 rounded-full filter blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                {/* Card de Cadastro com efeito glassy */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/70 shadow-xl overflow-hidden">
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                                     <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center justify-center p-3 mb-4"
                            >
                                <img
                                    src="/logo.png"
                                    alt="Zuê Logo"
                                    className="
                    h-24 w-auto
                    md:h-32
                    lg:h-40
                    transition-all duration-300
                    max-h-[20vw]
                "
                                    style={{ maxWidth: "100%" }}
                                />
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-[#191919] mb-2"
                            >
                                Crie sua conta
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-[#191919]/70"
                            >
                                Junte-se à comunidade acadêmica do Zuê
                            </motion.p>
                        </div>

                        {/* Formulário */}
                        <motion.form
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                {/* Primeiro Nome */}
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-[#191919]">
                                        Primeiro Nome
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="firstName"
                                            type="text"
                                            placeholder="Seu primeiro nome"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            required
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                        />
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                {/* Sobrenome */}
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-[#191919]">
                                        Sobrenome
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="lastName"
                                            type="text"
                                            placeholder="Seu sobrenome"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            required
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                        />
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                {/* Email Acadêmico */}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[#191919]">
                                        E-mail
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="seu.email@universidade.edu.br"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            required
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                {/* Senha */}
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[#191919]">
                                        Senha
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Crie uma senha segura"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 pr-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            required
                                            value={formData.password}
                                            onChange={handleInputChange}
                                        />
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#ff914d]"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Universidade */}
                                <div className="space-y-2">
                                    <Label htmlFor="university" className="text-[#191919]">
                                        Universidade
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="university"
                                            type="text"
                                            placeholder="Ex: UFPE, USP, UNICAMP"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            required
                                            value={formData.university}
                                            onChange={handleInputChange}
                                        />
                                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                {/* Curso */}
                                <div className="space-y-2">
                                    <Label htmlFor="course" className="text-[#191919]">
                                        Curso
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="course"
                                            type="text"
                                            placeholder="Ex: Ciência da Computação"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            required
                                            value={formData.course}
                                            onChange={handleInputChange}
                                        />
                                        <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                {/* Instagram */}
                                <div className="space-y-2">
                                    <Label htmlFor="instagram" className="text-[#191919]">
                                        Instagram (opcional)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="instagram"
                                            type="text"
                                            placeholder="@seuusuario"
                                            className="bg-white/70 border-gray-300 text-[#191919] pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#ff914d] focus:border-transparent"
                                            value={formData.instagram}
                                            onChange={handleInputChange}
                                        />
                                        <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    </div>
                                </div>

                                {/* Termos e Condições - CORRIGIDO */}
                                <div className="flex items-start space-x-3 pt-2">
                                    <Checkbox
                                        id="terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                                        className="mt-1 border-gray-300 data-[state=checked]:bg-[#ff914d] data-[state=checked]:border-[#ff914d]"
                                        required
                                    />
                                    <Label
                                        htmlFor="terms"
                                        className="text-sm text-[#191919]/80 cursor-pointer leading-tight"
                                    >
                                        Concordo com os{" "}
                                        <Link
                                            to="/termos"
                                            className="text-[#ff914d] hover:text-[#ff7b33] underline"
                                        >
                                            Termos de Serviço
                                        </Link>{" "}

                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-[#ff914d]/30 hover:shadow-[#ff914d]/40"
                                disabled={isLoading || !acceptedTerms}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Criando conta...
                                    </div>
                                ) : (
                                    <>
                                        <User className="mr-2 h-5 w-5" />
                                        Criar minha conta
                                    </>
                                )}
                            </Button>
                        </motion.form>

                        {/* Divisor - CORRIGIDO */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="relative my-6"
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-3 text-sm text-gray-500">Já tem uma conta?</span>
                            </div>
                        </motion.div>

                        {/* Link para login - CORRIGIDO */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center"
                        >
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center w-full text-[#ff914d] hover:text-[#ff7b33] font-medium transition-colors border border-[#ff914d] hover:border-[#ff7b33] rounded-xl py-3 px-4"
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Fazer login na minha conta
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Voltar para home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mt-6 text-center"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#ff914d] transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Voltar para a página inicial
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}