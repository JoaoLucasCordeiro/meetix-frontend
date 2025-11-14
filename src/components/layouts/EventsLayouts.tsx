import type { ReactNode } from "react";
import Sidebar from "../shared/all/Sidebar";

interface EventsLayoutProps {
    children: ReactNode;
}

export default function EventsLayout({ children }: EventsLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
            {/* Main Content */}
            <main className="pr-80"> {/* Espaço para o sidebar */}
                {children}
            </main>

            {/* Sidebar */}
            <Sidebar />
        </div>
    );
}
