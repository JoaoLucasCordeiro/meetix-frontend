import { Calendar, Plus, List, Settings, LogOut, TrendingUp, Ticket, Receipt, Bell, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { notificationAPI, participantsAPI, eventsAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);

    useEffect(() => {
        // Fetch initial unread count
        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Fetch upcoming events count
        if (user) {
            fetchUpcomingEventsCount();
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const result = await notificationAPI.getUnreadCount();
            setUnreadCount(result.count);
        } catch (error: any) {
            // Silently fail for 403 errors (feature may not be available for all users)
            if (error.status !== 403) {
                console.error('Erro ao buscar notificações:', error);
            }
            setUnreadCount(0);
        }
    };

    const fetchUpcomingEventsCount = async () => {
        if (!user) return;

        try {
            const participations = await participantsAPI.getUserParticipations(user.id);

            const eventsPromises = participations.map(p =>
                eventsAPI.getEventById(p.eventId)
            );
            const events = await Promise.all(eventsPromises);

            // Get current date/time in Brazil timezone (UTC-3)
            const now = new Date();
            const brasiliaOffset = -3 * 60; // Brazil is UTC-3 (in minutes)
            const localOffset = now.getTimezoneOffset(); // Current timezone offset
            const offsetDiff = localOffset - brasiliaOffset;
            const nowBrasilia = new Date(now.getTime() + offsetDiff * 60 * 1000);

            const thirtyDaysFromNow = new Date(nowBrasilia);
            thirtyDaysFromNow.setDate(nowBrasilia.getDate() + 30);

            const upcomingEvents = events.filter(event => {
                const eventStart = new Date(event.startDateTime);
                return eventStart >= nowBrasilia && eventStart <= thirtyDaysFromNow;
            });

            setUpcomingEventsCount(upcomingEvents.length);
        } catch (error) {
            console.error('Erro ao buscar eventos futuros:', error);
        }
    };

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
            name: "Notificações",
            href: "/notificacoes",
            icon: Bell,
            description: "Suas notificações",
            badge: unreadCount
        },
        {
            name: "Meus Ingressos",
            href: "/meus-ingressos",
            icon: Ticket,
            description: "Ingressos aprovados"
        },
        {
            name: "Meus Pedidos",
            href: "/meus-pedidos",
            icon: Receipt,
            description: "Pedidos de ingressos"
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

    const handleLinkClick = () => {
        // Fecha o sidebar em mobile quando um link é clicado
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay para mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto z-50 transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                `}
            >
            <div className="p-6 space-y-6">
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Fechar menu"
                >
                    <X className="h-6 w-6 text-[#191919]" />
                </button>

                {/* Logo/Header */}
                <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                    <img
                        src="/logo.png"
                        alt="Zuê Logo"
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
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link to={item.href} onClick={handleLinkClick}>
                                    <div
                                        className={`flex items-start gap-3 p-4 rounded-xl transition-all duration-300 cursor-pointer group relative ${isActive(item.href)
                                                ? "bg-[#ff914d] text-white shadow-lg shadow-[#ff914d]/30"
                                                : "bg-gray-50 hover:bg-[#ff914d]/10 text-[#191919]"
                                            }`}
                                    >
                                        <div className="relative">
                                            <Icon
                                                className={`h-5 w-5 mt-0.5 transition-colors ${isActive(item.href)
                                                        ? "text-white"
                                                        : "text-[#ff914d] group-hover:text-[#ff7b33]"
                                                    }`}
                                            />
                                            {item.badge && item.badge > 0 && (
                                                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                    {item.badge > 99 ? '99+' : item.badge}
                                                </span>
                                            )}
                                        </div>
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
                    <p className="text-2xl font-bold text-[#ff914d] mb-1">{upcomingEventsCount}</p>
                    <p className="text-xs text-[#191919]/60">
                        Eventos nos próximos 30 dias
                    </p>
                </motion.div>
            </div>
        </aside>
        </>
    );
}
