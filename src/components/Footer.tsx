import React from "react";
import { Instagram, Facebook, Phone, MapPin, Clock, Calendar, Mail, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-natural-dark text-natural-cream mt-auto border-t border-natural-border shadow-inner relative overflow-hidden">
      {/* Decorative Top Line */}
      <div className="h-1 bg-natural-red w-full" />

      {/* Western Star Wood Background Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Store Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-display text-2xl font-bold text-natural-cream">COUNTRY <span className="text-natural-red">FOOD</span></span>
              <span className="text-xl text-natural-red">★</span>
            </div>
            
            <p className="text-sm text-natural-cream/80 leading-relaxed font-sans">
              O autêntico sabor das pradarias americanas diretamente para sua mesa! Nossas receitas misturam temperos rústicos tradicionais com carnes frescas grelhadas em fogo forte. Sinta a experiência do sabor em cada mordida.
            </p>

            <div className="flex space-x-4 pt-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-natural-panel hover:bg-natural-red flex items-center justify-center transition-all duration-300 text-natural-cream border border-natural-border hover:border-natural-cream hover:scale-110"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-natural-panel hover:bg-natural-red flex items-center justify-center transition-all duration-300 text-natural-cream border border-natural-border hover:border-natural-cream hover:scale-110"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://wa.me/5511999999999" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-natural-panel hover:bg-natural-red flex items-center justify-center transition-all duration-300 text-natural-cream border border-natural-border hover:border-natural-cream hover:scale-110"
              >
                <Phone size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Operation & Contacts */}
          <div className="space-y-5">
            <h3 className="font-display text-lg tracking-wider text-natural-cream font-bold border-b-2 border-natural-border pb-2">
              Rancho & Contato
            </h3>
            
            <ul className="space-y-3.5 text-sm text-natural-cream/85">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-natural-red mt-1 shrink-0" />
                <span>Rua do Cowboy, 1835 - Centro, São Paulo - SP</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock size={18} className="text-natural-red shrink-0" />
                <span>Terça a Domingo: 18:00h às 23:30h</span>
              </li>
              <li className="flex items-center space-x-3">
                <Calendar size={18} className="text-natural-red shrink-0" />
                <span>Segunda-feira: Rancho Fechado</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-natural-red shrink-0" />
                <span>(11) 99999-9999 / (11) 3456-7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-natural-red shrink-0" />
                <span>contato@countryfoodburger.com</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Google Maps Integration */}
          <div className="space-y-4">
            <h3 className="font-display text-lg tracking-wider text-natural-cream font-bold border-b-2 border-natural-border pb-2">
              Nossa Localização
            </h3>
            
            <div className="border border-natural-border shadow-2xl rounded-lg overflow-hidden h-44 relative bg-natural-panel">
              {/* Google Maps embed code geared towards an engaging central street area */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0658300262703!2d-46.652190185022176!3d-23.56447218468165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1655024471926!5m2!1spt-BR!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Country Food"
                className="opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <p className="text-[11px] text-natural-cream/60 italic font-mono">
              ★ Venha nos visitar e experimente o clima artesanal e rústico que preparamos para você!
            </p>
          </div>

        </div>

        {/* Small copyright footnotes */}
        <div className="mt-12 pt-8 border-t border-natural-border text-center text-xs text-natural-cream/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <p>© {new Date().getFullYear()} Country Food Hamburgueria LTDA. Todos os direitos reservados.</p>
          <p>
            Feito com <span className="text-natural-red font-bold">❤</span> para os amantes de Burgers Rústicos.
          </p>
        </div>
      </div>
    </footer>
  );
}
