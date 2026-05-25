import React from "react";
import { Heart, ShoppingCart, MessageSquareCode, Sparkles } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  whatsappNumber: string;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, p: Product) => void;
  onAddToCart: (e: React.MouseEvent, p: Product) => void;
  onSelectProduct: (p: Product) => void;
}

export default function ProductCard({
  product,
  whatsappNumber,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onSelectProduct
}: ProductCardProps) {
  
  // Calculate active price based on promotions
  const activePrice = product.promoPrice !== null ? product.promoPrice : product.price;
  const hasPromo = product.promoPrice !== null;

  // Single Click direct flow to WhatsApp
  const handleDirectWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();

    const text = `🤠 *NOVO PEDIDO RÁPIDO - CONTRY FOOD* 🤠\n\n` +
                 `Olá! Gostaria de pedir agora este lanche:\n` +
                 `🍔 *Item:* ${product.name}\n` +
                 `📦 *Quantidade:* 1\n` +
                 `💰 *Valor:* R$ ${activePrice.toFixed(2)}\n\n` +
                 `✍️ *Observações:* Favor preparar com capricho!`;

    const formattedPhone = whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noreferrer");
  };

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="bg-natural-panel rounded-2xl border border-natural-border overflow-hidden hover:border-natural-red hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col relative text-natural-cream shadow-md"
    >
      {/* Decorative top corner rivets */}
      <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-natural-border/60" />
      <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-natural-border/60" />

      {/* Promotional / Tag Badges overlay */}
      {product.badge && (
        <span className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-natural-red text-natural-cream text-[9px] sm:text-[10px] uppercase font-mono font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-md shadow-md border border-natural-cream/15">
          🔥 {product.badge}
        </span>
      )}

      {/* Display Favorite toggle overlay */}
      <button
        onClick={(e) => onToggleFavorite(e, product)}
        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-natural-panel/95 text-stone-300 hover:text-[#fff] hover:bg-natural-dark shadow-md flex items-center justify-center border border-natural-border hover:scale-110 active:scale-95 transition-all"
        title="Salvar nos Favoritos"
      >
        <Heart 
          size={16} 
          className={isFavorite ? "fill-natural-bright-red text-natural-bright-red scale-110" : "transition-colors duration-200"} 
        />
      </button>

      {/* Product Image Frame */}
      <div className="aspect-square w-full overflow-hidden bg-natural-dark relative border-b border-natural-border">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80";
          }}
        />
        {/* Estimated prep time badge overlay */}
        <div className="absolute bottom-2 right-2 bg-natural-dark/90 text-natural-cream font-mono text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-md border border-natural-border">
          ⏱️ {product.estimatedTime}
        </div>
      </div>

      {/* Product Information Form */}
      <div className="p-3 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1 sm:space-y-2">
          {/* Category breadcrumb */}
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a88f72] font-semibold font-mono block">
            {product.category === "burgers" ? "🍔 Hambúrgueres" : 
             product.category === "combos" ? "📦 Combos Caipiras" :
             product.category === "sides" ? "🍟 Acompanhamentos" :
             product.category === "drinks" ? "🍹 Bebidas" : "🥧 Sobremesas"}
          </span>
          
          <h3 className="font-display text-sm sm:text-base md:text-lg text-natural-cream leading-snug group-hover:text-[#fff] transition-colors font-bold line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-stone-300 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Actions Module */}
        <div className="pt-2.5 sm:pt-4 mt-2.5 sm:mt-4 border-t border-natural-border space-y-2.5 sm:space-y-3.5">
          <div className="flex items-center justify-between gap-1">
            <div className="flex flex-col">
              {hasPromo && (
                <span className="text-stone-400 line-through text-[10px] sm:text-xs font-mono leading-none">
                  R$ {product.price.toFixed(2)}
                </span>
              )}
              <span className="text-base sm:text-lg md:text-xl font-mono font-bold text-natural-cream leading-tight">
                R$ {activePrice.toFixed(2)}
              </span>
            </div>
            
            {/* Sales stat tag */}
            {product.salesCount > 0 && (
              <span className="text-[9px] sm:text-[10px] bg-natural-dark border border-natural-border text-[#a88f72] py-0.5 px-1.5 sm:px-2 rounded-full font-mono shrink-0">
                {product.salesCount} vendidos
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            
            {/* Add to Cart button */}
            <button
              onClick={(e) => onAddToCart(e, product)}
              className="flex items-center justify-center space-x-1 sm:space-x-1.5 bg-natural-dark hover:bg-natural-dark/60 text-natural-cream border border-natural-border py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg font-semibold text-[10px] sm:text-xs transition-all active:scale-95 text-center"
            >
              <ShoppingCart size={12} className="shrink-0 text-natural-cream" />
              <span className="truncate">+ Sacola</span>
            </button>
            
            {/* Direct WhatsApp Instant Checkout with prefilled parameters */}
            <button
              onClick={handleDirectWhatsAppOrder}
              className="flex items-center justify-center space-x-0.5 sm:space-x-1 bg-gradient-to-r from-[#f97316] to-[#f59e0b] hover:from-[#ea580c] hover:to-[#d97706] text-white py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg font-bold text-[10px] sm:text-xs transition-all hover:shadow-md active:scale-95 text-center"
            >
              <Sparkles size={11} className="shrink-0 text-white animate-pulse" />
              <span className="truncate">Pedir Já</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
