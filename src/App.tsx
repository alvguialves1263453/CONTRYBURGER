import React, { useState, useEffect } from "react";
import { 
  Search, Flag, ShieldAlert, Sparkles, Star, Flame, CupSoda, Trash2, 
  MapPin, Clock, Phone, Heart, ShoppingBag, ArrowRight, Instagram, Facebook,
  X, UtensilsCrossed, Award, ThumbsUp, Quote, CheckCircle, HelpCircle, User, LogIn, Grid, Plus
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import CartDrawer from "./components/CartDrawer";
import AdminPanel from "./components/AdminPanel";
import AuthView from "./components/AuthView";
import CustomerPanel from "./components/CustomerPanel";
import { Product, Coupon, Order, Settings, OrderItem } from "./types";

// Hook Integrations
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useCart } from "./hooks/useCart";
import { useOrders } from "./hooks/useOrders";
import { useRealtime } from "./hooks/useRealtime";
import { useCoupons } from "./hooks/useCoupons";
import { dashboardService } from "./services/dashboardService";

export default function App() {
  // 1. Supabase Auth state
  const { 
    profile, 
    isAdmin, 
    isCliente, 
    isAuthenticated, 
    login: handleSupabaseLogin, 
    register: handleSupabaseRegister, 
    logout: handleSupabaseLogout, 
    updateProfile: handleSupabaseUpdateProfile 
  } = useAuth();

  // 2. Catalog & Favorites sync
  const { 
    products, 
    favoriteIds, 
    loading: productsLoading, 
    toggleFavorite, 
    addProduct: handleAddProduct, 
    updateProduct: handleUpdateProduct, 
    deleteProduct: handleDeleteProduct,
    submitReview: handleSubmitReview,
    refreshData: refreshCatalog
  } = useProducts(profile?.id);

  // 3. Coupon database control
  const { 
    coupons, 
    addCoupon: handleAddCoupon, 
    updateCoupon: handleUpdateCoupon, 
    deleteCoupon: handleDeleteCoupon,
    refreshCoupons
  } = useCoupons();

  // 4. Cart management (guest or synced user cart)
  const { 
    cartItems, 
    loading: cartLoading, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    discount,
    refreshCart
  } = useCart(profile?.id);

  // 5. Orders checkout & history sync
  const { 
    orders, 
    loading: ordersLoading, 
    createOrder, 
    updateOrderStatus: handleUpdateOrder, 
    deleteOrder: handleDeleteOrder,
    refreshOrders
  } = useOrders(profile?.id, isAdmin);

  // Store General settings
  const [settings, setSettings] = useState<Settings>({
    whatsappNumber: "5511999999999",
    storeOpen: true,
    estimatedDeliveryTime: "30-45 min",
    deliveryFee: 7.0
  });

  // Client Specific Interface States
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentView, setCurrentView] = useState<"home" | "admin" | "auth">("home");

  // Selection & Details view states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);

  // Refresh helper for all datasets
  const refreshAll = React.useCallback(async () => {
    await Promise.all([
      refreshCatalog(),
      refreshCoupons(),
      refreshOrders(),
      refreshCart()
    ]);
  }, [refreshCatalog, refreshCoupons, refreshOrders, refreshCart]);

  // Load Store Settings from Database settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const dbSettings = await dashboardService.getShopSettings();
        setSettings(dbSettings);
      } catch (err) {
        console.warn("Failed to load DB settings, using static fallbacks:", err);
      }
    }
    loadSettings();
  }, []);

  // Update Settings from Admin screen
  const handleUpdateSettings = async (sPayload: Settings) => {
    try {
      const updated = await dashboardService.updateShopSettings(sPayload);
      setSettings(updated);
      return updated;
    } catch (err) {
      console.error("Error saving settings:", err);
      throw err;
    }
  };

  // Sync state modifications in Live Realtime Subscriptions
  useRealtime({
    onOrderChange: (payload) => {
      console.log("Realtime order modifier caught:", payload);
      refreshOrders();
    },
    onNotificationChange: (payload) => {
      console.log("Realtime notification alert caught:", payload);
    },
    onProductChange: (payload) => {
      console.log("Realtime product catalog change caught:", payload);
      refreshCatalog();
    }
  });

  // Synchronize modal swapping matching recommendation clicks
  useEffect(() => {
    const handleModalSwap = (e: Event) => {
      const p = (e as CustomEvent).detail as Product;
      setSelectedProduct(p);
    };
    window.addEventListener("product-swap", handleModalSwap);
    return () => window.removeEventListener("product-swap", handleModalSwap);
  }, []);

  // ==========================================
  // CLIENT ADAPTER INTERFACES
  // ==========================================

  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  const handleAddToCartSimple = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (!settings.storeOpen) {
      alert("🤠 Saloon Fechado! Não estamos recebendo pedidos no momento.");
      return;
    }
    addToCart(product, 1);
    setCartDrawerOpen(true);
  };

  const handleAddToCartSophisticated = (product: Product, qty: number, obs: string) => {
    if (!settings.storeOpen) {
      alert("🤠 Saloon Fechado! Não estamos recebendo pedidos no momento.");
      return;
    }
    addToCart(product, qty, obs);
    setCartDrawerOpen(true);
  };

  const handleOrderCompleted = async (orderPayload: any, appliedCouponCode: string | null) => {
    // Adapter payload to compile Order structure cleanly
    const orderData: Omit<Order, "id" | "timestamp"> = {
      customerName: orderPayload.customerName,
      customerPhone: orderPayload.customerPhone,
      customerAddress: orderPayload.customerAddress,
      paymentMethod: orderPayload.paymentMethod,
      items: orderPayload.items,
      subtotal: orderPayload.subtotal,
      discount: orderPayload.discount,
      total: orderPayload.total,
      status: "pendente"
    };

    const response = await createOrder(orderData);
    await clearCart();
    setCartDrawerOpen(false);
    return response;
  };

  // Filters calculation
  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchIngs = p.ingredients ? p.ingredients.some(i => i.toLowerCase().includes(query)) : false;
      if (!matchName && !matchDesc && !matchIngs) return false;
    }
    if (showOnlyFavorites) {
      return favoriteIds.includes(p.id);
    }
    return true;
  });

  const categories = [
    { id: "all", label: "Tudo", icon: <UtensilsCrossed size={14} /> },
    { id: "burgers", label: "Burgers Grelhados", icon: <Flame size={14} /> },
    { id: "combos", label: "Combos Promos", icon: <Sparkles size={14} /> },
    { id: "sides", label: "Batatas & Onion", icon: <Award size={14} /> },
    { id: "drinks", label: "Cold Drinks", icon: <CupSoda size={14} /> },
    { id: "desserts", label: "Doces & Sobremesas", icon: <ThumbsUp size={14} /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-cowboy-cream text-wood-dark font-sans relative antialiased">
      
      {/* Upper Navigation Menu */}
      <Header
        settings={settings}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        favCount={favoriteIds.length}
        onOpenCart={() => setCartDrawerOpen(true)}
        onViewFavorites={() => {
          setShowOnlyFavorites(!showOnlyFavorites);
          setCurrentView("home");
        }}
        currentView={currentView === "auth" ? "home" : currentView}
        onSetView={(view) => {
          if (view === "admin") {
            if (!isAuthenticated) {
              setCurrentView("auth");
            } else {
              setCurrentView("admin");
            }
          } else {
            setCurrentView("home");
          }
          setShowOnlyFavorites(false);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Container routes dispatcher */}
      {currentView === "auth" ? (
        <AuthView
          onLogin={async (email, pass) => {
            const data = await handleSupabaseLogin(email, pass);
            setCurrentView("admin");
            return data;
          }}
          onRegister={async (email, pass, name) => {
            return await handleSupabaseRegister(email, pass, name);
          }}
          onBack={() => setCurrentView("home")}
        />
      ) : currentView === "admin" && isAuthenticated && isCliente ? (
        // For authenticated customers, show the Custom panel with editing controls and order tracking
        <CustomerPanel
          profile={profile!}
          orders={orders}
          favoriteIds={favoriteIds}
          onLogout={async () => {
            await handleSupabaseLogout();
            setCurrentView("home");
          }}
          onUpdateProfile={async (updates) => {
            return await handleSupabaseUpdateProfile(updates);
          }}
        />
      ) : currentView === "admin" && isAuthenticated && isAdmin ? (
        // For logged-in Admin, render the comprehensive analytical management console
        <AdminPanel
          products={products}
          coupons={coupons}
          orders={orders}
          settings={settings}
          onAddProduct={async (p) => {
            await handleAddProduct(p);
            return { success: true };
          }}
          onUpdateProduct={async (p) => {
            await handleUpdateProduct(p);
            return { success: true };
          }}
          onDeleteProduct={async (id) => {
            await handleDeleteProduct(id);
            return { success: true };
          }}
          onAddCoupon={async (c) => {
            await handleAddCoupon(c);
            return { success: true };
          }}
          onUpdateCoupon={async (c) => {
            await handleUpdateCoupon(c.id, c);
            return { success: true };
          }}
          onDeleteCoupon={async (id) => {
            await handleDeleteCoupon(id);
            return { success: true };
          }}
          onUpdateOrder={async (id, status) => {
            await handleUpdateOrder(id, status);
            return { success: true };
          }}
          onDeleteOrder={async (id) => {
            await handleDeleteOrder(id);
            return { success: true };
          }}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : (
        <main className="flex-1 pb-16">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-10 space-y-6 sm:space-y-8 animate-fadeIn">
            
            {/* Featured Products Section - "Produtos em Destaques!" */}
            {products && products.length > 0 && (
              <div className="bg-[#1F130B] border border-[#D97706]/35 rounded-2xl p-5 md:p-6 shadow-xl shadow-black/30 relative overflow-hidden group">
                {/* Visual Accent Ambient Glow background */}
                <div className="absolute -right-24 -top-24 w-48 h-48 bg-[#D97706]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D97706]/15 transition-all duration-500" />
                
                {/* Header */}
                <div className="flex items-center space-x-2.5 mb-5 border-b border-white/5 pb-3">
                  <div className="p-1 px-2 rounded-lg bg-[#D97706]/10 text-[#D97706] animate-pulse">
                    <Star size={16} className="fill-[#D97706]" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg tracking-wider text-[#F8F5F0] font-black uppercase flex items-center gap-2">
                      Produtos em Destaques!
                    </h3>
                    <p className="text-[#A8A29E] text-[10px] sm:text-xs">Os mais amados e selecionados da nossa cozinha campeira</p>
                  </div>
                </div>

                {/* Grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(products.filter((p) => p.isFeatured && p.isActive).length > 0
                    ? products.filter((p) => p.isFeatured && p.isActive).slice(0, 3)
                    : products.filter(p => p.isActive).slice(0, 3)
                  ).map((p) => {
                    const activePrice = p.promoPrice !== null ? p.promoPrice : p.price;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className="bg-[#24170F]/80 hover:bg-[#2c1d14] rounded-xl border border-white/5 hover:border-[#D97706]/30 p-3 flex gap-3.5 transition-all duration-200 cursor-pointer hover:scale-[1.01] hover:shadow-lg hover:shadow-black/25 relative group/card"
                      >
                        {/* Rating stars top right badge */}
                        <div className="absolute top-2 right-2 flex items-center space-x-0.5 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-md border border-white/5 shadow-sm">
                          <Star size={10} className="fill-[#D97706] text-[#D97706]" />
                          <span className="text-[9px] font-mono font-bold text-[#F8F5F0]">5.0</span>
                        </div>

                        {/* Product Image 1:1 */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-[#1A120B] border border-white/5 shrink-0 relative">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                        </div>

                        {/* Text and full ratings */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="font-sans text-xs sm:text-sm text-[#F8F5F0] font-bold leading-tight truncate group-hover/card:text-white transition-colors">
                              {p.name}
                            </h4>
                            
                            {/* Star ratings */}
                            <div className="flex items-center space-x-0.5 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={11}
                                  className="fill-[#D97706] text-[#D97706]"
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-baseline space-x-1.5 mt-1.5">
                            <span className="text-[#D97706] font-mono font-bold text-xs sm:text-sm">
                              R$ {activePrice.toFixed(2)}
                            </span>
                            {p.promoPrice !== null && (
                              <span className="text-[#A8A29E]/50 line-through font-mono text-[9px] sm:text-xs">
                                R$ {p.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="self-end shrink-0">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#D97706]/10 border border-[#D97706]/20 text-[#D97706] group-hover/card:bg-[#D97706] group-hover/card:text-[#F8F5F0] group-hover/card:border-transparent transition-all flex items-center justify-center">
                            <Plus size={14} strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Header of the Menu with Category & Search */}
            <div className="space-y-5">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-natural-border/50 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-6 bg-[#D97706] rounded-full" />
                    <h2 className="font-display text-xl sm:text-2xl tracking-tight text-white font-bold uppercase">
                      Cardápio do Rancho
                    </h2>
                  </div>
                  <p className="text-stone-400 text-xs sm:text-sm">Hambúrgueres artesanais premium na brasa, acompanhamentos e bebidas geladas</p>
                </div>
              </div>

              {/* Combined search & "Filtrar" button bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                {/* Unified Search Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#A8A29E]/40">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar no cardápio de hoje..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#24170F] border border-white/8 rounded-xl pl-9 pr-8 py-2.5 text-xs text-[#F8F5F0] placeholder-[#A8A29E]/40 focus:outline-none focus:border-[#D97706] transition-colors shadow-inner"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 top-3 text-[#A8A29E]/60 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setCategoriesModalOpen(true)}
                    className={`h-[38px] px-4 bg-[#24170F] border border-white/8 text-[#A8A29E] hover:border-[#D97706] hover:text-[#F8F5F0] rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-sm ${
                      (activeCategory !== "all" && !showOnlyFavorites) ? "border-[#D97706] bg-[#D97706]/10 text-[#D97706]" : ""
                    }`}
                  >
                    <Grid size={13} />
                    <span>Filtrar</span>
                    {activeCategory !== "all" && !showOnlyFavorites && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-md bg-[#D97706] text-white text-[9px] uppercase font-mono font-bold leading-none">
                        {categories.find((c) => c.id === activeCategory)?.label}
                      </span>
                    )}
                  </button>

                  {/* Clear Filter button if active */}
                  {(activeCategory !== "all" || showOnlyFavorites) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("all");
                        setShowOnlyFavorites(false);
                      }}
                      className="w-[38px] h-[38px] flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95"
                      title="Limpar filtros"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* PRODUCTS SCALABLE GRID */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-[#24170F]/50 rounded-xl border border-white/8 border-dashed space-y-3">
                <p className="font-display text-base text-[#F8F5F0]">Nenhum prato encontrado com essas preferências.</p>
                <button 
                  onClick={() => { setActiveCategory("all"); setSearchTerm(""); setShowOnlyFavorites(false); }}
                  className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  Limpar Filtros 🍔
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    whatsappNumber={settings.whatsappNumber}
                    isFavorite={false}
                    onToggleFavorite={() => {}}
                    onAddToCart={handleAddToCartSimple}
                    onSelectProduct={setSelectedProduct}
                  />
                ))}
              </div>
            )}

          </section>
        </main>
      )
    }

    {/* Primary Footer */}
    <Footer />

    {/* Product Detail Modal */}
    {selectedProduct && (
      <ProductModal
        product={selectedProduct}
        relatedProducts={[]}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCartSophisticated}
        onSubmitReview={() => {}}
        whatsappNumber={settings.whatsappNumber}
      />
    )}

      {/* Floating Side Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        coupons={coupons}
        settings={settings}
        onOrderCompleted={handleOrderCompleted}
      />

      {/* Categories Grid Modal (Blurred Background) */}
      {categoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fadeIn">
          {/* Backdrop clicking dismisses the overlay */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setCategoriesModalOpen(false)} />
          
          {/* Content Box */}
          <div className="relative w-full max-w-sm bg-[#24170F] border border-white/8 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden z-10 animate-[slideUp_0.22s_cubic-bezier(0.16,1,0.3,1)]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
              <div className="flex items-center space-x-2">
                <Grid size={15} className="text-[#D97706]" />
                <span className="font-display tracking-widest text-[#F8F5F0] font-black uppercase text-xs">
                  Categorias
                </span>
              </div>
              <button
                onClick={() => setCategoriesModalOpen(false)}
                className="w-8 h-8 bg-white/5 hover:bg-white/10 text-[#F8F5F0] rounded-full flex items-center justify-center transition-colors focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>

            {/* Grid Selection of Categories */}
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id && !showOnlyFavorites;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setShowOnlyFavorites(false);
                      setCategoriesModalOpen(false);
                    }}
                    className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all outline-none active:scale-95 ${
                      isSelected
                        ? "bg-[#D97706] text-[#F8F5F0] border-transparent scale-102 font-bold shadow-md shadow-amber-950/25"
                        : "bg-[#1A120B]/60 hover:bg-[#2c1d14] border-white/5 hover:border-white/12 text-[#A8A29E] hover:text-[#F8F5F0]"
                    }`}
                  >
                    <div className="text-xs">
                      {cat.icon}
                    </div>
                    <span className="text-[10px] tracking-wider uppercase font-mono font-bold leading-tight">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom subtle close button on footer */}
            <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setCategoriesModalOpen(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#A8A29E] hover:text-[#F8F5F0] text-[10px] font-bold rounded-lg transition-colors font-mono tracking-wider"
              >
                FECHAR
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
