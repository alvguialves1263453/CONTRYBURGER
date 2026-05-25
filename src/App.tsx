import React, { useState, useEffect } from "react";
import { 
  Search, Flag, ShieldAlert, Sparkles, Star, Flame, CupSoda, Trash2, 
  MapPin, Clock, Phone, Heart, ShoppingBag, ArrowRight, Instagram, Facebook,
  X, UtensilsCrossed, Award, ThumbsUp, Quote, CheckCircle, HelpCircle, User, LogIn
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 animate-fadeIn">
            
            {/* Header of the Menu with Category & Search */}
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-natural-border pb-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-6 bg-natural-red rounded-full" />
                    <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-white font-black uppercase">
                      Cardápio do Rancho
                    </h2>
                  </div>
                  <p className="text-stone-400 text-xs sm:text-sm">Hambúrgueres artesanais premium grelhados na brasa, acompanhamentos e bebidas</p>
                </div>

                {/* Mobile Search Bar - Displayed under the title on mobile screens */}
                <div className="w-full md:hidden relative">
                  <input
                    type="text"
                    placeholder="Buscar no cardápio de hoje..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-natural-panel border border-natural-border rounded-xl px-4 py-3 font-sans placeholder-stone-500 text-stone-200 focus:outline-none focus:border-natural-red focus:ring-1 focus:ring-natural-red text-sm transition-all shadow-inner"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3.5 top-3.5 text-stone-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Display favorite filter toggle mode */}
                <button
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 ${
                    showOnlyFavorites 
                      ? "bg-natural-red text-natural-cream shadow-md shadow-orange-950/20" 
                      : "bg-natural-panel border border-natural-border text-stone-300 hover:text-white hover:bg-natural-dark"
                  }`}
                >
                  <Heart size={14} className={showOnlyFavorites ? "fill-white text-white" : "text-stone-300"} />
                  <span>{showOnlyFavorites ? "Ver Todo o Cardápio" : "Meus Favoritos"}</span>
                </button>
              </div>

              {/* Wooden rustic category signs list */}
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 px-1 -mx-4 sm:mx-0 sm:px-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setShowOnlyFavorites(false);
                    }}
                    className={`px-5 py-3 rounded-xl font-bold text-xs shrink-0 tracking-wide flex items-center space-x-2 transition-all ${
                      activeCategory === cat.id && !showOnlyFavorites
                        ? "bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white scale-105 shadow-md shadow-orange-950/20"
                        : "bg-natural-panel border border-natural-border text-stone-300 hover:border-stone-600 hover:text-white"
                    }`}
                  >
                    <span className="shrink-0">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

            </div>

            {/* PRODUCTS SCALABLE GRID */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-natural-panel/40 rounded-2xl border border-natural-border border-dashed space-y-4">
                <p className="font-display text-lg text-stone-300">Nenhum prato encontrado com essas preferências.</p>
                <p className="text-stone-400 text-xs">Tente limpar a busca ou mudar a categoria selecionada.</p>
                <button 
                  onClick={() => { setActiveCategory("all"); setSearchTerm(""); setShowOnlyFavorites(false); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#f97316] to-[#f59e0b] text-white rounded-xl text-xs font-bold font-mono uppercase transition-all shadow"
                >
                  Limpar Filtros 🍔
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    whatsappNumber={settings.whatsappNumber}
                    isFavorite={favoriteIds.includes(p.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToCart={handleAddToCartSimple}
                    onSelectProduct={setSelectedProduct}
                  />
                ))}
              </div>
            )}

          </section>
        </main>
      )}

      {/* Primary Footer */}
      <Footer />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          relatedProducts={products.filter(p => p.isActive && p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 2)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCartSophisticated}
          onSubmitReview={async (productId, author, rating, comment) => {
            await handleSubmitReview(productId, author, rating, comment);
            // Sync selected item in-state reviews array
            const freshList = products.find(p => p.id === productId);
            if (freshList) setSelectedProduct(freshList);
          }}
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

    </div>
  );
}
