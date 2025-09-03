import { ArrowRight, Calendar, Users, Ticket, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "./Header";

export default function Hero() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="relative w-full overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
        {/* Elementos de fundo decorativos */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-[0.03]">
          <Calendar className="absolute top-20 left-10 text-[#ff914d] w-40 h-40" />
          <Ticket className="absolute top-60 right-20 text-[#ff914d] w-32 h-32" />
          <Users className="absolute bottom-40 left-32 text-[#ff914d] w-36 h-36" />
          <MapPin className="absolute bottom-20 right-10 text-[#ff914d] w-28 h-28" />
        </div>

        {/* Conteúdo Principal */}
        <div className="container mx-auto h-full flex flex-col lg:flex-row items-center px-4 sm:px-6 relative pt-8 lg:pt-16">
          {/* Lado Esquerdo: Texto e CTA */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1 mt-12 lg:mt-0">
            <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
              {/* Tag de destaque */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff914d]/10 border border-[#ff914d]/30 rounded-full mb-6 lg:mb-8"
              >
                <Calendar className="h-4 w-4 text-[#ff914d]" />
                <span className="text-sm font-medium text-[#ff914d]">
                  Plataforma de Eventos Acadêmicos
                </span>
              </motion.div>

              {/* Título */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 sm:mb-8 leading-tight text-[#191919]"
              >
                Organize e participe de{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff914d] to-[#ff7b33]">
                  eventos acadêmicos
                </span>{" "}
                com facilidade
              </motion.h1>

              {/* Descrição */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-[#191919]/80 mb-8 sm:mb-12 leading-relaxed"
              >
                Do planejamento à execução, o Meetix simplifica a organização de 
                palestras, workshops, festas e todos os eventos do meio acadêmico. 
                Conecte organizadores e participantes em uma única plataforma.
              </motion.p>

              {/* Estatísticas */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 mb-8 sm:mb-12"
              >
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl sm:text-3xl font-bold text-[#ff914d]">500+</span>
                  <span className="text-sm text-[#191919]/70">Eventos realizados</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl sm:text-3xl font-bold text-[#ff914d]">20K+</span>
                  <span className="text-sm text-[#191919]/70">Participantes</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl sm:text-3xl font-bold text-[#ff914d]">50+</span>
                  <span className="text-sm text-[#191919]/70">Instituições</span>
                </div>
              </motion.div>

              {/* Botões - REFATORADO */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <Link to="/criar-conta" className="flex w-full sm:w-auto">
                  <Button className="bg-[#ff914d] hover:bg-[#ff7b33] text-white font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg shadow-lg shadow-[#ff914d]/20 hover:shadow-[#ff914d]/40 transition-all duration-300 w-full justify-center">
                    Começar Agora
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>

                <Link to="/explorar-eventos" className="flex w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10 hover:text-[#ff7b33] font-medium px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg transition-all w-full justify-center"
                  >
                    <Ticket className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Ver Eventos
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Lado Direito: Ilustração */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2 flex items-center justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "backOut" }}
              className="relative flex items-center justify-center w-full max-w-md px-4 sm:px-0"
            >
              {/* Card de evento em destaque (simulado) */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 border border-gray-100 transform rotate-1 w-full">
                <div className="bg-[#ff914d] text-white text-xs font-bold px-3 sm:px-4 py-1 sm:py-2 rounded-full inline-block mb-4 sm:mb-6">
                  EM BREVE
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-[#191919] mb-3 sm:mb-4">Workshop de Inovação Acadêmica</h3>
                
                <div className="flex items-center text-sm text-[#191919]/70 mb-3 sm:mb-4">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#ff914d]" />
                  <span>25 Out • 14h-18h</span>
                </div>
                
                <div className="flex items-center text-sm text-[#191919]/70 mb-3 sm:mb-4">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#ff914d]" />
                  <span>Auditório Central - Universidade Federal</span>
                </div>
                
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-[#ff914d]" />
                    <span className="text-sm">42 participantes</span>
                  </div>
                  
                  <div className="text-[#ff914d] font-bold text-base sm:text-lg">Grátis</div>
                </div>
                
                <Button className="w-full bg-[#ff914d] hover:bg-[#ff7b33] text-white py-5 sm:py-6 text-sm sm:text-base">
                  <Ticket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Reservar Ingresso
                </Button>
              </div>

              {/* Elementos decorativos ao redor do card */}
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-[#ff914d]/10 rounded-full z-[-1]"></div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-[#ff914d]/5 rounded-full z-[-1]"></div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}