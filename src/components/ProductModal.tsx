import React, { useState, useEffect } from "react";
import { X, Plus, Minus, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types";

interface ProductModalProps {
  product: Product | null;
  relatedProducts?: Product[];
  onClose: () => void;
  onAddToCart: (p: Product, quantity: number, obs: string) => void;
  onSubmitReview?: (productId: string, author: string, rating: number, comment: string) => void;
  whatsappNumber: string;
}

const categoryBackups: Record<string, string[]> = {
  burgers: [
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80"
  ],
  combos: [
    "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80"
  ],
  sides: [
    "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?auto=format&fit=crop&w=800&q=80"
  ],
  drinks: [
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"
  ],
  desserts: [
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
  ]
};

export default function ProductModal({
  product,
  onClose,
  onAddToCart
}: ProductModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [obs, setObs] = useState<string>("");

  // Gallery slider states
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Drag states for PC mouse interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Merge product.imageUrl + product.gallery + category back-ups to guarantee a spectacular multi-photo experience
  const images = React.useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();
    
    // 1. Add primary image
    if (product.imageUrl) set.add(product.imageUrl);
    
    // 2. Add gallery images if any
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach(url => {
        if (url) set.add(url);
      });
    }
    
    // 3. Fallback filler to guarantee multiple images
    const backups = categoryBackups[product.category] || categoryBackups.burgers;
    let idx = 0;
    while (set.size < 3 && idx < backups.length) {
      set.add(backups[idx]);
      idx++;
    }
    
    return Array.from(set);
  }, [product]);

  // Clean state whenever product swaps
  useEffect(() => {
    setQuantity(1);
    setObs("");
    setActiveIndex(0);
    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
  }, [product]);

  if (!product) return null;

  const activePrice = product.promoPrice !== null ? product.promoPrice : product.price;

  const handleIncrement = () => setQuantity((q) => q + 1);
  const handleDecrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAdd = () => {
    onAddToCart(product, quantity, obs);
    onClose();
  };

  // Touch slide swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minDistance = 40;
    if (distance > minDistance) {
      // Next Image
      setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    } else if (distance < -minDistance) {
      // Previous Image
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse drag swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - dragStartX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const minDistance = 40;
    if (dragOffset < -minDistance) {
      setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    } else if (dragOffset > minDistance) {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end bg-[#1A120B]/70 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop overlay trigger for closing */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Main Drawer Container: Lateral Drawer on Desktop, Bottom Sheet on Mobile */}
      <div 
        className="relative w-full sm:max-w-md bg-[#24170F] text-[#F8F5F0] rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl shadow-2xl border-t sm:border-t-0 sm:border-l border-white/8 flex flex-col max-h-[90vh] sm:max-h-screen z-10 transition-transform duration-300"
        style={{
          animation: window.innerWidth >= 640 ? "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)" : "slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden flex justify-center py-2 shrink-0">
          <div className="w-12 h-1 rounded-full bg-white/10" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5 shrink-0">
          <span className="text-xs uppercase font-mono tracking-widest text-[#A8A29E] font-bold">
            Detalhes do Item
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-[#F8F5F0] flex items-center justify-center transition-all focus:outline-none"
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Draggable Product Gallery Carousel */}
          <div className="relative aspect-square w-full rounded-xl bg-[#1A120B] border border-white/5 overflow-hidden select-none">
            {/* Sliding Track */}
            <div 
              className="flex h-full select-none cursor-grab active:cursor-grabbing"
              style={{
                transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
                width: `${images.length * 100}%`,
                transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {images.map((imgUrl, idx) => (
                <div key={idx} className="w-full h-full shrink-0 select-none pointer-events-none">
                  <img
                    src={imgUrl}
                    alt={`${product.name} - Foto ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none pointer-events-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Left/Right Click Chevrons */}
            {activeIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveIndex((p) => p - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#D97706]/85 backdrop-blur-xs border border-white/5 flex items-center justify-center text-[#F8F5F0] transition-all hover:scale-105 active:scale-95 z-20 focus:outline-none"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {activeIndex < images.length - 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((p) => p + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-[#D97706]/85 backdrop-blur-xs border border-white/5 flex items-center justify-center text-[#F8F5F0] transition-all hover:scale-105 active:scale-95 z-20 focus:outline-none"
              >
                <ChevronRight size={16} />
              </button>
            )}

            {/* Tiny dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-full z-10 pointer-events-none">
              {images.map((_, idx) => (
                <span 
                  key={idx}
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? "w-4.5 bg-[#D97706]" : "w-1.5 bg-[#F8F5F0]/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Product Metadata */}
          <div className="space-y-1">
            <h2 className="font-display text-lg sm:text-xl text-[#F8F5F0] font-black uppercase tracking-tight">
              {product.name}
            </h2>
            <div className="font-mono text-base font-bold text-[#D97706]">
              R$ {activePrice.toFixed(2)}
            </div>
          </div>

          {/* Short Description (Max 2 lines) */}
          {(product.fullDescription || product.description) && (
            <p className="text-[#A8A29E] text-xs leading-relaxed bg-black/10 p-3 rounded-lg border border-white/5 whitespace-pre-line">
              {product.fullDescription || product.description}
            </p>
          )}

          {/* Quantidade Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider block">
              Quantidade
            </label>
            <div className="flex items-center justify-between bg-black/20 rounded-xl border border-white/8 p-1.5 max-w-[140px]">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#F8F5F0] font-bold select-none focus:outline-none active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-mono font-bold text-[#F8F5F0]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#F8F5F0] font-bold select-none focus:outline-none active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Observation text area */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[#A8A29E] uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} className="text-[#D97706]" />
              Observações
            </label>
            <textarea
              rows={2}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: sem cebola"
              className="w-full bg-black/20 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/40 focus:outline-none focus:border-[#D97706] focus:ring-0 resize-none transition-all"
            />
          </div>
        </div>

        {/* Bottom Drawer Actions */}
        <div className="p-4 sm:p-6 border-t border-white/5 bg-[#24170F]/80 backdrop-blur-xs space-y-3 shrink-0">
          <div className="flex items-center justify-between font-mono text-xs text-[#A8A29E] font-bold px-1">
            <span>SUBTOTAL:</span>
            <span className="text-sm text-[#F8F5F0]">R$ {(activePrice * quantity).toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full h-11 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl font-bold text-xs flex items-center justify-center tracking-wider uppercase transition-all active:scale-98 shadow-md"
          >
            Adicionar Pedido
          </button>
        </div>

      </div>
    </div>
  );
}
