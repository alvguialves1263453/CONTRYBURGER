import React, { useState } from "react";
import { X, ArrowLeft, Trash2, Plus, Minus, Send, ShoppingBag } from "lucide-react";
import { OrderItem, Coupon, Settings } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  coupons: Coupon[];
  settings: Settings;
  onOrderCompleted: (orderData: any, couponCodeApplied: string | null) => Promise<any>;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  settings,
  onOrderCompleted
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Flow step state: "cart" or "checkout"
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  // Minimalist checkout form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerComplement, setCustomerComplement] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix"); // "Pix" | "Dinheiro" | "Cartão"
  const [orderNotes, setOrderNotes] = useState("");

  // Subtotal calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = settings.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Build standard payload for server db tracking
    const orderPayload = {
      customerName,
      customerPhone,
      customerAddress: `${customerAddress}${customerComplement ? `, ${customerComplement}` : ""}`,
      paymentMethod,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        obs: item.obs
      })),
      subtotal,
      discount: 0,
      total,
      status: "pendente"
    };

    try {
      // Post to secure back-end
      await onOrderCompleted(orderPayload, null);

      // Build precise WhatsApp format requested by user
      let whatsappMsg = `🍔 *NOVO PEDIDO*\n\n` +
                        `*Cliente:*\n${customerName}\n\n` +
                        `*Telefone:*\n${customerPhone}\n\n` +
                        `*Endereço:*\n${customerAddress}${customerComplement ? ` - ${customerComplement}` : ""}\n\n` +
                        `*Pedido:*\n`;

      cartItems.forEach((item) => {
        whatsappMsg += `${item.quantity}x ${item.name}` + (item.obs ? ` (_${item.obs}_)` : "") + `\n`;
      });

      whatsappMsg += `\n*Observações:*\n${orderNotes ? orderNotes : "Sem observações"}\n\n` +
                     `*Pagamento:*\n${paymentMethod}\n\n` +
                     `*Total:*\nR$ ${total.toFixed(2)}`;

      const formattedPhone = settings.whatsappNumber.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMsg)}`;

      // Reset form states and step
      setStep("cart");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCustomerComplement("");
      setOrderNotes("");
      setPaymentMethod("Pix");

      window.open(whatsappUrl, "_blank", "noreferrer");
    } catch (err) {
      console.error("Error finalizing checkout:", err);
      alert("Houve um pequeno problema ao registrar seu pedido, por favor tente novamente.");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-6 sm:pl-0">
      {/* Background overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#1A120B]/70 backdrop-blur-xs transition-opacity duration-300" 
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-screen max-w-md bg-[#24170F] border-l border-white/8 text-[#F8F5F0] shadow-2xl flex flex-col h-full z-10 animate-[slideInRight_0.22s_cubic-bezier(0.16,1,0.3,1)]">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/5 bg-[#1A120B]">
          {step === "checkout" ? (
            <button 
              onClick={() => setStep("cart")}
              className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#A8A29E] hover:text-[#F8F5F0] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>VOLTAR</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              <ShoppingBag size={16} className="text-[#D97706]" />
              <span className="font-display tracking-widest text-[#F8F5F0] font-black uppercase text-sm">
                Minha Sacola
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/5 text-[#F8F5F0] rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          
          {step === "cart" ? (
            /* ================= STEP 1: CART OVERVIEW ================= */
            cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A8A29E]">
                  <ShoppingBag size={20} />
                </div>
                <div className="space-y-1">
                  <p className="font-display text-sm text-[#F8F5F0] font-bold">Sua sacola está vazia</p>
                  <p className="text-[#A8A29E] text-xs">Adicione itens deliciosos do nosso rancho.</p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-[#D97706]/10 border border-[#D97706]/35 text-[#D97706] hover:bg-[#D97706] hover:text-white font-bold text-xs py-2 px-5 rounded-lg transition-all"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono font-bold text-[#A8A29E] uppercase tracking-wider">
                    Itens Adicionados ({cartItems.length})
                  </span>
                </div>

                <div className="divide-y divide-white/5 max-h-[50vh] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="py-3.5 flex items-start gap-3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-[#1A120B] border border-white/5 shrink-0" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=85";
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-[#F8F5F0] truncate">{item.name}</p>
                        <p className="text-[11px] font-mono font-bold text-[#D97706] mt-0.5">R$ {item.price.toFixed(2)}</p>
                        {item.obs && (
                          <p className="text-[10px] text-[#A8A29E] italic mt-0.5 truncate">
                            Obs: "{item.obs}"
                          </p>
                        )}
                        
                        {/* Elegant direct quantity edit controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xs border border-white/5 focus:outline-none"
                          >
                            <Minus size={9} />
                          </button>
                          <span className="text-xs font-mono font-bold w-5 text-center text-[#F8F5F0]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-white flex items-center justify-center text-xs border border-white/5 focus:outline-none"
                          >
                            <Plus size={9} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="p-1.5 text-[#A8A29E]/50 hover:text-[#D97706] hover:bg-white/5 rounded transition-all focus:outline-none self-center"
                        title="Remover item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            /* ================= STEP 2: MINIMALIST CHECKOUT FORM ================= */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 animate-[slideUp_0.2s_ease-out]">
              <div className="border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono font-bold text-[#A8A29E] uppercase tracking-wider block">
                  Informações de Entrega
                </span>
              </div>

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] block">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome Completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-black/15 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/30 focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>

              {/* Telefone */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] block">
                  Telefone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(00) 00000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-black/15 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/30 focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>

              {/* Endereço */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] block">
                  Endereço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rua, número e bairro"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-black/15 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/30 focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>

              {/* Complemento */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] block">
                  Complemento
                </label>
                <input
                  type="text"
                  placeholder="Apt, bloco, ponto de referência (opcional)"
                  value={customerComplement}
                  onChange={(e) => setCustomerComplement(e.target.value)}
                  className="w-full bg-black/15 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/30 focus:outline-none focus:border-[#D97706] transition-colors"
                />
              </div>

              {/* Forma de Pagamento - Customized Radios */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] block">
                  Forma de Pagamento *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Pix", "Dinheiro", "Cartão"].map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold font-mono transition-colors border text-center ${
                          isSelected
                            ? "bg-[#D97706]/10 text-[#D97706] border-[#D97706]"
                            : "bg-black/10 text-[#A8A29E] border-white/8 hover:text-[#F8F5F0] hover:bg-black/20"
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#A8A29E] block">
                  Observações de Entrega
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções para o entregador, troco se dinheiro, etc."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-black/15 border border-white/8 rounded-xl px-3.5 py-2 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/30 focus:outline-none focus:border-[#D97706] resize-none transition-colors"
                />
              </div>

              <button type="submit" className="hidden" id="hidden-drawer-form-submit" />
            </form>
          )}

        </div>

        {/* Drawer Footer Summary & Buttons */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-white/5 bg-[#1A120B]">
            <div className="space-y-1.5 text-xs text-[#A8A29E] font-mono mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-[#F8F5F0]">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Entrega:</span>
                <span className="text-[#F8F5F0]">R$ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/5 my-2" />
              <div className="flex justify-between text-sm font-bold font-sans text-[#F8F5F0]">
                <span>TOTAL:</span>
                <span className="text-base text-[#D97706] font-mono">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {step === "cart" ? (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full h-11 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all active:scale-98 shadow-md"
              >
                Finalizar Pedido
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const element = document.getElementById("hidden-drawer-form-submit");
                  if (element) element.click();
                }}
                className="w-full h-11 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 tracking-wider uppercase transition-all active:scale-98 shadow-md"
              >
                <Send size={12} />
                <span>Enviar Pedido</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
