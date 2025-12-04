import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
    Bell,
    CheckCircle,
    Calendar,
    Award,
    UserPlus,
    Loader2
} from "lucide-react";
import EventsLayout from "@/components/layouts/EventsLayouts";
import { notificationAPI } from "@/lib/api";
import type { Notification, NotificationType } from "@/types/notification";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated || !user) {
            toast.error('Você precisa estar logado');
            navigate('/login');
            return;
        }

        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);

        return () => clearInterval(interval);
    }, [isAuthenticated, user, navigate]);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const data = await notificationAPI.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Erro ao buscar notificações:', error);
            toast.error('Erro ao carregar notificações');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            setMarkingAsRead(prev => new Set(prev).add(notificationId));
            await notificationAPI.markAsRead(notificationId);
            
            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, read: true }
                        : notif
                )
            );
            
            toast.success('Notificação marcada como lida');
        } catch (error) {
            console.error('Erro ao marcar notificação:', error);
            toast.error('Erro ao marcar notificação como lida');
        } finally {
            setMarkingAsRead(prev => {
                const next = new Set(prev);
                next.delete(notificationId);
                return next;
            });
        }
    };

    const getNotificationIcon = (type: NotificationType) => {
        switch (type) {
            case 'EVENT_INVITATION':
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case 'REGISTRATION_CONFIRMATION':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'EVENT_REMINDER':
                return <Calendar className="h-5 w-5 text-orange-500" />;
            case 'CERTIFICATE_READY':
                return <Award className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: NotificationType) => {
        switch (type) {
            case 'EVENT_INVITATION':
                return 'from-blue-50 to-blue-100 border-blue-200';
            case 'REGISTRATION_CONFIRMATION':
                return 'from-green-50 to-green-100 border-green-200';
            case 'EVENT_REMINDER':
                return 'from-orange-50 to-orange-100 border-orange-200';
            case 'CERTIFICATE_READY':
                return 'from-purple-50 to-purple-100 border-purple-200';
            default:
                return 'from-gray-50 to-gray-100 border-gray-200';
        }
    };

    const unreadNotifications = notifications.filter(n => !n.read);
    const readNotifications = notifications.filter(n => n.read);

    return (
        <EventsLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Bell className="h-8 w-8 text-[#ff914d]" />
                            <h1 className="text-4xl font-bold text-[#191919]">
                                Notificações
                            </h1>
                        </div>
                        <p className="text-gray-600">
                            Fique por dentro de tudo que acontece em seus eventos
                        </p>
                    </motion.div>

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-[#ff914d]" />
                        </div>
                    ) : notifications.length === 0 ? (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
                        >
                            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-[#191919] mb-2">
                                Nenhuma notificação
                            </h2>
                            <p className="text-gray-500">
                                Você não possui notificações no momento
                            </p>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {/* Unread Notifications */}
                            {unreadNotifications.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-[#191919] mb-3 flex items-center gap-2">
                                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                                        Não lidas ({unreadNotifications.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {unreadNotifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-xl p-5 border shadow-md`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-[#191919] mb-1">
                                                            {notification.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(notification.createdAt).toLocaleString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        disabled={markingAsRead.has(notification.id)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium disabled:opacity-50"
                                                    >
                                                        {markingAsRead.has(notification.id) ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4" />
                                                        )}
                                                        Marcar como lida
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Read Notifications */}
                            {readNotifications.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-600 mb-3">
                                        Lidas ({readNotifications.length})
                                    </h2>
                                    <div className="space-y-3">
                                        {readNotifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-white rounded-xl p-5 border border-gray-200 opacity-70"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-gray-50 rounded-lg">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-[#191919] mb-1">
                                                            {notification.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {new Date(notification.createdAt).toLocaleString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </EventsLayout>
    );
}
