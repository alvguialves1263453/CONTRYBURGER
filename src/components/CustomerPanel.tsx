import React, { useState } from "react";
import { UserProfile } from "../services/authService";
import { Order } from "../types";
import { User, Phone, MapPin, ClipboardList, LogOut, Heart, Bell, CheckCircle2, Clock } from "lucide-react";

interface CustomerPanelProps {
  profile: UserProfile;
  orders: Order[];
  favoriteIds: string[];
  onLogout: () => void;
  onUpdateProfile: (updates: { fullName: string; phone: string; address: string }) => Promise<any>;
}

export default function CustomerPanel({
  profile,
  orders,
  favoriteIds,
  onLogout,
  onUpdateProfile
}: CustomerPanelProps) {
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [address, setAddress] = useState(profile.address || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage("");
    try {
      await onUpdateProfile({ fullName, phone, address });
      setMessage("Seu perfil cowboy foi atualizado com sucesso! ⭐");
    } catch (err) {
      setMessage("Erro ao atualizar perfil dev. Tente novamente.");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusLabels: Record<Order["status"], string> = {
    pendente: "🔔 Na fila da cozinha",
    em_preparo: "🍳 Sendo preparado na grelha",
    enviado: "🛵 Em rota com o cavaleiro",
    entregue: "✅ Saboreado / Entregue",
    cancelado: "❌ Cancelado"
  };

  const statusColors: Record<Order["status"], string> = {
    pendente: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    em_preparo: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    enviado: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    entregue: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cancelado: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-natural-cream animate-fadeIn">
      
      {/* Hello Board banner */}
      <div className="bg-natural-panel border border-natural-border p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-natural-red/5 blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-4 z-10">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#f97316] to-[#f59e0b] flex items-center justify-center font-bold text-lg text-white font-mono shadow-md">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "C"}
          </div>
          <div>
            <span className="text-[10px] text-cowboy-gold font-mono uppercase tracking-widest font-black">Área do Cliente</span>
            <h2 className="font-display text-xl sm:text-2xl text-white font-bold">Como vai, {fullName || "Ginete d'Oeste"}?</h2>
            <p className="text-stone-400 text-xs mt-1">{profile.email}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-5 py-2.5 bg-stone-850 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto hover:text-white"
        >
          <LogOut size={14} className="text-natural-red" />
          <span>SESSÃO DE LOGOUT</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        
        {/* Profile data and address sheet */}
        <div className="lg:col-span-1 bg-natural-panel rounded-3xl border border-natural-border p-6 space-y-6">
          <div className="border-b border-stone-800 pb-3 flex items-center space-x-2">
            <User size={18} className="text-[#f5a623]" />
            <h3 className="font-display text-sm uppercase tracking-wide font-extrabold text-stone-200">Meus Dados de Entrega</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Nome Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Hank Williams"
                className="w-full bg-natural-dark border border-stone-800 rounded-xl px-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold/60 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Telefone de Contato</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 99999-9999"
                className="w-full bg-natural-dark border border-stone-800 rounded-xl px-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold/60 text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-400 font-semibold uppercase tracking-wider text-[10px]">Endereço Completo</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua das Flores, 120 - Bloco B Ap 34 - Centro"
                className="w-full bg-natural-dark border border-stone-800 rounded-xl px-4 py-3 placeholder-stone-600 focus:outline-none focus:border-cowboy-gold/60 text-white"
              />
            </div>

            {message && (
              <p className="text-[11px] text-center text-green-450 bg-green-500/5 p-2.5 rounded-lg border border-green-500/10">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-3 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white font-bold rounded-xl transition-all shadow hover:opacity-[0.97]"
            >
              {isUpdating ? "Salvando informações..." : "SALVAR ALTERAÇÕES"}
            </button>
          </form>
        </div>

        {/* Orders Tracking and log list */}
        <div className="lg:col-span-2 bg-natural-panel rounded-3xl border border-natural-border p-6 space-y-6">
          
          <div className="border-b border-stone-800 pb-3 flex items-center space-x-2">
            <ClipboardList size={18} className="text-[#f5a623]" />
            <h3 className="font-display text-sm uppercase tracking-wide font-extrabold text-stone-200">
              Acompanhamento de Pedidos ({orders.length})
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-stone-400 text-sm">Você ainda não despachou nenhuma caravana de sabor!</p>
              <p className="text-stone-500 text-xs">Seus pedidos grelhados rústicos aparecerão aqui no momento da compra.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {orders.map((order) => (
                <div key={order.id} className="bg-natural-dark border border-stone-805 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-stone-850 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-extrabold text-cowboy-gold">#PEDIDO {order.id.slice(0, 8)}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono block mt-1">
                        {new Date(order.timestamp).toLocaleString("pt-BR")}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-start sm:items-end">
                      <span className="font-mono font-black text-green-450 text-sm sm:text-base">R$ {order.total.toFixed(2)}</span>
                      <span className="text-[10px] text-stone-500 block">Forma: {order.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] uppercase tracking-widest text-[#a88f72] font-mono">Itens:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-stone-900 border border-stone-850 p-2.5 rounded-xl flex items-center space-x-2">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-8 h-8 object-cover rounded bg-stone-800" />
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-stone-300 truncate">{item.name}</p>
                            <span className="text-[10px] text-stone-500 font-mono">Qtd: {item.quantity} | R$ {item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
