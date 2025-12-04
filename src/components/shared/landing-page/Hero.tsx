import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaCheckCircle, FaRocket } from "react-icons/fa";
import { IoSparkles } from "react-icons/io5";
import Header from "./Header";

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      <Header />
      <section className="relative w-full overflow-hidden py-20 lg:py-32">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#ff914d]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff7b33]/5 rounded-full blur-3xl"></div>
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            
            {/* Badge de destaque - ACIMA DA LOGO */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff914d]/10 border border-[#ff914d]/30 rounded-full mb-8"
            >
              <IoSparkles className="h-4 w-4 text-[#ff914d]" />
              <span className="text-sm font-medium text-[#ff914d]">
                Simplifique a gestão de eventos acadêmicos
              </span>
            </motion.div>

            {/* Logo Hero Grande e Centralizada */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-4xl mb-12"
            >
              <img
                src="/logo-hero.png"
                alt="Zuê Platform"
                className="w-full h-auto object-contain"
              />
            </motion.div>

            {/* Descrição */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl sm:text-2xl text-[#191919]/80 mb-12 max-w-3xl leading-relaxed font-light"
            >
              Criado por estudantes que entenderam a dor de organizar eventos na faculdade. 
              Uma plataforma completa para gerenciar palestras, workshops e encontros acadêmicos.
            </motion.p>

            {/* Botões de CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/cadastro">
                <Button className="bg-[#ff914d] hover:bg-[#ff7b33] text-white font-semibold px-10 py-6 text-lg shadow-xl shadow-[#ff914d]/20 hover:shadow-[#ff914d]/40 transition-all duration-300 hover:scale-105 rounded-2xl">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-2 border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d] hover:text-white font-semibold px-10 py-6 text-lg transition-all duration-300 hover:scale-105 rounded-2xl"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Explorar Eventos
                </Button>
              </Link>
            </motion.div>

            {/* Features cards - UI incrementada */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl"
            >
              <div className="bg-gradient-to-br from-[#ff914d]/5 to-transparent p-6 rounded-2xl border border-[#ff914d]/10 hover:border-[#ff914d]/30 transition-all hover:shadow-lg group flex flex-col items-center text-center">
                <FaCheckCircle className="text-5xl text-[#ff914d] mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-base font-semibold text-[#191919] mb-1">100% Gratuito</div>
                <div className="text-sm text-[#191919]/60">Sempre será grátis para todos</div>
              </div>
              <div className="bg-gradient-to-br from-[#ff914d]/5 to-transparent p-6 rounded-2xl border border-[#ff914d]/10 hover:border-[#ff914d]/30 transition-all hover:shadow-lg group flex flex-col items-center text-center">
                <IoSparkles className="text-5xl text-[#ff914d] mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-base font-semibold text-[#191919] mb-1">Simples</div>
                <div className="text-sm text-[#191919]/60">Interface intuitiva e fácil</div>
              </div>
              <div className="bg-gradient-to-br from-[#ff914d]/5 to-transparent p-6 rounded-2xl border border-[#ff914d]/10 hover:border-[#ff914d]/30 transition-all hover:shadow-lg group flex flex-col items-center text-center">
                <FaRocket className="text-5xl text-[#ff914d] mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-base font-semibold text-[#191919] mb-1">Completo</div>
                <div className="text-sm text-[#191919]/60">Tudo que você precisa</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}