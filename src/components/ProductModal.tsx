import React, { useState } from "react";
import { X, Star, Plus, Minus, Heart, ShoppingCart, Send, ClipboardList, Clock } from "lucide-react";
import { Product, Review } from "../types";

interface ProductModalProps {
  product: Product | null;
  relatedProducts: Product[];
  onClose: () => void;
  onAddToCart: (p: Product, quantity: number, obs: string) => void;
  onSubmitReview: (productId: string, author: string, rating: number, comment: string) => void;
  whatsappNumber: string;
}

export default function ProductModal({
  product,
  relatedProducts,
  onClose,
  onAddToCart,
  onSubmitReview,
  whatsappNumber
}: ProductModalProps) {
  if (!product) return null;

  // Active pricing calculation
  const activePrice = product.promoPrice !== null ? product.promoPrice : product.price;
  const hasPromo = product.promoPrice !== null;

  // Gallery view State
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);
  const images = [product.imageUrl, ...(product.gallery || [])].filter(Boolean);

  // Quantity and customization states
  const [quantity, setQuantity] = useState<number>(1);
  const [obs, setObs] = useState<string>("");

  // Review Submittal form states
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Increment/decrement helpers
  const handleQuantityIncrement = () => setQuantity(p => p + 1);
  const handleQuantityDecrement = () => setQuantity(p => p > 1 ? p - 1 : 1);

  // Action: Add to Bag
  const handleAddBag = () => {
    onAddToCart(product, quantity, obs);
    setObs("");
    setQuantity(1);
    onClose();
  };

  // Action: Instant order checkout
  const handleInstantWhatsAppCheckout = () => {
    const totalPrice = activePrice * quantity;
    const text = `🤠 *COMPRA CORRENDO - CONTRY FOOD* 🤠\n\n` +
                 `Olá! Quero pedir agora pelo WhatsApp:\n` +
                 `🍔 *Item:* ${product.name}\n` +
                 `📦 *Quantidade:* ${quantity}x\n` +
                 `💰 *Valor Total:* R$ ${totalPrice.toFixed(2)}\n` +
                 `✍️ *Observações:* ${obs ? obs : "Nenhuma"}`;

    const formattedPhone = whatsappNumber.replace(/\D/g, "");
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noreferrer");
  };

  // Submit Review Handler
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    onSubmitReview(product.id, reviewAuthor, reviewRating, reviewComment);
    
    setReviewSuccess(true);
    setReviewComment("");
    setReviewAuthor("");
    setReviewRating(5);
    
    setTimeout(() => {
      setReviewSuccess(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-dark/90 backdrop-blur-sm overflow-y-auto">
      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-natural-panel text-natural-cream rounded-3xl overflow-hidden shadow-2xl border border-natural-border my-8 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button top-right overlay */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-natural-dark text-natural-cream hover:bg-natural-red flex items-center justify-center transition-all border border-natural-border"
        >
          <X size={20} />
        </button>

        {/* Column 1: Image Gallery Display */}
        <div className="w-full md:w-1/2 bg-natural-dark/30 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-natural-border overflow-y-auto">
          <div className="space-y-4">
            
            {/* Main Picture */}
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-natural-dark border border-natural-border relative shadow-md">
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-natural-red text-natural-cream text-[10px] tracking-wide font-mono font-bold uppercase px-2.5 py-1.5 rounded-md border border-natural-cream/20">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 justify-center py-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border transition-all ${
                      activeImage === img ? "border-natural-red scale-105 shadow-md" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Ingredients Section */}
            <div className="pt-4 bg-natural-panel p-4 rounded-2xl border border-natural-border shadow-sm">
              <h4 className="font-display text-sm tracking-wide text-natural-cream mb-3 flex items-center pr-2 border-b border-natural-border pb-2 font-bold">
                <ClipboardList size={16} className="text-natural-red mr-2 shrink-0" />
                Ingredientes Selecionados
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-stone-300 text-xs">
                {product.ingredients && product.ingredients.length > 0 ? (
                  product.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="text-natural-red text-sm shrink-0">✔</span>
                      <span className="font-medium">{ing}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-stone-400 italic col-span-2">Receita ultrassegreda da casa!</li>
                )}
              </ul>
            </div>
            
            {/* Delivery estimate note */}
            <div className="bg-natural-dark border border-natural-border p-3 rounded-xl flex items-center justify-between text-xs text-stone-300 font-mono">
              <span className="flex items-center">
                <Clock size={14} className="text-natural-red mr-1.5" /> Est. de Preparo: 
              </span>
              <span className="font-bold text-natural-cream">{product.estimatedTime}</span>
            </div>
          </div>

          {/* Related Products Footer */}
          {relatedProducts.length > 0 && (
            <div className="mt-6 pt-4 border-t border-natural-border">
              <h4 className="font-display text-[11px] tracking-widest text-[#a88f72] font-semibold uppercase mb-3">
                🤠 Dupla Imbatível (Relacionados)
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {relatedProducts.map((p) => {
                  const rPrice = p.promoPrice !== null ? p.promoPrice : p.price;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        // Change focus cleanly
                        setActiveImage(p.imageUrl);
                        setObs("");
                        setQuantity(1);
                        // Swap focused item (triggers state refresh)
                        window.dispatchEvent(new CustomEvent("product-swap", { detail: p }));
                      }}
                      className="bg-natural-dark/60 border border-natural-border rounded-xl p-2 flex items-center space-x-2 cursor-pointer hover:border-natural-red hover:shadow-sm"
                    >
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-natural-cream truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-natural-red font-bold">R$ {rPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Order Options, Reviews, Full Specs */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto bg-natural-panel text-natural-cream">
          
          {/* Top section: Specs and Custom reviews */}
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#a88f72] font-semibold">
                PRODUTO PREMIUM CONTRY FOOD
              </span>
              <h2 className="font-display text-2xl text-natural-cream font-bold mt-1">
                {product.name}
              </h2>
              
              {/* Star Evaluation Rating Summary */}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const sum = product.reviews!.reduce((acc, r) => acc + r.rating, 0);
                      const avg = sum / product.reviews!.length;
                      return <Star key={i} size={15} className={`shrink-0 ${i < Math.round(avg) ? "fill-amber-500" : "text-stone-600"}`} />;
                    })}
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    ({product.reviews.length} avaliações)
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 mt-1 text-stone-400 text-xs">
                  <Star size={13} />
                  <span>Nenhum avaliador ainda, seja o primeiro!</span>
                </div>
              )}
            </div>

            {/* Price tag */}
            <div className="flex items-baseline space-x-3 bg-natural-dark p-3.5 rounded-2xl border border-natural-border">
              <span className="text-xs font-mono font-bold text-[#a88f72] uppercase">Preço:</span>
              <span className="text-2xl font-mono font-extrabold text-natural-cream">
                R$ {activePrice.toFixed(2)}
              </span>
              {hasPromo && (
                <span className="text-stone-400 line-through text-sm font-mono">
                  R$ {product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description Tab */}
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-natural-cream uppercase tracking-wider">Descrição Rústica</h4>
              <p className="text-stone-300 text-xs leading-relaxed font-sans bg-natural-dark p-3 rounded-xl border border-natural-border">
                {product.fullDescription || product.description}
              </p>
            </div>

            {/* Order Observation area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-natural-cream uppercase tracking-wider flex justify-between">
                <span>Instruções Especiais / Observações</span>
                <span className="text-stone-400 font-mono font-normal">opcional</span>
              </label>
              <textarea
                rows={2}
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                placeholder="Ex: Sem cebola, ponto da carne mal passado, molho extra à parte..."
                className="w-full bg-natural-dark border border-natural-border rounded-xl px-4 py-2.5 text-xs text-natural-cream placeholder-natural-cream/30 focus:outline-none focus:border-natural-red focus:ring-1 focus:ring-natural-red resize-none"
              />
            </div>

            {/* Reviews Section & Form */}
            <div className="border-t border-natural-border pt-5 space-y-4">
              <h4 className="font-display text-sm text-natural-cream font-bold">🌟 Comentários dos Clientes</h4>
              
              {/* Existing comments */}
              <div className="space-y-3 max-h-36 overflow-y-auto pr-1">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="bg-natural-dark p-3 rounded-xl border border-natural-border shadow-sm text-xs space-y-1 text-natural-cream">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#f5e8d3]">{rev.author}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{rev.date}</span>
                      </div>
                      <div className="flex text-amber-500 scale-90 origin-left">
                        {Array.from({ length: 5 }).map((_, rIdx) => (
                          <Star key={rIdx} size={11} className={`${rIdx < rev.rating ? "fill-amber-500" : "text-stone-600"}`} />
                        ))}
                      </div>
                      <p className="text-stone-300 italic">"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-400 text-[11px] italic">Sem depoimentos específicos para este hambúrguer.</p>
                )}
              </div>

              {/* Review submit card */}
              <form onSubmit={handleReviewSubmit} className="bg-natural-dark p-3.5 rounded-2xl border border-natural-border space-y-3">
                <div className="text-xs font-bold text-[#a88f72] flex items-center justify-between">
                  <span>Deixe sua Avaliação Caipira</span>
                  {reviewSuccess && <span className="text-green-500 font-mono text-[10px] animate-pulse">✔ Obrigado cowboy!</span>}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className="bg-natural-panel border border-natural-border rounded-lg px-2.5 py-1.5 text-xs text-natural-cream placeholder-natural-cream/35 focus:outline-none focus:border-natural-red"
                  />
                  
                  {/* Custom Star Select */}
                  <div className="flex items-center space-x-0.5 justify-end">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setReviewRating(i + 1)}
                        className="text-amber-400 hover:scale-110 shrink-0"
                      >
                        <Star size={16} className={i < reviewRating ? "fill-amber-400" : "text-stone-600"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Como estava seu lanche? O sabor, o ponto, etc..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-natural-panel border border-natural-border rounded-lg px-3 py-1.5 text-xs text-natural-cream placeholder-natural-cream/35 pr-10 focus:outline-none focus:border-natural-red"
                  />
                  <button
                    type="submit"
                    className="absolute right-1 top-1 h-7 w-7 bg-natural-red hover:bg-natural-red-hover text-natural-cream rounded-md flex items-center justify-center transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom order and buy bar */}
          <div className="border-t border-natural-border pt-5 mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-natural-cream uppercase tracking-wider">Quantidade</span>
              
              <div className="flex items-center bg-natural-dark rounded-full border border-natural-border p-1">
                <button
                  type="button"
                  onClick={handleQuantityDecrement}
                  className="w-8 h-8 rounded-full bg-natural-panel hover:bg-natural-dark flex items-center justify-center text-natural-cream text-sm border border-natural-border font-bold shadow-sm"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-mono font-bold text-natural-cream text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleQuantityIncrement}
                  className="w-8 h-8 rounded-full bg-natural-panel hover:bg-natural-dark flex items-center justify-center text-natural-cream text-sm border border-natural-border font-bold shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Sum total value display */}
            <div className="flex items-center justify-between text-xs font-bold text-stone-300 font-mono bg-natural-dark/65 p-2.5 rounded-lg border border-natural-border">
              <span>SUBTOTAL DO PEDIDO:</span>
              <span className="text-base text-natural-cream font-extrabold">
                R$ {(activePrice * quantity).toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddBag}
                className="w-full h-12 bg-natural-panel hover:bg-natural-dark text-natural-cream border border-natural-border rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow"
              >
                <ShoppingCart size={16} />
                <span>Adicionar à Sacola</span>
              </button>

              <button
                type="button"
                onClick={handleInstantWhatsAppCheckout}
                className="w-full h-12 bg-natural-red hover:bg-natural-red-hover text-natural-cream rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-natural-red/10 active:scale-95 shadow"
              >
                <Send size={16} className="animate-pulse" />
                <span>Pedir pelo WhatsApp</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
