import { Search, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/shared/all/Eventcard";
import EventsLayout from "@/components/layouts/EventsLayouts";

export default function EventsPage() {
    // Mock data - substitua por dados reais da API
    const trendingEvents = [
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
            id: "3",
            title: "Palestra: O Futuro da Tecnologia Educacional",
            date: "18 Nov 2025",
            time: "10h-12h",
            location: "Auditório Central",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500",
            category: "palestra" as const,
            price: null,
            participants: 180
        }
    ];

    const workshopEvents = [
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
            id: "5",
            title: "Workshop: Introdução ao React e TypeScript",
            date: "25 Nov 2025",
            time: "14h-17h",
            location: "Laboratório de Programação",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500",
            category: "workshop" as const,
            price: null,
            participants: 40
        }
    ];

    const festaEvents = [
        {
            id: "6",
            title: "Festa Junina Universitária 2025",
            date: "28 Nov 2025",
            time: "18h-23h",
            location: "Quadra Poliesportiva",
            image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500",
            category: "festa" as const,
            price: 10.00,
            participants: 300
        }
    ];

    const palestraEvents = [
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

    const minicursoEvents = [
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
                            <Zap className="h-6 w-6 text-[#ff914d]" />
                        </div>
                        <h1 className="text-4xl font-bold text-[#191919]">
                            Explore <span className="text-[#ff914d]">Eventos</span>
                        </h1>
                    </div>
                    <p className="text-lg text-[#191919]/70 mb-6">
                        Descubra palestras, workshops, festas e muito mais na sua universidade
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Buscar eventos por nome, local ou categoria..."
                            className="pl-12 h-14 rounded-xl bg-white border-gray-300 focus:ring-2 focus:ring-[#ff914d] focus:border-transparent text-base"
                        />
                    </div>
                </motion.div>

                {/* Eventos em Alta */}
                <section className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-3 mb-6"
                    >
                        <TrendingUp className="h-6 w-6 text-[#ff914d]" />
                        <h2 className="text-2xl font-bold text-[#191919]">
                            Eventos em Alta
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingEvents.map((event, index) => (
                            <EventCard key={event.id} {...event} delay={index * 0.1} />
                        ))}
                    </div>
                </section>

                {/* Workshops */}
                <section className="mb-16">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold text-[#191919] mb-6"
                    >
                        Workshops
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workshopEvents.map((event, index) => (
                            <EventCard key={event.id} {...event} delay={index * 0.1} />
                        ))}
                    </div>
                </section>

                {/* Festas */}
                <section className="mb-16">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold text-[#191919] mb-6"
                    >
                        Festas
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {festaEvents.map((event, index) => (
                            <EventCard key={event.id} {...event} delay={index * 0.1} />
                        ))}
                    </div>
                </section>

                {/* Palestras */}
                <section className="mb-16">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold text-[#191919] mb-6"
                    >
                        Palestras
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {palestraEvents.map((event, index) => (
                            <EventCard key={event.id} {...event} delay={index * 0.1} />
                        ))}
                    </div>
                </section>

                {/* Minicursos */}
                <section className="mb-16">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold text-[#191919] mb-6"
                    >
                        Minicursos
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {minicursoEvents.map((event, index) => (
                            <EventCard key={event.id} {...event} delay={index * 0.1} />
                        ))}
                    </div>
                </section>
            </div>
        </EventsLayout>
    );
}
