import { Rocket, Users, Heart, Target, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function About() {
    return (
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50/30">
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
                        Sobre o <span className="text-[#ff914d]">Meetix</span>
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

                        <h3 className="text-2xl md:text-3xl font-bold text-[#191919]">
                            Revolucionando a experiência de eventos acadêmicos
                        </h3>

                        <p className="text-[#191919]/80 leading-relaxed">
                            O Meetix nasceu da necessidade de simplificar a organização e participação em eventos acadêmicos.
                            Nossa plataforma conecta organizadores e participantes em um ecossistema intuitivo, onde cada evento
                            se torna uma oportunidade de aprendizado, networking e crescimento.
                        </p>

                        <p className="text-[#191919]/80 leading-relaxed">
                            Utilizamos tecnologia de ponta para garantir que desde palestras e workshops até festas e encontros
                            sejam facilmente gerenciados, promovidos e aproveitados por toda a comunidade universitária.
                        </p>

                        <div className="pt-4 flex flex-col sm:flex-row gap-4">
                            <Link to="/sobre">
                                <Button variant="outline" className="border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10">
                                    Saiba mais
                                </Button>
                            </Link>
                            <Link to="/contato">
                                <Button className="bg-[#ff914d] hover:bg-[#ff7b33]">
                                    Entre em contato
                                </Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Estatísticas e destaques (provalmente vamos tirar)*/}
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
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Comunidade Ativa</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Mais de 20 mil estudantes e organizadores conectados
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="bg-[#ff914d]/10 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                                <Target className="h-6 w-6 text-[#ff914d]" />
                            </div>
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Missão</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Democratizar o acesso a eventos acadêmicos de qualidade
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
                            <h4 className="text-xl font-bold text-[#191919] mb-2">Excelência</h4>
                            <p className="text-[#191919]/70 text-sm">
                                Avaliação média de 4.8/5 pelos nossos usuários
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
                            "O Meetix transformou completamente como organizamos nossos eventos na universidade.
                            Agora conseguimos focar no que realmente importa: criar experiências incríveis para nossa comunidade."
                        </p>
                        <div>
                            <p className="font-semibold text-[#191919]">Carlos Silva</p>
                            <p className="text-sm text-[#191919]/70">Diretor de Eventos - Universidade Federal</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}