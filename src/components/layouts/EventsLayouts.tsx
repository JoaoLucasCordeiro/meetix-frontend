import type { ReactNode } from "react";
import Sidebar from "../shared/all/Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

interface EventsLayoutProps {
    children: ReactNode;
}

export default function EventsLayout({ children }: EventsLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Inicia aberto em desktop

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            {/* Hamburger button for mobile */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-30 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Abrir menu"
            >
                <Menu className="h-6 w-6 text-[#191919]" />
            </button>

            {/* Main Content */}
            <main className="lg:pl-80 transition-all duration-300"> {/* Espaço para o sidebar na esquerda */}
                {children}
            </main>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
    );
}
