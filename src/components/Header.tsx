import React from "react";
import { ShoppingCart } from "lucide-react";
import { Settings } from "../types";

interface HeaderProps {
  settings: Settings;
  cartCount: number;
  favCount: number;
  onOpenCart: () => void;
  onViewFavorites: () => void;
  currentView: "home" | "admin";
  onSetView: (view: "home" | "admin") => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export default function Header({
  settings,
  cartCount,
  onOpenCart,
  currentView,
  onSetView,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#1A120B] border-b border-white/8 text-[#F8F5F0] backdrop-blur-md bg-opacity-95 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 relative">
          
          {/* Left: Small Logo */}
          <div 
            onClick={() => onSetView("home")}
            className="flex items-center cursor-pointer group z-10"
          >
            <div className="w-8 h-8 rounded-full bg-[#D97706]/10 border border-[#D97706]/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-sm">
              <span className="font-serif text-sm text-[#D97706] font-bold">★</span>
            </div>
          </div>

          {/* Center: Hamburger Name */}
          <div 
            onClick={() => onSetView("home")}
            className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer z-0 text-center"
          >
            <h1 className="font-display text-sm sm:text-base tracking-[0.2em] text-[#F8F5F0] font-black uppercase">
              COUNTRY <span className="text-[#D97706]">FOOD</span>
            </h1>
          </div>

          {/* Right: Status and Shopping Cart */}
          <div className="flex items-center space-x-4 z-10">
            {/* Status indicator */}
            <div className="flex items-center space-x-1.5" title={settings.storeOpen ? "Rancho Aberto" : "Fechado"}>
              <span className="relative flex h-2 w-2">
                {settings.storeOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${settings.storeOpen ? "bg-emerald-500" : "bg-rose-500"}`}></span>
              </span>
              <span className="text-[10px] font-mono text-[#A8A29E] tracking-wider uppercase hidden sm:inline">
                {settings.storeOpen ? "ABERTO" : "FECHADO"}
              </span>
            </div>

            {/* Shopping Cart button */}
            <button
              onClick={onOpenCart}
              className="relative p-1.5 text-[#F8F5F0] hover:text-[#D97706] transition-colors focus:outline-none"
              title="Sacola de Pedidos"
            >
              <ShoppingCart size={18} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D97706] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#1A120B] shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Backstage management panel for owners, subtle text and stylish layout */}
            <button
              onClick={() => onSetView(currentView === "home" ? "admin" : "home")}
              className="text-[9px] font-mono text-[#A8A29E]/30 hover:text-[#A8A29E] transition-colors tracking-tighter"
              title={currentView === "admin" ? "Sair do Painel" : "Painel"}
            >
              ADM
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
