import { Calendar, Plus, List, Settings, LogOut, TrendingUp } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            name: "Eventos",
            href: "/eventos",
            icon: Calendar,
            description: "Explore todos os eventos"
        },
        {
            name: "Criar Evento",
            href: "/criar-evento",
            icon: Plus,
            description: "Organize um novo evento"
        },
        {
            name: "Meus Eventos",
            href: "/meus-eventos",
            icon: List,
            description: "Eventos que você participa"
        },
        {
            name: "Opções",
            href: "/opcoes",
            icon: Settings,
            description: "Configurações da conta"
        }
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        // Lógica de logout aqui
        console.log("Logout realizado");
        navigate("/login");
    };

    return (
        <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-lg overflow-y-auto z-40"
        >
            <div className="p-6 space-y-6">
                {/* Logo/Header */}
                <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                    <img
                        src="/logo.png"
                        alt="Meetix Logo"
                        className="h-20 w-auto mb-3"
                    />
                    <p className="text-sm text-[#191919]/70 text-center">
                        Navegue pela plataforma
                    </p>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={item.href}>
                                    <div
                                        className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 cursor-pointer group ${isActive(item.href)
                                                ? "bg-[#ff914d] text-white shadow-lg shadow-[#ff914d]/30"
                                                : "bg-gray-50 hover:bg-[#ff914d]/10 text-[#191919]"
                                            }`}
                                    >
                                        <Icon
                                            className={`h-5 w-5 mt-0.5 transition-colors ${isActive(item.href)
                                                    ? "text-white"
                                                    : "text-[#ff914d] group-hover:text-[#ff7b33]"
                                                }`}
                                        />
                                        <div className="flex-1">
                                            <p
                                                className={`font-semibold text-sm mb-0.5 ${isActive(item.href)
                                                        ? "text-white"
                                                        : "text-[#191919]"
                                                    }`}
                                            >
                                                {item.name}
                                            </p>
                                            <p
                                                className={`text-xs ${isActive(item.href)
                                                        ? "text-white/80"
                                                        : "text-[#191919]/60"
                                                    }`}
                                            >
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Logout Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="pt-6 border-t border-gray-200"
                >
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300 h-12 rounded-xl"
                    >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sair da conta
                    </Button>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-[#ff914d]/10 to-[#ff7b33]/5 rounded-xl p-4 border border-[#ff914d]/20"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-[#ff914d]" />
                        <p className="text-sm font-semibold text-[#191919]">
                            Seus Eventos
                        </p>
                    </div>
                    <p className="text-2xl font-bold text-[#ff914d] mb-1">12</p>
                    <p className="text-xs text-[#191919]/60">
                        Eventos nos próximos 30 dias
                    </p>
                </motion.div>
            </div>
        </motion.aside>
    );
}
