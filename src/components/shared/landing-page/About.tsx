import { Rocket, Users, Heart, Target, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
    return (
        <section id="about" className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50/30">
            <div className="container px-4 md:px-6 mx-auto">
                {/* Cabeçalho */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-2 bg-[#ff914d]/10 rounded-full mb-6">
                        <Rocket className="h-6 w-6 text-[#ff914d]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#191919] mb-4">
                        Sobre o <span className="text-[#ff914d]">Zuê</span>
                    </h2>
                    <p className="text-lg text-[#191919]/70 max-w-3xl mx-auto">
                        Conheça a plataforma que está transformando a maneira como a comunidade acadêmica cria e participa de eventos
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Conteúdo textual */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <img
                                src="/logo.png"
                                alt="Zuê Logo"
                                className="
                    h-8 w-auto
                    md:h-11
                    lg:h-14
                    transition-all duration-300
                    max-h-[7vw]
                "
                                style={{ maxWidth: "100%" }}
                            />
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold text-[#191919]">
                            Nascido da necessidade real da comunidade acadêmica
                        </h3>

                        <p className="text-[#191919]/80 leading-relaxed">
                            O Zuê nasceu quando percebemos como era complicado organizar eventos na faculdade.
                            Inscrições em planilhas, controle manual de presença, certificados impressos...
                            Decidimos criar uma solução que facilitasse a vida de organizadores e participantes.
                        </p>

                        <p className="text-[#191919]/80 leading-relaxed">
                            Nossa missão é simples: tornar a gestão de eventos acadêmicos tão fácil quanto deveria ser.
                            Estamos construindo uma plataforma que reúne tudo que você precisa em um só lugar,
                            desde a criação até a emissão de certificados.
                        </p>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <Link to="/sobre" className="w-full sm:w-auto">
                                <Button 
                                    variant="outline" 
                                    className="w-full sm:w-auto border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10"
                                >
                                    Saiba mais
                                </Button>
                            </Link>
                            <Link to="/contato" className="w-full sm:w-auto">
                                <Button 
                                    className="w-full sm:w-auto bg-[#ff914d] hover:bg-[#ff7b33]"
                                >
                                    Entre em contato
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Estatísticas e destaques */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-6"
                    >
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="bg-[#ff914d]/10 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-[#ff914d]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Nossa Visão</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Conectar toda a comunidade acadêmica através de eventos
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="bg-[#ff914d]/10 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                                <Target className="h-6 w-6 text-[#ff914d]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Missão</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Simplificar a gestão de eventos acadêmicos para todos
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="bg-[#ff914d]/10 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                                <Heart className="h-6 w-6 text-[#ff914d]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Feito com Amor</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Desenvolvido por e para a comunidade acadêmica
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="bg-[#ff914d]/10 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                                <Star className="h-6 w-6 text-[#ff914d]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Inovação</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Tecnologia moderna para resolver problemas reais
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Quote ou depoimento */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mt-20 bg-[#ff914d]/5 rounded-2xl p-8 md:p-12 border border-[#ff914d]/10"
                >
                    <div className="text-center max-w-3xl mx-auto">
                        <p className="text-xl md:text-2xl italic text-[#191919] mb-6">
                            "Cansados de lidar com planilhas confusas e processos manuais para organizar eventos,
                            decidimos criar a solução que gostaríamos de ter tido. O Zuê é feito por quem entende
                            a dor de organizar eventos acadêmicos."
                        </p>
                        <div>
                            <p className="font-semibold text-[#191919]">Equipe Zuê</p>
                            <p className="text-sm text-[#191919]/70">Estudantes e desenvolvedores</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}