import { Link } from "react-router-dom";
import { Calendar, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#191919] text-white">
      <div className="container px-4 md:px-6 mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo e descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-[#ff914d] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">Meetix</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Conectando a comunidade acadêmica através de eventos memoráveis e experiências enriquecedoras.
            </p>
          </div>

          {/* Links rápidos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link 
                  to="/eventos" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Eventos
                </Link>
              </li>
              <li>
                <Link 
                  to="/sobre" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link 
                  to="/contato" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/ajuda" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Centro de Ajuda
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  to="/termos" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacidade" 
                  className="text-gray-400 hover:text-[#ff914d] transition-colors text-sm"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-[#ff914d]" />
                <span className="text-gray-400 text-sm">contato@meetix.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#ff914d]" />
                <span className="text-gray-400 text-sm">+55 (48) 99999-9999</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#ff914d]" />
                <span className="text-gray-400 text-sm">Florianópolis, SC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divisória */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Meetix. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#ff914d]" />
              <span className="text-gray-400 text-sm">
                Transformando eventos acadêmicos
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}