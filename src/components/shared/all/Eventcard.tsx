import { Calendar, MapPin, Users, ArrowRight, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EventCardProps {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
    category: "workshop" | "festa" | "palestra" | "minicurso";
    price: number | null; // null = gratuito
    participants: number;
    delay?: number;
}

export default function EventCard({
    id,
    title,
    date,
    time,
    location,
    image,
    category,
    price,
    participants,
    delay = 0
}: EventCardProps) {
    const categoryColors = {
        workshop: "bg-blue-500",
        festa: "bg-purple-500",
        palestra: "bg-green-500",
        minicurso: "bg-orange-500"
    };

    const categoryLabels = {
        workshop: "Workshop",
        festa: "Festa",
        palestra: "Palestra",
        minicurso: "Minicurso"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#ff914d]/30"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                    src={image}
                    alt={title}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/logo.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <span
                        className={`${categoryColors[category]} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg`}
                    >
                        {categoryLabels[category]}
                    </span>
                </div>
                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                    {price === null ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            GRÁTIS
                        </span>
                    ) : (
                        <span className="bg-[#ff914d] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {price.toFixed(2)}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* Title */}
                <h3 className="text-xl font-bold text-[#191919] line-clamp-2 group-hover:text-[#ff914d] transition-colors">
                    {title}
                </h3>

                {/* Info */}
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-[#191919]/70">
                        <Calendar className="h-4 w-4 mr-2 text-[#ff914d]" />
                        <span>{date} • {time}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#191919]/70">
                        <MapPin className="h-4 w-4 mr-2 text-[#ff914d]" />
                        <span className="line-clamp-1">{location}</span>
                    </div>
                    <div className="flex items-center text-sm text-[#191919]/70">
                        <Users className="h-4 w-4 mr-2 text-[#ff914d]" />
                        <span>{participants} participantes</span>
                    </div>
                </div>

                {/* Button */}
                <Link to={`/eventos/${id}`}>
                    <Button className="w-full bg-[#ff914d] hover:bg-[#ff7b33] text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#ff914d]/30">
                        Ver detalhes
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
