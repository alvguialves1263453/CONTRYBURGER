import React from "react";
import { Plus } from "lucide-react";
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
  onSelectProduct
}: ProductCardProps) {
  // Calculate active price
  const activePrice = product.promoPrice !== null ? product.promoPrice : product.price;

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="bg-[#24170F] hover:bg-[#2c1d14] rounded-xl border border-white/8 p-3 sm:p-4 flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99] group shadow-sm"
    >
      {/* Small Photo Left (80x80 pixels) */}
      <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg overflow-hidden bg-[#1A120B] border border-white/5 shrink-0 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80";
          }}
        />
      </div>

      {/* Product Details Middle Panel */}
      <div className="flex-1 min-w-0 pr-1">
        <span className="text-[9px] font-mono tracking-widest text-[#A8A29E]/60 uppercase font-black">
          {product.category === "burgers" ? "🍔 Hambúrguer" : 
           product.category === "combos" ? "📦 Combo" :
           product.category === "sides" ? "🍟 Porção" :
           product.category === "drinks" ? "🍹 Bebida" : "🥧 Doce"}
        </span>
        <h3 className="font-sans text-sm sm:text-base text-[#F8F5F0] font-bold leading-tight truncate group-hover:text-white transition-colors mt-0.5">
          {product.name}
        </h3>
        <span className="text-[#D97706] font-mono font-bold text-xs sm:text-sm block mt-1">
          R$ {activePrice.toFixed(2)}
        </span>
      </div>

      {/* Tiny Stylish Right Action element */}
      <div className="shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] group-hover:bg-[#D97706] group-hover:text-[#F8F5F0] group-hover:border-transparent transition-all flex items-center justify-center font-bold">
          <Plus size={16} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
