import React, { useState } from "react";
import { ShoppingCart, Heart, ShieldAlert, Clock, Menu, X, Settings as SettingsIcon } from "lucide-react";
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
  favCount,
  onOpenCart,
  onViewFavorites,
  currentView,
  onSetView,
  searchTerm,
  onSearchChange
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-natural-panel border-b-2 border-natural-border text-natural-cream shadow-2xl transition-all duration-300">
      {/* Artisan Red Top Accent Line */}
      <div className="h-1 bg-natural-red w-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Slogan */}
          <div 
            onClick={() => { onSetView("home"); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            {/* Sheriff Badge / Circle Logo wrapper */}
            <div className="w-12 h-12 rounded-full bg-natural-cream flex items-center justify-center border-2 border-natural-red shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <span className="font-display text-xl text-natural-red sheriff-badge-glow">★</span>
            </div>
            
            <div className="flex flex-col">
              <span className="font-display text-2xl sm:text-3xl tracking-wider text-natural-cream leading-none font-bold">
                CONTRY <span className="text-natural-red neon-glow-orange">FOOD</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#a88f72] font-mono mt-0.5">
                The Authentic Artisan Taste
              </span>
            </div>
          </div>

          {/* Desktop Search Bar (Only shown on home view) */}
          {currentView === "home" && (
            <div className="hidden md:flex flex-1 max-w-sm mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Procurando um sabor do rancho?..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-natural-dark border border-natural-border rounded-lg px-4 py-2 font-sans placeholder-natural-cream/30 text-natural-cream focus:outline-none focus:border-natural-red focus:ring-1 focus:ring-natural-red text-sm transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-3 top-2.5 text-natural-cream/60 hover:text-natural-cream"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Right Action Icons (Open status lights & Cart/Favorites buttons) */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Live Store status banner */}
            <div className="flex items-center space-x-2 bg-natural-dark px-3.5 py-1.5 rounded-full border border-natural-border">
              <div className={`w-3 h-3 rounded-full ${settings.storeOpen ? "bg-green-500 pulse-neon" : "bg-red-500"}`} />
              <span className="text-xs uppercase font-mono font-bold tracking-wide">
                {settings.storeOpen ? "Rancho Aberto" : "Fechados"}
              </span>
              <div className="text-[10px] text-natural-cream/60 pl-1 border-l border-natural-border flex items-center">
                <Clock size={11} className="mr-1" />
                {settings.estimatedDeliveryTime}
              </div>
            </div>

            {/* Quick action buttons */}
            <button
              onClick={onViewFavorites}
              className="relative p-2.5 text-natural-cream hover:text-natural-cream/80 hover:bg-natural-dark rounded-full transition-all group"
              title="Favoritos"
            >
              <Heart size={21} className="group-hover:scale-110 transition-transform" />
              {favCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-natural-red text-natural-cream text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-natural-panel shadow">
                  {favCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-natural-red hover:bg-natural-red-hover text-natural-cream font-semibold px-5 py-2.5 rounded-lg flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-natural-red/20"
              title="Meu Carrinho"
            >
              <ShoppingCart size={19} />
              <span className="text-sm font-bold">Meu Pedido</span>
              <span className="bg-natural-dark text-natural-cream text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {cartCount}
              </span>
            </button>

            {/* Admin trigger button */}
            <button
              onClick={() => onSetView(currentView === "home" ? "admin" : "home")}
              className={`p-2.5 rounded-lg text-sm font-semibold flex items-center space-x-1.5 transition-colors ${
                currentView === "admin"
                  ? "bg-natural-red text-natural-cream hover:bg-natural-red-hover"
                  : "bg-natural-dark text-natural-cream hover:text-[#fff] hover:bg-natural-dark/80"
              }`}
            >
              <SettingsIcon size={16} />
              <span>{currentView === "admin" ? "Sair do Painel" : "Painel"}</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-natural-red text-natural-cream rounded-lg flex items-center justify-center hover:bg-natural-red-hover"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-natural-cream text-natural-red text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-natural-panel shadow">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-natural-cream hover:text-natural-cream/80"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-natural-panel border-t border-natural-border px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* Mobile search bar */}
          {currentView === "home" && (
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquisar lanche..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-natural-dark border border-natural-border rounded-lg px-4 py-2 font-sans placeholder-natural-cream/30 text-natural-cream text-sm focus:outline-none focus:border-natural-red"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-2.5 text-natural-cream/60"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}

          {/* Mobile shop state indicator */}
          <div className="flex items-center justify-between bg-natural-dark p-3 rounded-lg border border-natural-border">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${settings.storeOpen ? "bg-green-500 pulse-neon" : "bg-red-500"}`} />
              <span className="text-xs uppercase font-mono font-bold text-natural-cream">
                {settings.storeOpen ? "Rancho Aberto" : "Fechados"}
              </span>
            </div>
            <span className="text-xs text-[#a88f72] font-mono">
              ★ {settings.estimatedDeliveryTime}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5 pt-2">
            <button
              onClick={() => {
                onViewFavorites();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 bg-natural-dark border border-natural-border p-3 rounded-lg text-sm font-semibold text-natural-cream hover:bg-natural-dark/80"
            >
              <Heart size={16} className="text-natural-red fill-natural-red" />
              <span>Favoritos ({favCount})</span>
            </button>

            <button
              onClick={() => {
                onSetView(currentView === "home" ? "admin" : "home");
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 bg-natural-dark border border-natural-border p-3 rounded-lg text-sm font-semibold text-natural-cream hover:bg-natural-dark/80"
            >
              <SettingsIcon size={16} />
              <span>{currentView === "admin" ? "Sair do Admin" : "Painel"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
