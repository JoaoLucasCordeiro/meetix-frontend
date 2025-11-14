import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, DollarSign, Share2, Heart, ArrowLeft, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import EventsLayout from "@/components/layouts/EventsLayouts";

export default function EventDetailsPage() {
    const { id } = useParams();

    // Mock data - substitua por fetch real
    type EventDetails = {
        id: string | undefined;
        title: string;
        date: string;
        time: string;
        location: string;
        image: string;
        category: string;
        price: number | null;
        participants: number;
        maxParticipants: number;
        description: string;
        organizer: {
            name: string;
            logo: string;
        };
        requirements: string[];
        schedule: { time: string; activity: string }[];
    };

    const event: EventDetails = {
        id: id,
        title: "Workshop de Inteligência Artificial na Prática",
        date: "15 Nov 2025",
        time: "14h-18h",
        location: "Laboratório de Computação - Bloco A",
        image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800",
        category: "Workshop",
        price: null,
        participants: 45,
        maxParticipants: 60,
        description: `Mergulhe no fascinante mundo da Inteligência Artificial com este workshop hands-on! 
       
        Neste evento, você aprenderá os fundamentos de Machine Learning, explorará algoritmos populares e construirá seu primeiro modelo de IA do zero.

        O workshop é ideal para estudantes que desejam entender como a IA está transformando diversas áreas do conhecimento e como você pode aplicá-la em seus projetos acadêmicos.`,
        organizer: {
            name: "Liga de Computação UFSC",
            logo: "https://ui-avatars.com/api/?name=Liga+Computacao&background=ff914d&color=fff&size=128"
        },
        requirements: [
            "Notebook próprio",
            "Conhecimentos básicos de programação (Python)",
            "Vontade de aprender!"
        ],
        schedule: [
            { time: "14h00", activity: "Boas-vindas e Introdução à IA" },
            { time: "14h30", activity: "Fundamentos de Machine Learning" },
            { time: "15h30", activity: "Coffee Break" },
            { time: "16h00", activity: "Hands-on: Construindo seu primeiro modelo" },
            { time: "17h30", activity: "Q&A e Encerramento" }
        ]
    };

    return (
        <EventsLayout>
            <div className="min-h-screen">
                {/* Hero Section with Image */}
                <div className="relative h-96 overflow-hidden">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Back Button */}
                    <Link to="/eventos">
                        <Button
                            variant="outline"
                            className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm hover:bg-white border-gray-200"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar
                        </Button>
                    </Link>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="container mx-auto max-w-6xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-4">
                                    {event.category}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    {event.title}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-white/90">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 mr-2" />
                                        <span>{event.time}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-5 w-5 mr-2" />
                                        <span>{event.participants}/{event.maxParticipants} inscritos</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 py-12 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Description */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#191919] mb-4">
                                    Sobre o Evento
                                </h2>
                                <p className="text-[#191919]/70 leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </motion.section>

                            {/* Requirements */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#191919] mb-4">
                                    O que você precisa
                                </h2>
                                <ul className="space-y-3">
                                    {event.requirements.map((req, index) => (
                                        <li key={index} className="flex items-start">
                                            <div className="h-6 w-6 rounded-full bg-[#ff914d]/10 flex items-center justify-center mr-3 mt-0.5">
                                                <div className="h-2 w-2 rounded-full bg-[#ff914d]" />
                                            </div>
                                            <span className="text-[#191919]/70">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.section>

                            {/* Schedule */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                            >
                                <h2 className="text-2xl font-bold text-[#191919] mb-6">
                                    Programação
                                </h2>
                                <div className="space-y-4">
                                    {event.schedule.map((item, index) => (
                                        <div key={index} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="h-10 w-10 rounded-full bg-[#ff914d]/10 flex items-center justify-center">
                                                    <Clock className="h-5 w-5 text-[#ff914d]" />
                                                </div>
                                                {index !== event.schedule.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-200 my-2" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-6">
                                                <p className="font-bold text-[#ff914d] mb-1">
                                                    {item.time}
                                                </p>
                                                <p className="text-[#191919]/70">
                                                    {item.activity}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="sticky top-6 space-y-6"
                            >
                                {/* Registration Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <div className="mb-6">
                                        {event.price === null ? (
                                            <div className="text-center">
                                                <p className="text-sm text-[#191919]/60 mb-2">
                                                    Entrada
                                                </p>
                                                <p className="text-4xl font-bold text-green-500">
                                                    GRÁTIS
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-sm text-[#191919]/60 mb-2">
                                                    Ingresso
                                                </p>
                                                <div className="flex items-center justify-center">
                                                    <DollarSign className="h-6 w-6 text-[#ff914d]" />
                                                    <p className="text-4xl font-bold text-[#191919]">
                                                        {event.price.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button className="w-full bg-gradient-to-r from-[#ff914d] to-[#ff7b33] hover:from-[#ff7b33] hover:to-[#ff6520] text-white font-bold py-6 text-lg mb-4 shadow-lg shadow-[#ff914d]/30">
                                        <Ticket className="mr-2 h-5 w-5" />
                                        Confirmar Presença
                                    </Button>

                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 border-gray-300">
                                            <Heart className="h-5 w-5" />
                                        </Button>
                                        <Button variant="outline" className="flex-1 border-gray-300">
                                            <Share2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Location Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="font-bold text-[#191919] mb-4 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2 text-[#ff914d]" />
                                        Localização
                                    </h3>
                                    <p className="text-[#191919]/70 mb-4">
                                        {event.location}
                                    </p>
                                    <div className="h-48 bg-gray-200 rounded-xl overflow-hidden">
                                        <img
                                            src="https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-48.5182,-27.5945,14,0/400x300@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
                                            alt="Mapa"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Organizer Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                    <h3 className="font-bold text-[#191919] mb-4">
                                        Organizado por
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={event.organizer.logo}
                                            alt={event.organizer.name}
                                            className="h-12 w-12 rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold text-[#191919]">
                                                {event.organizer.name}
                                            </p>
                                            <p className="text-sm text-[#191919]/60">
                                                Organização Estudantil
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </EventsLayout>
    );
}
