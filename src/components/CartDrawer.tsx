import React, { useState } from "react";
import { X, Trash2, Tag, ShoppingBag, Plus, Minus, Send, ClipboardList, CreditCard } from "lucide-react";
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
  coupons,
  settings,
  onOrderCompleted
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Checkout Form parameters
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Subtotal calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Discount calculations
  let discount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === "percent") {
      discount = (subtotal * activeCoupon.value) / 100;
    } else if (activeCoupon.type === "fixed") {
      discount = activeCoupon.value;
    }
  }
  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);

  // Delivery Fee
  const deliveryFee = customerAddress.toLowerCase().includes("retirada") ? 0 : settings.deliveryFee;

  // Total
  const total = subtotal - discount + deliveryFee;

  // coupon activation checker
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponInput.trim()) return;

    const codeUpper = couponInput.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === codeUpper);

    if (!found) {
      setCouponError("Fivela furada! Esse cupom não existe.");
      setActiveCoupon(null);
      return;
    }

    if (!found.isActive) {
      setCouponError("Este cupom já expirou no Velho Oeste!");
      setActiveCoupon(null);
      return;
    }

    // Check expiry
    const today = new Date().toISOString().split("T")[0];
    if (found.expiryDate && found.expiryDate < today) {
      setCouponError("Cupom vencido em " + found.expiryDate);
      setActiveCoupon(null);
      return;
    }

    // Check uses count
    if (found.maxUses > 0 && found.currentUses >= found.maxUses) {
      setCouponError("Este cupom atingiu o limite de usos!");
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(found);
    setCouponSuccess(`Cupom aplicado! Desconto de ` + (found.type === "percent" ? `${found.value}%` : `R$ ${found.value.toFixed(2)}`));
  };

  // Final Order submittal
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Por favor, preencha todos os dados de entrega cowboy!");
      return;
    }

    // Prepare metadata payload for server databases
    const orderPayload = {
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      items: cartItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        obs: item.obs
      })),
      subtotal,
      discount,
      total,
      appliedCouponCode: activeCoupon ? activeCoupon.code : null,
      status: "pendente"
    };

    try {
      // 1. Post to Express database to update administrative stats/reports
      const response = await onOrderCompleted(orderPayload, activeCoupon ? activeCoupon.code : null);
      const generatedOrderId = response.order?.id || "ord-" + Math.floor(1000 + Math.random() * 9000);

      // 2. Build structured text for WhatsApp redirect
      let text = `🤠 *CONTRY FOOD - NOTA DE PEDIDO (${generatedOrderId})* 🤠\n` +
                 `----------------------------------------\n` +
                 `Olá, meu pedido já está registrado no site! Aqui estão os detalhes:\n\n` +
                 `👤 *Cliente:* ${customerName}\n` +
                 `📞 *Telefone:* ${customerPhone}\n` +
                 `📍 *Endereço:* ${customerAddress}\n` +
                 `💰 *Forma de Pagamento:* ${paymentMethod}\n` +
                 `----------------------------------------\n\n` +
                 `📦 *LANCHES ENCOMENDADOS:*\n`;

      cartItems.forEach((item, index) => {
        text += `${index + 1}. *${item.name}* x${item.quantity}\n` +
                `   Subtotal: R$ ${(item.price * item.quantity).toFixed(2)}\n` +
                (item.obs ? `   ✍️ Obs: _${item.obs}_\n` : "");
      });

      text += `\n----------------------------------------\n` +
              `💵 *Subtotal:* R$ ${subtotal.toFixed(2)}\n`;

      if (discount > 0) {
        text += `🏷️ *Cupom Aplicado:* ${activeCoupon?.code} (- R$ ${discount.toFixed(2)})\n`;
      }

      text += `🛵 *Taxa de Entrega:* R$ ${deliveryFee > 0 ? `${deliveryFee.toFixed(2)}` : "Grátis (Retirada)"}\n` +
              `🚨 *VALOR TOTAL DO PEDIDO:* R$ ${total.toFixed(2)}\n\n` +
              `----------------------------------------\n` +
              `Estou no aguardo da confirmação do preparo! Obrigado! 🍔⭐`;

      const formattedPhone = settings.whatsappNumber.replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
      
      // 3. Trigger WhatsApp chat in a new secure window
      window.open(whatsappUrl, "_blank", "noreferrer");
      
      // Clear form & Cart is handled inside App.tsx callback
      setActiveCoupon(null);
      setCouponInput("");
      setCouponSuccess("");
    } catch (err) {
      console.error("Erro ao enviar pedido para o servidor:", err);
      alert("Houve um pequeno problema ao finalizar o pedido, mas você pode tentar novamente!");
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex max-w-full pl-10 md:pl-0">
      
      {/* Click-outside backdrop backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-natural-dark/80 backdrop-blur-sm transition-opacity duration-300" 
      />

      {/* Floating Panel wrapper */}
      <div className="relative w-screen max-w-md bg-natural-panel border-l border-natural-border text-natural-cream shadow-2xl flex flex-col h-full z-10">
        
        {/* Header bar */}
        <div className="bg-natural-dark text-natural-cream p-5 flex items-center justify-between border-b border-natural-border">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="text-natural-red shrink-0 h-5 w-5" />
            <span className="font-display tracking-wide text-lg text-natural-cream font-bold">
              Sua Sacola Gourmet
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="w-9 h-9 bg-natural-panel text-natural-cream rounded-full flex items-center justify-center hover:bg-natural-red transition-colors border border-natural-border"
          >
            <X size={18} />
          </button>
        </div>

        {/* Outer Grid content scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* List items if any */}
          {cartItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-natural-dark border border-natural-border flex items-center justify-center text-natural-cream/60">
                <ShoppingBag size={28} />
              </div>
              <div className="space-y-1">
                <p className="font-display text-sm text-natural-cream font-bold">Sua sacola está vazia!</p>
                <p className="text-stone-300 text-xs">Adicione os saborosos lanches do cardápio.</p>
              </div>
              <button
                onClick={onClose}
                className="bg-natural-red text-natural-cream font-bold text-xs py-2 px-5 rounded-lg hover:bg-natural-red-hover transition-all"
              >
                Explorar Cardápio 🍔
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono text-[#a88f72] uppercase tracking-widest border-b border-natural-border pb-2">
                Itens na Sacola ({cartItems.length})
              </h3>

              <div className="divide-y divide-natural-border max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.productId} className="py-3 flex items-start justify-between gap-3">
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-natural-dark border border-natural-border shrink-0" 
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-natural-cream truncate">{item.name}</p>
                      <p className="text-[11px] font-mono font-semibold text-natural-cream">R$ {item.price.toFixed(2)}</p>
                      {item.obs && (
                        <p className="text-[10px] text-stone-400 italic line-clamp-1 mt-0.5">
                          ✍️ Obs: "{item.obs}"
                        </p>
                      )}
                      
                      {/* Quantity Incrementor */}
                      <div className="flex items-center space-x-2 mt-1.5">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                          className="w-5 h-5 rounded-full bg-natural-dark hover:bg-natural-dark/60 text-natural-cream flex items-center justify-center text-xs shadow-sm border border-natural-border"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-mono font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-5 h-5 rounded-full bg-natural-dark hover:bg-natural-dark/60 text-natural-cream flex items-center justify-center text-xs shadow-sm border border-natural-border"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.productId)}
                      className="p-1.5 text-stone-400 hover:text-natural-red transition-colors self-center rounded hover:bg-natural-dark"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon voucher Form if items in cart */}
          {cartItems.length > 0 && (
            <div className="bg-natural-dark border border-natural-border p-4 rounded-2xl shadow-inner space-y-3">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="DIGITE SEU CUPOM"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-natural-panel border border-[#3e2d21] rounded-lg pl-8 pr-3 py-1.5 text-xs text-natural-cream placeholder-natural-cream/35 focus:outline-none focus:border-natural-red uppercase font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-natural-red hover:bg-natural-red-hover text-natural-cream font-bold font-mono text-xs px-4 py-1.5 rounded-lg shadow transition-colors"
                >
                  VALIDAR
                </button>
              </form>
              
              {/* Messages for applying coupon */}
              {couponError && <p className="text-[10px] text-natural-bright-red font-bold font-mono">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-green-500 font-bold font-mono">{couponSuccess}</p>}
            </div>
          )}

          {/* Checkout delivery information */}
          {cartItems.length > 0 && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-1">
              <h3 className="text-xs font-bold font-mono text-[#a88f72] uppercase tracking-widest border-b border-natural-border pb-2 flex items-center">
                <ClipboardList size={14} className="mr-1 text-natural-red" /> Dados para Entrega / Retirada
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-300">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Alcaparra"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-natural-panel border border-[#3e2d21] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-natural-red text-natural-cream"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-300">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (11) 98888-7777"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-natural-panel border border-[#3e2d21] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-natural-red text-natural-cream"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-stone-300">Endereço de Entrega *</label>
                    <button
                      type="button"
                      onClick={() => setCustomerAddress("Retirada no Balcão do Rocha")}
                      className="text-[9px] font-bold text-natural-red hover:underline uppercase font-mono"
                    >
                      Marcar Retirada 🍔
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua das Flores, 142 - Bloco B, Apt 31 ou digite 'Retirada'"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-natural-panel border border-[#3e2d21] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-natural-red text-natural-cream"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-300">Forma de Pagamento *</label>
                  <div className="relative">
                    <CreditCard size={13} className="absolute left-3 top-2.5 text-stone-400" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-natural-panel border border-[#3e2d21] rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:border-natural-red text-natural-cream"
                    >
                      <option value="Pix" className="bg-natural-panel">Pix (Recomendo - Rápido e Seguro)</option>
                      <option value="Cartão de Crédito" className="bg-natural-panel">Cartão de Crédito (na entrega)</option>
                      <option value="Cartão de Débito" className="bg-natural-panel">Cartão de Débito (na entrega)</option>
                      <option value="Dinheiro (com troco)" className="bg-natural-panel">Dinheiro (com troco)</option>
                      <option value="Dinheiro (sem troco)" className="bg-natural-panel">Dinheiro (sem troco)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button type="submit" className="hidden" id="hidden-cart-submit" />
            </form>
          )}

        </div>

        {/* Final receipt footer breakdown if items present */}
        {cartItems.length > 0 && (
          <div className="bg-natural-dark border-t border-natural-border p-5 space-y-4">
            
            {/* Price lines */}
            <div className="space-y-1.5 text-xs text-stone-300 font-mono">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-500 font-bold">
                  <span>Desconto Aplicado:</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Taxa de Entrega:</span>
                <span>{deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2)}` : "Grátis / Retirada"}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-[#fff] pt-1.5 border-t border-dashed border-natural-border font-sans">
                <span>VALOR TOTAL DO PEDIDO:</span>
                <span className="text-xl text-natural-cream font-mono font-black">
                  R$ {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Direct Checkout Submit CTA */}
            <button
              onClick={() => {
                const formSubmit = document.getElementById("hidden-cart-submit");
                if (formSubmit) formSubmit.click();
              }}
              disabled={cartItems.length === 0}
              className="w-full py-4 bg-natural-red hover:bg-natural-red-hover disabled:bg-stone-800 disabled:cursor-not-allowed text-natural-cream font-bold rounded-xl shadow-lg hover:shadow-natural-red/10 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <Send size={16} />
              <span className="text-sm font-sans tracking-wide">CONFIRMAR PEDIDO NO WHATSAPP</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
