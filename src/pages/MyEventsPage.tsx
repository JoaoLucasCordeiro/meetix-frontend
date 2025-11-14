import { motion } from "framer-motion";
import { Calendar, Plus, Ticket, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import EventCard from "@/components/shared/all/Eventcard";
import EventsLayout from "@/components/layouts/EventsLayouts";

export default function MyEventsPage() {
    // Mock data - Eventos que estou participando
    const participatingEvents = [
        {
            id: "1",
            title: "Workshop de Inteligência Artificial na Prática",
            date: "15 Nov 2025",
            time: "14h-18h",
            location: "Laboratório de Computação - Bloco A",
            image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=500",
            category: "workshop" as const,
            price: null,
            participants: 45
        },
        {
            id: "3",
            title: "Palestra: O Futuro da Tecnologia Educacional",
            date: "18 Nov 2025",
            time: "10h-12h",
            location: "Auditório Central",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
            category: "palestra" as const,
            price: null,
            participants: 180
        },
        {
            id: "5",
            title: "Workshop: Introdução ao React e TypeScript",
            date: "25 Nov 2025",
            time: "14h-17h",
            location: "Laboratório de Programação",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500",
            category: "workshop" as const,
            price: null,
            participants: 40
        },
        {
            id: "8",
            title: "Minicurso: Fotografia para Iniciantes",
            date: "02 Dez 2025",
            time: "15h-17h",
            location: "Estúdio de Artes",
            image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=500",
            category: "minicurso" as const,
            price: 20.00,
            participants: 25
        }
    ];

    // Mock data - Eventos que criei
    const myCreatedEvents = [
        {
            id: "2",
            title: "Festa de Integração dos Calouros 2025",
            date: "20 Nov 2025",
            time: "20h-02h",
            location: "Centro de Convivência Universitária",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
            category: "festa" as const,
            price: 25.00,
            participants: 250
        },
        {
            id: "4",
            title: "Workshop de Design Thinking Aplicado",
            date: "22 Nov 2025",
            time: "09h-13h",
            location: "Sala de Inovação - Bloco B",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500",
            category: "workshop" as const,
            price: 15.00,
            participants: 30
        },
        {
            id: "7",
            title: "Carreira em Tecnologia: Desafios e Oportunidades",
            date: "30 Nov 2025",
            time: "19h-21h",
            location: "Auditório 201",
            image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=500",
            category: "palestra" as const,
            price: null,
            participants: 120
        }
    ];

    return (
        <EventsLayout>
            <div className="container mx-auto px-6 py-12 max-w-6xl">
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
                            Meus <span className="text-[#ff914d]">Eventos</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70">
                        Gerencie seus eventos e acompanhe suas participações
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                    {/* Total de Participações */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Ticket className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">{participatingEvents.length}</p>
                                <p className="text-sm opacity-90">eventos</p>
                            </div>
                        </div>
                        <p className="font-semibold">Participações</p>
                        <p className="text-sm opacity-90">Eventos que você se inscreveu</p>
                    </div>

                    {/* Eventos Criados */}
                    <div className="bg-gradient-to-br from-[#ff914d] to-[#ff7b33] rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Plus className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">{myCreatedEvents.length}</p>
                                <p className="text-sm opacity-90">eventos</p>
                            </div>
                        </div>
                        <p className="font-semibold">Organizados</p>
                        <p className="text-sm opacity-90">Eventos que você criou</p>
                    </div>

                    {/* Total de Participantes */}
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Trophy className="h-10 w-10 opacity-80" />
                            <div className="text-right">
                                <p className="text-3xl font-bold">
                                    {myCreatedEvents.reduce((acc, event) => acc + event.participants, 0)}
                                </p>
                                <p className="text-sm opacity-90">pessoas</p>
                            </div>
                        </div>
                        <p className="font-semibold">Alcance Total</p>
                        <p className="text-sm opacity-90">Em eventos que você organizou</p>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Tabs defaultValue="participating" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-2 h-14 bg-gray-100 rounded-xl p-1">
                            <TabsTrigger 
                                value="participating" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Ticket className="h-5 w-5 mr-2" />
                                Participando ({participatingEvents.length})
                            </TabsTrigger>
                            <TabsTrigger 
                                value="created" 
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#ff914d] data-[state=active]:shadow-md transition-all font-semibold"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Criados ({myCreatedEvents.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab: Eventos que estou participando */}
                        <TabsContent value="participating" className="mt-8">
                            {participatingEvents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {participatingEvents.map((event, index) => (
                                        <EventCard key={event.id} {...event} delay={index * 0.1} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Ticket}
                                    title="Nenhuma participação ainda"
                                    description="Você ainda não se inscreveu em nenhum evento. Explore os eventos disponíveis e participe!"
                                    actionLabel="Explorar Eventos"
                                    actionLink="/eventos"
                                />
                            )}
                        </TabsContent>

                        {/* Tab: Eventos que criei */}
                        <TabsContent value="created" className="mt-8">
                            {myCreatedEvents.length > 0 ? (
                                <>
                                    <div className="flex justify-end mb-6">
                                        <Link to="/criar-evento">
                                            <Button className="bg-[#ff914d] hover:bg-[#ff7b33] shadow-lg shadow-[#ff914d]/30">
                                                <Plus className="h-5 w-5 mr-2" />
                                                Criar Novo Evento
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {myCreatedEvents.map((event, index) => (
                                            <EventCard key={event.id} {...event} delay={index * 0.1} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState
                                    icon={Plus}
                                    title="Nenhum evento criado"
                                    description="Você ainda não criou nenhum evento. Comece agora e compartilhe suas ideias com a comunidade!"
                                    actionLabel="Criar Primeiro Evento"
                                    actionLink="/criar-evento"
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </motion.div>
            </div>
        </EventsLayout>
    );
}

// Componente de Empty State
interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    actionLabel: string;
    actionLink: string;
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionLink }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-300"
        >
            <div className="p-6 bg-gray-100 rounded-full mb-6">
                <Icon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-[#191919] mb-3">{title}</h3>
            <p className="text-[#191919]/70 text-center max-w-md mb-8">{description}</p>
            <Link to={actionLink}>
                <Button className="bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] shadow-lg shadow-[#ff914d]/30">
                    {actionLabel}
                </Button>
            </Link>
        </motion.div>
    );
}
