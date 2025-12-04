import { Users, ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Team() {
    const teamMembers = [
        {
            name: "João Lucas",
            role: "Desenvolvedor Full-Stack e Co-Founder",
            image: "/joaolucas.jpg", 
            bio: "Estudante de Engenharia de Software pela Universidade de Pernambuco. Lidera o desenvolvimento e gerenciamento do projeto.",
            social: {
                github: "#",
                linkedin: "#",
                email: "#"
            }
        },
        {
            name: "João Gabriel",
            role: "Desenvolvedor Back-End e Co-Founder",
            image: "/joaogabriel.jpeg",
            bio: "Estudante de Engenharia de Software pela Universidade de Pernambuco. Especializado em desenvolvimento back-end com Spring Boot.",
            social: {
                github: "#",
                linkedin: "#",
                email: "#"
            }
        },
        {
            name: "Ocimar Schroeder",
            role: "Desenvolvedor Back-End e Co-Founder",
            image: "/ocimar.png",
            bio: "Estudante de Engenharia de Software pela Universidade de Pernambuco. Especializado em desenvolvimento back-end com Spring Boot.",
            social: {
                github: "#",
                linkedin: "#",
                email: "#"
            }
        }
    ];

    return (
        <section id="team" className="w-full py-16 md:py-24 lg:py-32 bg-white">
            <div className="container px-4 md:px-6 mx-auto">
                {/* Cabeçalho */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center p-3 bg-[#ff914d]/10 rounded-full mb-6">
                        <Users className="h-6 w-6 text-[#ff914d]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#191919] mb-4">
                        Conheça o time por trás do <span className="text-[#ff914d]">Zuê</span>
                    </h2>
                    <p className="text-lg text-[#191919]/70 max-w-3xl mx-auto mb-8">
                        Nossa equipe apaixonada por tecnologia e educação está comprometida em transformar
                        a experiência de eventos acadêmicos
                    </p>
                    <Link to="/equipe">
                        <Button className="bg-[#ff914d] hover:bg-[#ff7b33] gap-2">
                            Nos conheça melhor
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Grid de membros do time */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group flex flex-col items-center text-center bg-gray-50/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:bg-white"
                        >
                            {/* Avatar */}
                            <div className="relative mb-6">
                                <div className="h-32 w-32 rounded-full bg-gradient-to-r from-[#ff914d] to-[#ff7b33] p-1 group-hover:scale-105 transition-transform">
                                    <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {/* Placeholder para imagem - substitua por imagem real */}
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </div>
                                {/* Elemento decorativo */}
                                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#ff914d]/20 rounded-full flex items-center justify-center">
                                    <div className="h-6 w-6 bg-[#ff914d] rounded-full"></div>
                                </div>
                            </div>

                            {/* Nome e cargo */}
                            <h3 className="text-xl font-bold text-[#191919] mb-2">{member.name}</h3>
                            <p className="text-[#ff914d] font-medium mb-4">{member.role}</p>

                            {/* Bio */}
                            <p className="text-[#191919]/70 text-sm mb-6 leading-relaxed">
                                {member.bio}
                            </p>

                            {/* Social links */}
                            <div className="flex gap-3 mt-auto">
                                <a
                                    href={member.social.github}
                                    className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#191919] hover:bg-[#ff914d] hover:text-white transition-colors"
                                    aria-label={`GitHub de ${member.name}`}
                                >
                                    <Github className="h-5 w-5" />
                                </a>
                                <a
                                    href={member.social.linkedin}
                                    className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#191919] hover:bg-[#ff914d] hover:text-white transition-colors"
                                    aria-label={`LinkedIn de ${member.name}`}
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                                <a
                                    href={`mailto:${member.social.email}`}
                                    className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-[#191919] hover:bg-[#ff914d] hover:text-white transition-colors"
                                    aria-label={`Email de ${member.name}`}
                                >
                                    <Mail className="h-5 w-5" />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Rodapé da seção */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <p className="text-lg text-[#191919]/70 mb-6 max-w-2xl mx-auto">
                        Juntos, estamos construindo a plataforma que vai revolucionar
                        como a comunidade acadêmica experiencia eventos
                    </p>
                    <Link to="/equipe">
                        <Button variant="outline" className="border-[#ff914d] text-[#ff914d] hover:bg-[#ff914d]/10 gap-2">
                            Saiba mais sobre nossa equipe
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}