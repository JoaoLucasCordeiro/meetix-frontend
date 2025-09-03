import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: "Início", href: "/" },
        { name: "Sobre nós", href: "/sobre" },
        { name: "Equipe", href: "/equipe" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#ff914d]/20 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <Link to="/" className="flex items-center space-x-4">
                        <img
                            src="/logo.png"
                            alt="Meetix Logo"
                            className="
                    h-24 w-auto
                    md:h-32
                    lg:h-40
                    transition-all duration-300
                    max-h-[20vw]
                "
                            style={{ maxWidth: "100%" }}
                        />
                    </Link>

                    <nav className="hidden md:flex items-center space-x-10">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`text-base font-medium transition-all duration-300 hover:text-[#ff914d] px-2 py-1 rounded-lg ${isActive(item.href)
                                        ? "text-[#ff914d] bg-[#ff914d]/10"
                                        : "text-[#191919] hover:bg-[#ff914d]/5"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login">
                            <Button
                                variant="outline"
                                className="border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d] hover:text-white transition-all duration-300 px-6 py-2 h-11"
                            >
                                Entrar
                            </Button>
                        </Link>
                        <Link to="/cadastro">
                            <Button className="bg-[#ff914d] hover:bg-[#ff7b33] text-white px-6 py-2 h-11 transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ff914d]/25">
                                Cadastre-se
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-[#191919] hover:bg-[#ff914d]/10 hover:text-[#ff914d] h-10 w-10"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Abrir menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[85vw] max-w-sm bg-white/95 backdrop-blur-md border-l border-[#ff914d]/10">
                                <div className="flex flex-col h-full px-6 py-8">
                                    {/* Logo no menu mobile */}
                                    <div className="flex items-center justify-center mb-12">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img
                                                src="/logo.png"
                                                alt="Meetix Logo"
                                                className="
                    h-24 w-auto
                    md:h-32
                    lg:h-40
                    transition-all duration-300
                    max-h-[20vw]
                "
                                                style={{ maxWidth: "100%" }}
                                            />
                                        </div>
                                    </div>

                                    {/* Navigation mobile */}
                                    <nav className="flex flex-col space-y-6">
                                        {navigation.map((item) => (
                                            <SheetClose asChild key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`text-lg font-medium transition-all duration-300 py-3 px-4 rounded-xl ${isActive(item.href)
                                                            ? "text-[#ff914d] bg-[#ff914d]/10"
                                                            : "text-[#191919] hover:text-[#ff914d] hover:bg-[#ff914d]/5"
                                                        }`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </SheetClose>
                                        ))}
                                    </nav>

                                    {/* Buttons mobile */}
                                    <div className="mt-auto space-y-4 pt-8 border-t border-[#ff914d]/10">
                                        <SheetClose asChild>
                                            <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d] hover:text-white h-12 text-base transition-all duration-300"
                                                >
                                                    Entrar
                                                </Button>
                                            </Link>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Link to="/cadastro" className="block" onClick={() => setIsOpen(false)}>
                                                <Button className="w-full bg-[#ff914d] hover:bg-[#ff7b33] text-white h-12 text-base transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#ff914d]/25">
                                                    Cadastre-se
                                                </Button>
                                            </Link>
                                        </SheetClose>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    );
}