import React, { useState } from "react";
import { 
  Lock, TrendingUp, DollarSign, ShoppingCart, Users, Tag, Plus, Trash2, 
  Edit, Save, X, Phone, Power, Clock, MapPin, Eye, EyeOff, BarChart2, Star, CheckCheck
} from "lucide-react";
import { Product, Coupon, Order, Settings } from "../types";

interface AdminPanelProps {
  products: Product[];
  coupons: Coupon[];
  orders: Order[];
  settings: Settings;
  onUpdateProduct: (p: Product) => Promise<any>;
  onAddProduct: (p: any) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  onUpdateCoupon: (c: Coupon) => Promise<any>;
  onAddCoupon: (c: any) => Promise<any>;
  onDeleteCoupon: (id: string) => Promise<any>;
  onUpdateOrder: (id: string, status: Order["status"]) => Promise<any>;
  onDeleteOrder: (id: string) => Promise<any>;
  onUpdateSettings: (s: Settings) => Promise<any>;
}

export default function AdminPanel({
  products,
  coupons,
  orders,
  settings,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onUpdateCoupon,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateOrder,
  onDeleteOrder,
  onUpdateSettings
}: AdminPanelProps) {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Sub-Navigation within admin panel: dashboard, orders, products, coupons, settings
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "products" | "coupons" | "settings">("dashboard");

  // Local copy of Settings for instant editing
  const [localSettings, setLocalSettings] = useState<Settings>({ ...settings });

  // Creating/Editing Product states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    promoPrice: "" as string | number,
    badge: "",
    category: "burgers",
    imageUrl: "",
    ingredients: "",
    fullDescription: "",
    estimatedTime: "20-25 min",
    isFeatured: false,
    isPromo: false,
    isActive: true
  });

  // Creating/Editing Coupon states
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    value: 0,
    expiryDate: "",
    maxUses: 100,
    isActive: true
  });

  // Handle Login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Credenciais inválidas do Xerife! Tente novamente.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-wood-dark px-4 py-12 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative w-full max-w-md bg-stone-900 rounded-3xl border-4 border-wood-medium p-8 shadow-2xl space-y-6 text-cowboy-cream text-center">
          
          {/* Western lock icon block */}
          <div className="mx-auto w-16 h-16 rounded-full bg-cowboy-gold/10 border-2 border-cowboy-gold flex items-center justify-center text-cowboy-gold">
            <Lock size={30} className="sheriff-badge-glow" />
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-2xl text-cowboy-gold tracking-wide">PORTÃO DO RANCHO</h2>
            <p className="text-stone-400 text-xs font-mono uppercase tracking-widest">Painel Administrativo Restrito</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-cowboy-beige/80 tracking-wider">Usuário do Admin</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex e padrão: admin"
                className="w-full bg-stone-800 border-2 border-wood-medium rounded-xl px-4 py-2.5 text-sm placeholder-stone-500 focus:outline-none focus:border-cowboy-gold text-cowboy-cream"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-cowboy-beige/80 tracking-wider">Senha de Entrada</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Padrão: 1234"
                className="w-full bg-stone-800 border-2 border-wood-medium rounded-xl px-4 py-2.5 text-sm placeholder-stone-500 focus:outline-none focus:border-cowboy-gold text-cowboy-cream"
              />
            </div>

            {authError && (
              <p className="text-xs font-mono text-cowboy-red font-bold text-center animate-pulse">
                ⚠ {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-cowboy-gold hover:bg-cowboy-gold/90 text-stone-900 font-bold rounded-xl transition-all border-b-4 border-amber-700 active:translate-y-0.5"
            >
              AUTENTICAR NO SALON
            </button>
          </form>

          <p className="text-[10px] text-stone-500 font-mono">
            * Use as credenciais fornecidas no requisito: admin / 1234
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // METRICS & STATISTICS (Tab: Dashboard)
  // ==========================================

  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter(o => o.status === "entregue");
  const pendingOrders = orders.filter(o => o.status === "pendente" || o.status === "em_preparo");
  
  // Total Revenue: sum of totals of checked-out completed or active orders except cancelled
  const activeOrders = orders.filter(o => o.status !== "cancelado");
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Best selling products calculation
  const sortedProductsBySales = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 4);

  // Status Colors Mapping
  const statusLabels: Record<Order["status"], string> = {
    pendente: "🔔 Pendente",
    em_preparo: "🍳 Em Preparo",
    enviado: "🛵 Enviado",
    entregue: "✅ Entregue",
    cancelado: "❌ Cancelado"
  };

  const statusBgColors: Record<Order["status"], string> = {
    pendente: "bg-yellow-950 text-yellow-300 border border-yellow-850",
    em_preparo: "bg-blue-950 text-blue-300 border border-blue-850",
    enviado: "bg-cyan-950 text-cyan-300 border border-cyan-850",
    entregue: "bg-emerald-950 text-emerald-300 border border-emerald-850",
    cancelado: "bg-rose-950 text-rose-300 border border-rose-850"
  };

  // Create Product Submit handler
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemData = {
      ...productForm,
      price: Number(productForm.price),
      promoPrice: productForm.promoPrice === "" ? null : Number(productForm.promoPrice),
      ingredients: productForm.ingredients.split(",").map(i => i.trim()).filter(Boolean),
    };

    if (isAddingProduct) {
      await onAddProduct(itemData);
      setIsAddingProduct(false);
    } else if (editingProduct) {
      await onUpdateProduct({ ...editingProduct, ...itemData });
      setEditingProduct(null);
    }

    // Reset Product state
    setProductForm({
      name: "",
      description: "",
      price: 0,
      promoPrice: "",
      badge: "",
      category: "burgers",
      imageUrl: "",
      ingredients: "",
      fullDescription: "",
      estimatedTime: "20-25 min",
      isFeatured: false,
      isPromo: false,
      isActive: true
    });
  };

  // Open Product Edit Mode
  const handleStartEditProduct = (p: Product) => {
    setEditingProduct(p);
    setIsAddingProduct(false);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      promoPrice: p.promoPrice !== null ? p.promoPrice : "",
      badge: p.badge || "",
      category: p.category,
      imageUrl: p.imageUrl,
      ingredients: p.ingredients ? p.ingredients.join(", ") : "",
      fullDescription: p.fullDescription || "",
      estimatedTime: p.estimatedTime || "20-25 min",
      isFeatured: !!p.isFeatured,
      isPromo: !!p.isPromo,
      isActive: p.isActive !== false
    });
  };

  // Create Coupon Submit handler
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCoupon({
      ...couponForm,
      code: couponForm.code.toUpperCase(),
      value: Number(couponForm.value),
    });
    setIsAddingCoupon(false);
    setCouponForm({
      code: "",
      type: "percent",
      value: 0,
      expiryDate: "",
      maxUses: 100,
      isActive: true
    });
  };

  // Save Settings handler
  const handleSaveSettings = async () => {
    await onUpdateSettings(localSettings);
    alert("Configurações do Rancho atualizadas com sucesso!");
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen py-8 border-b-8 border-stone-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Title Panel */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-stone-805 gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-3xl text-cowboy-gold flex items-center">
              ⭐ REINADO DE PRODUTOS CONTROLLER
            </h1>
            <p className="text-stone-400 text-xs font-mono uppercase tracking-widest">
              Controle Geral do Velho Oeste — Contry Food Burger
            </p>
          </div>

          {/* Quick shop state indicator */}
          <div className="flex items-center space-x-3 bg-stone-900 border border-stone-800 p-3 rounded-2xl">
            <span className="text-xs text-stone-400 font-mono">Modo Aberto:</span>
            <button
              onClick={() => {
                const updated = { ...localSettings, storeOpen: !settings.storeOpen };
                setLocalSettings(updated);
                onUpdateSettings(updated);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center space-x-1.5 ${
                settings.storeOpen ? "bg-green-600/20 text-green-400 border border-green-500" : "bg-red-600/20 text-red-450 border border-red-500"
              }`}
            >
              <Power size={12} />
              <span>{settings.storeOpen ? "ABERTO" : "FECHADO"}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Sub-navigation tabs */}
        <div className="flex flex-wrap gap-2 py-6 border-b border-stone-900">
          {[
            { id: "dashboard", label: "📊 Estatísticas Gerais" },
            { id: "orders", label: `🛒 Histórico de Pedidos (${orders.length})` },
            { id: "products", label: "🍔 Cadastrar & Editar Lanches" },
            { id: "coupons", label: "🏷️ Cupons de Desconto" },
            { id: "settings", label: "⚙️ Setup do Meu Rancho" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setEditingProduct(null);
                setIsAddingProduct(false);
              }}
              className={`px-4.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
                activeTab === tab.id
                  ? "bg-cowboy-gold text-stone-950 font-black shadow-md shadow-cowboy-gold/10"
                  : "bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-850"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================
            TAB: DASHBOARD STATS
            ======================================================== */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 pt-8">
            
            {/* Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 flex items-center justify-between shadow">
                <div className="space-y-1">
                  <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest">Faturamento Ativo</p>
                  <p className="text-2xl font-mono font-bold text-green-400">R$ {totalRevenue.toFixed(2)}</p>
                  <p className="text-[10px] text-stone-500 font-sans">* Pedidos ativos (exceto cancelados)</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20">
                  <DollarSign size={22} />
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 flex items-center justify-between shadow">
                <div className="space-y-1">
                  <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest">Acessos e Pedidos</p>
                  <p className="text-2xl font-mono font-bold text-cowboy-gold">{totalOrdersCount}</p>
                  <p className="text-[10px] text-stone-500 font-sans">{completedOrders.length} finalizados com sucesso</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cowboy-gold/10 flex items-center justify-center text-cowboy-gold border border-cowboy-gold/20">
                  <ShoppingCart size={22} />
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 flex items-center justify-between shadow">
                <div className="space-y-1">
                  <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest">Ticket Médio</p>
                  <p className="text-2xl font-mono font-bold text-cyan-400">R$ {averageTicket.toFixed(2)}</p>
                  <p className="text-[10px] text-stone-500 font-sans">* Valor de faturamento / total pedidos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                  <TrendingUp size={22} />
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl border border-stone-800 p-6 flex items-center justify-between shadow">
                <div className="space-y-1">
                  <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest">Pedidos Pendentes</p>
                  <p className="text-2xl font-mono font-bold text-yellow-450">{pendingOrders.length}</p>
                  <p className="text-[10px] text-stone-500 font-sans">Aguardando envio na cozinha</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-450 border border-yellow-500/20">
                  <Users size={22} />
                </div>
              </div>

            </div>

            {/* Visual reports layout: Charts & Best Sellers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Sales analytics mock chart */}
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl lg:col-span-2 space-y-4 shadow">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="text-cowboy-gold shrink-0" size={18} />
                    <h3 className="font-display text-sm tracking-wide text-stone-200">Relatório de Faturamento Diário</h3>
                  </div>
                  <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full font-mono">Maio/2026</span>
                </div>

                {/* SVG custom cowboy bar chart dashboard report */}
                <div className="h-56 w-full flex items-end justify-between gap-2.5 pt-4">
                  {[
                    { day: "Qui 21", amt: 120, height: "h-[30%]", val: "R$ 380" },
                    { day: "Sex 22", amt: 290, height: "h-[65%]", val: "R$ 720" },
                    { day: "Sab 23", amt: 450, height: "h-[90%]", val: "R$ 1.250" },
                    { day: "Dom 24", amt: 350, height: "h-[75%]", val: "R$ 960" },
                    { day: "Hoje", amt: 180, height: "h-[45%]", val: "R$ 480" }
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                      {/* Tooltip on hover */}
                      <span className="hidden group-hover:block absolute top-0 bg-wood-dark border border-cowboy-gold text-cowboy-cream text-[10px] font-mono px-2 py-0.5 rounded-md -translate-y-4 z-10 shadow">
                        {bar.val}
                      </span>
                      
                      <div className={`w-full ${bar.height} bg-gradient-to-t from-orange-850 to-cowboy-gold rounded-t-lg transition-all duration-300 group-hover:opacity-95`} />
                      
                      <span className="text-[10.5px] text-stone-400 mt-2 font-mono">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best selling list */}
              <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4 shadow">
                <div className="border-b border-stone-800 pb-3 flex items-center space-x-2">
                  <Star className="text-cowboy-gold" size={17} />
                  <h3 className="font-display text-sm text-stone-200">🏆 Mais Vendidos no Rancho</h3>
                </div>

                <div className="divide-y divide-stone-800">
                  {sortedProductsBySales.map((p, idx) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-cowboy-gold font-mono font-bold w-4">#{idx+1}</span>
                        <img src={p.imageUrl} alt={p.name} className="w-9 h-9 object-cover rounded-lg shrink-0 bg-stone-800" />
                        <span className="font-bold text-stone-300 truncate">{p.name}</span>
                      </div>
                      <span className="text-[11px] font-mono bg-stone-850 text-stone-300 px-2 py-1 rounded-md border border-stone-800 shrink-0">
                        {p.salesCount || 0} ginetes
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================
            TAB: ORDERS LOG
            ======================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6 pt-8">
            <div className="flex justify-between items-center bg-stone-900 border border-stone-800 p-4 rounded-2xl">
              <span className="text-xs font-mono text-stone-400">Total de Pedidos Logados: {orders.length}</span>
              <span className="text-[11px] text-stone-500 italic">* Estes dados persistem no servidor Express db.json</span>
            </div>

            {orders.length === 0 ? (
              <p className="text-center py-12 text-stone-500 italic">Nenhum pedido recebido ainda nos pampas...</p>
            ) : (
              <div className="space-y-4">
                {[...orders].reverse().map((order) => (
                  <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                    
                    {/* Top order summary */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-stone-800">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-display text-cowboy-gold font-bold">
                            PEDIDO #{order.id}
                          </span>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider py-1 px-2.5 rounded-full ${statusBgColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 font-mono mt-1">
                          Recebido em: {new Date(order.timestamp).toLocaleString("pt-BR")}
                        </p>
                      </div>

                      {/* Display calculations */}
                      <div className="text-right flex flex-col items-start sm:items-end">
                        <span className="text-lg font-mono font-bold text-green-400">
                          R$ {order.total.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          Subtotal: R$ {order.subtotal.toFixed(2)} | Desc: R$ {order.discount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Middle items list */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-300">
                      
                      {/* Products segment */}
                      <div className="space-y-2 md:col-span-2">
                        <h4 className="font-bold text-stone-400 uppercase tracking-widest text-[9px] font-mono">Itens Encomendados</h4>
                        <div className="space-y-1.5 divide-y divide-stone-850">
                          {order.items.map((item, i) => (
                            <div key={i} className="pt-1.5 flex justify-between gap-4">
                              <div>
                                <span className="font-bold text-stone-105">{item.name}</span>
                                <span className="text-stone-550 font-mono"> x{item.quantity}</span>
                                {item.obs && <p className="text-[10px] text-stone-500 italic mt-0.5">✍️ "{item.obs}"</p>}
                              </div>
                              <span className="text-[11px] font-mono text-stone-400 shrink-0">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer contact details segment */}
                      <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 space-y-2.5">
                        <h4 className="font-bold text-stone-400 uppercase tracking-widest text-[9px] font-mono border-b border-stone-800 pb-1.5">Ginete de Destino</h4>
                        <ul className="space-y-1.5 text-[11px] leading-relaxed">
                          <li><strong>Nome:</strong> {order.customerName}</li>
                          <li><strong>Tel:</strong> {order.customerPhone}</li>
                          <li><strong>Forma:</strong> {order.paymentMethod}</li>
                          <li className="line-clamp-2" title={order.customerAddress}>
                            <strong>Rua:</strong> {order.customerAddress}
                          </li>
                        </ul>
                      </div>

                    </div>

                    {/* Actions and Status Updater bar */}
                    <div className="pt-4 border-t border-stone-805 flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-mono text-stone-400 uppercase mr-1">Mudar Status para:</span>
                        {/* Interactive status transitions */}
                        {(["pendente", "em_preparo", "enviado", "entregue", "cancelado"] as Order["status"][]).map((st) => (
                          <button
                            key={st}
                            onClick={() => onUpdateOrder(order.id, st)}
                            disabled={order.status === st}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                              order.status === st
                                ? "bg-stone-800 text-stone-400 blur-[0.3px] cursor-not-allowed"
                                : "bg-stone-900 border border-stone-750 text-stone-300 hover:text-white hover:bg-stone-850"
                            }`}
                          >
                            {st === "em_preparo" ? "🍳 Preparo" : st === "enviado" ? "🛵 Enviar" : st === "entregue" ? "✅ Entregue" : st === "cancelado" ? "❌ Cancelar" : "🔔 Pendente"}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          if (confirm("Quer realmente sumir com este registro de pedido cowboy?")) {
                            onDeleteOrder(order.id);
                          }
                        }}
                        className="py-1.5 px-3 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors"
                      >
                        Excluir Registro
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB: PRODUCT CONTROLLER (Add / Edit / Delete)
            ======================================================== */}
        {activeTab === "products" && (
          <div className="space-y-8 pt-8">
            
            {/* Header control triggers */}
            <div className="flex justify-between items-center border-b border-stone-900 pb-4">
              <h3 className="font-display text-lg text-cowboy-gold font-bold">Gerenciador de Lanches</h3>
              
              {!isAddingProduct && !editingProduct ? (
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="px-4 py-2 bg-cowboy-gold text-stone-950 font-bold text-xs rounded-xl flex items-center space-x-1 border-b-4 border-amber-700 active:translate-y-0.5 transition-all"
                >
                  <Plus size={14} />
                  <span>CADASTRAR NOVO PRODUTO</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-stone-900 text-stone-300 border border-stone-800 text-xs font-semibold rounded-xl flex items-center space-x-1"
                >
                  <X size={14} />
                  <span>CANCELAR</span>
                </button>
              )}
            </div>

            {/* Editing or Adding Form element */}
            {(isAddingProduct || editingProduct) && (
              <form onSubmit={handleProductSubmit} className="bg-stone-900 border-2 border-wood-medium p-6 sm:p-8 rounded-3xl space-y-6">
                <h4 className="font-display text-base text-cowboy-gold">
                  {isAddingProduct ? "🤠 ARREBANHAR NOVO LANCHE (CADASTRO)" : `⚙️ MODIFICAR DADOS: ${editingProduct?.name}`}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-stone-300">
                  
                  {/* Name field */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Nome do Produto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Double Cowboy Burger"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white"
                    />
                  </div>

                  {/* Category select block */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Categoria *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white"
                    >
                      <option value="burgers">Burgers / Sanduíches 🍔</option>
                      <option value="combos">Combos Promocionais 📦</option>
                      <option value="sides">Acompanhamentos / Sides 🍟</option>
                      <option value="drinks">Sucos, Refrigerantes & Bebidas 🍹</option>
                      <option value="desserts">Sobremesas do Rancho 🥧</option>
                    </select>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Breve Descrição para o Cardápio (Exibido na Grade) *</label>
                    <input
                      type="text"
                      required
                      maxLength={180}
                      placeholder="Descrição marcante e curta contendo os principais queijos e carnes..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white"
                    />
                  </div>

                  {/* Pricing grid */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Preço Regular (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 34.90"
                      value={productForm.price || ""}
                      onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white font-mono"
                    />
                  </div>

                  {/* Promo Pricing grid */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Preço Promocional (Deixe em branco p/ inativo)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 29.90"
                      value={productForm.promoPrice}
                      onChange={(e) => setProductForm({ ...productForm, promoPrice: e.target.value !== "" ? parseFloat(e.target.value) : "" })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white font-mono"
                    />
                  </div>

                  {/* Image Url & Stock Image Picker mock uploads */}
                  <div className="space-y-1.5 col-span-2 md:col-span-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase font-bold text-stone-400">Link da Imagem do Produto *</label>
                      <button
                        type="button"
                        onClick={() => {
                          // Quick random photo inject that fits category
                          const catPics: Record<string, string[]> = {
                            burgers: [
                              "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
                              "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
                              "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
                              "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80"
                            ],
                            combos: ["https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80"],
                            sides: ["https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80"],
                            drinks: ["https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80"],
                            desserts: ["https://images.unsplash.com/photo-1507226983735-a838615193b0?auto=format&fit=crop&w=800&q=80"]
                          };
                          const pool = catPics[productForm.category] || catPics.burgers;
                          const pick = pool[Math.floor(Math.random() * pool.length)];
                          setProductForm({ ...productForm, imageUrl: pick });
                        }}
                        className="text-[9px] font-bold text-cowboy-gold uppercase font-mono"
                      >
                        Carregar Foto Padrão do Rancho (Upload) 📸
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Cole um link ou carregue nossa foto padrão acima..."
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white"
                    />
                  </div>

                  {/* Badge banner name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Badge Especial / Selo (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Mais Pedido, Promoção, Cowboy especial..."
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white"
                    />
                  </div>

                  {/* Prep time estimation info */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Tempo de Preparo Estimado</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 15-20 min"
                      value={productForm.estimatedTime}
                      onChange={(e) => setProductForm({ ...productForm, estimatedTime: e.target.value })}
                      className="w-full bg-[#1e1612] border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white font-mono"
                    />
                  </div>

                  {/* Ingredients string list */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Ingredientes (Separados por vírgula) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pão australiano, 180g burger bovino, Creme cheddar, Onion rings, Bacon fatiado"
                      value={productForm.ingredients}
                      onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 focus:outline-none focus:border-cowboy-gold text-white"
                    />
                  </div>

                  {/* Full detailed description block */}
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Descrição Detalhada e Completa para a Página Interna Modal *</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Fale detalhadamente sobre o cozimento da carne, tipo de bacon, textura e o amor depositado nesse lanche..."
                      value={productForm.fullDescription}
                      onChange={(e) => setProductForm({ ...productForm, fullDescription: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-cowboy-gold text-white"
                    />
                  </div>

                  {/* Booleans checkers row */}
                  <div className="col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-stone-850 p-4 rounded-xl border border-stone-800">
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        className="w-4.5 h-4.5 accent-cowboy-gold text-stone-900 rounded"
                      />
                      <span className="text-[11px] font-bold">Marcar como Destaque</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isPromo}
                        onChange={(e) => setProductForm({ ...productForm, isPromo: e.target.checked })}
                        className="w-4.5 h-4.5 accent-cowboy-gold text-stone-900 rounded"
                      />
                      <span className="text-[11px] font-bold">Em Promoção</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isActive}
                        onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                        className="w-4.5 h-4.5 accent-cowboy-gold text-stone-900 rounded"
                      />
                      <span className="text-[11px] font-bold">Lanche Ativo (Exibir)</span>
                    </label>

                  </div>

                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setIsAddingProduct(false);
                    }}
                    className="py-2.5 px-5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold rounded-lg transition-colors border"
                  >
                    Fugir
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-cowboy-gold text-stone-950 hover:bg-opacity-95 font-bold rounded-lg border-b-4 border-amber-700 transition"
                  >
                    SALVAR RECEITA NO ACERVO
                  </button>
                </div>

              </form>
            )}

            {/* List products for instant editing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const pPrice = p.promoPrice !== null ? p.promoPrice : p.price;
                return (
                  <div key={p.id} className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden p-4 flex flex-col justify-between relative gap-4">
                    
                    {/* Feature badges overlay */}
                    <div className="flex justify-between items-start">
                      <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-xl shrink-0 bg-stone-850" />
                      
                      <div className="flex flex-col items-end gap-1 font-mono text-[9px] font-bold">
                        {p.isFeatured && <span className="bg-amber-600/10 text-amber-500 border border-amber-600/25 px-1.5 py-0.5 rounded">★ DESTAQUE</span>}
                        {p.promoPrice !== null && <span className="bg-red-650/10 text-red-455 border border-red-600/25 px-1.5 py-0.5 rounded">% PROMO</span>}
                        {!p.isActive && <span className="bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded">INDISPONÍVEL</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-stone-100 line-clamp-1">{p.name}</h4>
                      <p className="text-stone-400 text-[10.5px] line-clamp-2">{p.description}</p>
                      <p className="text-sm font-mono font-bold text-cowboy-red mt-1">R$ {pPrice.toFixed(2)}</p>
                    </div>

                    <div className="pt-3 border-t border-stone-800 flex justify-between gap-2.5">
                      <button
                        onClick={() => handleStartEditProduct(p)}
                        className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 font-semibold rounded-lg text-[11px] flex items-center justify-center space-x-1 border"
                      >
                        <Edit size={12} />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm("Quer realmente sumir com esta receita do cardápio?")) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="py-1.5 px-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-350 rounded-lg text-[11px] flex items-center justify-center"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB: COUPONS CONTROLLER (Add / Delete)
            ======================================================== */}
        {activeTab === "coupons" && (
          <div className="space-y-8 pt-8">
            <div className="flex justify-between items-center border-b border-stone-900 pb-4">
              <h3 className="font-display text-lg text-cowboy-gold font-bold">Cupons de Desconto</h3>
              
              {!isAddingCoupon ? (
                <button
                  onClick={() => setIsAddingCoupon(true)}
                  className="px-4 py-2 bg-cowboy-gold text-stone-950 font-bold text-xs rounded-xl flex items-center space-x-1 border-b-4 border-amber-700 active:translate-y-0.5"
                >
                  <Plus size={14} />
                  <span>CRIAR CUPOM</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAddingCoupon(false)}
                  className="px-4 py-2 bg-stone-900 text-stone-300 border border-stone-800 text-xs font-semibold rounded-xl flex items-center space-x-1"
                >
                  <X size={14} />
                  <span>CANCELAR</span>
                </button>
              )}
            </div>

            {isAddingCoupon && (
              <form onSubmit={handleCouponSubmit} className="bg-stone-900 border-2 border-wood-medium p-6 sm:p-8 rounded-3xl space-y-5">
                <h4 className="font-display text-base text-cowboy-gold">CRIANDO CUPOM DE DESCONTO</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs text-stone-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Código do Cupom *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: COWBOY20"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 text-white uppercase font-mono font-bold focus:outline-none focus:border-cowboy-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Tipo de Abatimento *</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-2.5 py-2 text-white outline-none focus:border-cowboy-gold"
                    >
                      <option value="percent">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Valor do Abatimento *</label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 10 para 10% ou R$10"
                      value={couponForm.value || ""}
                      onChange={(e) => setCouponForm({ ...couponForm, value: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cowboy-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Data de Expiração *</label>
                    <input
                      type="date"
                      required
                      value={couponForm.expiryDate}
                      onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-stone-400">Limite de Usos Totais</label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 100"
                      value={couponForm.maxUses || ""}
                      onChange={(e) => setCouponForm({ ...couponForm, maxUses: Number(e.target.value) || 100 })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer self-end pb-3">
                    <input
                      type="checkbox"
                      checked={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                      className="w-4.5 h-4.5 accent-cowboy-gold text-stone-900 rounded"
                    />
                    <span className="text-[11px] font-bold">Cupom Ativado</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingCoupon(false)}
                    className="py-2 px-4 bg-stone-800 text-stone-300 font-bold rounded-lg hover:bg-stone-750"
                  >
                    Recuar
                  </button>

                  <button
                    type="submit"
                    className="py-2 px-5 bg-cowboy-gold text-stone-950 font-bold rounded-lg border-b-4 border-amber-700"
                  >
                    CRIAR CUPOM AGORA
                  </button>
                </div>
              </form>
            )}

            {/* Existing Coupons table */}
            <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden shadow">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1c140e] text-cowboy-gold border-b border-stone-800 font-mono tracking-wider">
                  <tr>
                    <th className="p-4 uppercase">CUPOM</th>
                    <th className="p-4 uppercase">ABATIMENTO</th>
                    <th className="p-4 uppercase">VALIDADE</th>
                    <th className="p-4 uppercase">USOS ATUAIS / LIMITE</th>
                    <th className="p-4 uppercase">STATUS</th>
                    <th className="p-4 uppercase text-right">EXCLUIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 text-stone-300">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-850/50">
                      <td className="p-4 font-mono font-bold text-stone-100">{c.code}</td>
                      <td className="p-4 font-mono">
                        {c.type === "percent" ? `${c.value}% de desconto` : `R$ ${c.value.toFixed(2)} fixo`}
                      </td>
                      <td className="p-4 font-mono">{c.expiryDate}</td>
                      <td className="p-4 font-mono">
                        {c.currentUses} / {c.maxUses}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${c.isActive ? "bg-emerald-900/40 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400"}`}>
                          {c.isActive ? "ATIVO" : "INATIVO"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onDeleteCoupon(c.id)}
                          className="p-2 text-stone-400 hover:text-cowboy-red hover:bg-stone-800 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-6 text-center italic text-stone-550">Nenhum cupom disponível...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB: STORE GENERAL PARAMETERS (Settings)
            ======================================================== */}
        {activeTab === "settings" && (
          <div className="space-y-8 pt-8 max-w-2xl">
            
            <div className="bg-stone-900 border-2 border-wood-medium p-6 sm:p-8 rounded-3xl space-y-6">
              <h3 className="font-display text-lg text-cowboy-gold flex items-center border-b border-stone-800 pb-3">
                Setup Global das Configurações
              </h3>

              <div className="grid grid-cols-1 gap-6 text-xs text-stone-300">
                
                {/* Whatsapp Number fields */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400 flex justify-between">
                    <span>Número do WhatsApp Oficial do Rancho *</span>
                    <span className="font-mono text-stone-500">Mudar no WhatsApp</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 text-stone-500" size={15} />
                    <input
                      type="text"
                      required
                      placeholder="Ex: 5511999999999"
                      value={localSettings.whatsappNumber}
                      onChange={(e) => setLocalSettings({ ...localSettings, whatsappNumber: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-700 rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:ring-1 focus:ring-cowboy-gold focus:border-cowboy-gold outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-stone-500 italic">Preencha apenas números, contendo código do país e DDD (ex: 5511999999999). Links e botões redirecionarão para cá.</p>
                </div>

                {/* Delivery Fee fields */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Taxa de Entrega Padrão (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 7.00"
                    value={localSettings.deliveryFee !== undefined ? localSettings.deliveryFee : 7.0}
                    onChange={(e) => setLocalSettings({ ...localSettings, deliveryFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-850 border border-stone-700 rounded-lg px-3 py-2 text-white font-mono focus:ring-1 focus:ring-cowboy-gold focus:border-cowboy-gold"
                  />
                  <p className="text-[10px] text-stone-500 italic">Taxa de envio cobrada caso selecionada entrega a domicílio. Se o comprador digitar 'Retirada' no endereço, a taxa será suspensa.</p>
                </div>

                {/* Estimated Delivery Time fields */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-stone-400">Tempo de Entrega Geral Estimado *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 35-50 min"
                    value={localSettings.estimatedDeliveryTime}
                    onChange={(e) => setLocalSettings({ ...localSettings, estimatedDeliveryTime: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-705 rounded-lg px-3 py-2 text-white font-mono focus:ring-1 focus:ring-cowboy-gold focus:border-cowboy-gold"
                  />
                  <p className="text-[10px] text-stone-500 italic">Prazo geral de remessa informado no cabeçalho do portal para satisfazer os cowboys famintos.</p>
                </div>

              </div>

              <div className="pt-4 border-t border-stone-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-6 py-3 bg-cowboy-gold text-stone-950 font-bold rounded-xl border-b-4 border-amber-700 hover:bg-opacity-95 text-xs tracking-wider transition-all"
                >
                  SALVAR CONFIGURAÇÕES DO RANCHO
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
