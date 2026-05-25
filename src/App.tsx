import React, { useState, useEffect } from "react";
import { 
  Search, Flag, ShieldAlert, Sparkles, Star, Flame, CupSoda, Trash2, 
  MapPin, Clock, Phone, Heart, ShoppingBag, ArrowRight, Instagram, Facebook,
  X, UtensilsCrossed, Award, ThumbsUp, Quote, CheckCircle, HelpCircle
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductCard from "./components/ProductCard";
import ProductModal from "./components/ProductModal";
import CartDrawer from "./components/CartDrawer";
import AdminPanel from "./components/AdminPanel";
import { Product, Coupon, Order, Settings, OrderItem } from "./types";

export default function App() {
  // Shared States (synchronized with Express Server `/api/*`)
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings>({
    whatsappNumber: "5511999999999",
    storeOpen: true,
    estimatedDeliveryTime: "30-45 min",
    deliveryFee: 7.0
  });

  const [loading, setLoading] = useState(true);

  // Client Specific States
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentView, setCurrentView] = useState<"home" | "admin">("home");

  // Detailed view states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  // Hydrate Data on spawn and mount
  useEffect(() => {
    async function loadDatabase() {
      try {
        setLoading(true);
        const res = await fetch("/api/db");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setCoupons(data.coupons || []);
          setOrders(data.orders || []);
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error("Erro carregando banco do rancho:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadDatabase();

    // Load Local storage cart / favorites
    const savedFavs = localStorage.getItem("contry_favs");
    if (savedFavs) {
      setFavoriteIds(JSON.parse(savedFavs));
    }
    const savedCart = localStorage.getItem("contry_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Synchronize dynamic swapping inside modal related products
  useEffect(() => {
    const handleModalSwap = (e: Event) => {
      const p = (e as CustomEvent).detail as Product;
      setSelectedProduct(p);
    };
    window.addEventListener("product-swap", handleModalSwap);
    return () => window.removeEventListener("product-swap", handleModalSwap);
  }, []);

  // Helper: Persist client cache
  const saveCartToCache = (newCart: OrderItem[]) => {
    setCartItems(newCart);
    localStorage.setItem("contry_cart", JSON.stringify(newCart));
  };

  const saveFavsToCache = (newFavs: string[]) => {
    setFavoriteIds(newFavs);
    localStorage.setItem("contry_favs", JSON.stringify(newFavs));
  };

  // ==========================================
  // SERVER SYNCHRONISERS (API CRUDS)
  // ==========================================

  const rehydrateCatalog = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCoupons(data.coupons || []);
        setOrders(data.orders || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch (err) {
      console.warn("Erro ao reidratar os dados:", err);
    }
  };

  // 1. ADD / EDIT PRODUCT
  const handleAddProduct = async (pPayload: any) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pPayload)
    });
    await rehydrateCatalog();
    return res.json();
  };

  const handleUpdateProduct = async (pPayload: Product) => {
    const res = await fetch(`/api/products/${pPayload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pPayload)
    });
    await rehydrateCatalog();
    return res.json();
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    await rehydrateCatalog();
    return res.json();
  };

  // 2. COUPONS
  const handleAddCoupon = async (cPayload: any) => {
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cPayload)
    });
    await rehydrateCatalog();
    return res.json();
  };

  const handleUpdateCoupon = async (cPayload: Coupon) => {
    const res = await fetch(`/api/coupons/${cPayload.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cPayload)
    });
    await rehydrateCatalog();
    return res.json();
  };

  const handleDeleteCoupon = async (id: string) => {
    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    await rehydrateCatalog();
    return res.json();
  };

  // 3. ORDERS
  const handleUpdateOrder = async (id: string, status: Order["status"]) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    await rehydrateCatalog();
    return res.json();
  };

  const handleDeleteOrder = async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    await rehydrateCatalog();
    return res.json();
  };

  const handleOrderCompleted = async (orderPayload: any, appliedCouponCode: string | null) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    
    const parsed = await res.json();

    // Clear local cart once checkout is finalized successfully
    saveCartToCache([]);
    setCartDrawerOpen(false);
    
    await rehydrateCatalog();
    return parsed;
  };

  // 4. SUBMIT EVALUATION
  const handleSubmitReview = async (productId: string, author: string, rating: number, comment: string) => {
    await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, rating, comment })
    });
    
    // Update active detailed view with fresh reviews list immediately
    await rehydrateCatalog();
    setProducts((prev) => {
      const idx = prev.findIndex(p => p.id === productId);
      if (idx !== -1 && selectedProduct?.id === productId) {
        setSelectedProduct(prev[idx]);
      }
      return prev;
    });
  };

  // 5. UPDATE STORE SETTINGS
  const handleUpdateSettings = async (sPayload: Settings) => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sPayload)
    });
    await rehydrateCatalog();
    return res.json();
  };


  // ==========================================
  // CLIENT CORE UX LOGIC
  // ==========================================

  // Toggle Favorite Overlay
  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const idx = favoriteIds.indexOf(product.id);
    let updated: string[];
    if (idx === -1) {
      updated = [...favoriteIds, product.id];
    } else {
      updated = favoriteIds.filter(id => id !== product.id);
    }
    saveFavsToCache(updated);
  };

  // Add Item callback from ProductCard with quantity=1
  const handleAddToCartSimple = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    if (!settings.storeOpen) {
      alert("🤠 Saloon Fechado! Não estamos recebendo pedidos no momento.");
      return;
    }

    const price = product.promoPrice !== null ? product.promoPrice : product.price;
    const existingIdx = cartItems.findIndex(item => item.productId === product.id);
    let updatedCart = [...cartItems];

    if (existingIdx !== -1) {
      updatedCart[existingIdx].quantity += 1;
    } else {
      updatedCart.push({
        productId: product.id,
        name: product.name,
        price,
        quantity: 1,
        obs: "",
        imageUrl: product.imageUrl
      });
    }

    saveCartToCache(updatedCart);
    setCartDrawerOpen(true);
  };

  // Add Item callback from ProductModal with custom specifications
  const handleAddToCartSophisticated = (product: Product, qty: number, obs: string) => {
    if (!settings.storeOpen) {
      alert("🤠 Saloon Fechado! Não estamos recebendo pedidos no momento.");
      return;
    }

    const price = product.promoPrice !== null ? product.promoPrice : product.price;
    const existingIdx = cartItems.findIndex(item => item.productId === product.id && item.obs === obs);
    let updatedCart = [...cartItems];

    if (existingIdx !== -1) {
      updatedCart[existingIdx].quantity += qty;
    } else {
      updatedCart.push({
        productId: product.id,
        name: product.name,
        price,
        quantity: qty,
        obs,
        imageUrl: product.imageUrl
      });
    }

    saveCartToCache(updatedCart);
    setCartDrawerOpen(true);
  };

  // Adjust item quantity inside Carrinho Drawer
  const handleUpdateCartQuantity = (productId: string, val: number) => {
    if (val <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    const updated = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity: val } : item
    );
    saveCartToCache(updated);
  };

  // Delete Item from Carrinho Drawer
  const handleRemoveCartItem = (productId: string) => {
    const filtered = cartItems.filter(item => item.productId !== productId);
    saveCartToCache(filtered);
  };

  // ==========================================
  // FILTERS & SEARCH
  // ==========================================

  const filteredProducts = products.filter((p) => {
    // 1. Status Filter: Only active/visible items on menu
    if (!p.isActive) return false;

    // 2. Category selection Filter
    if (activeCategory !== "all" && p.category !== activeCategory) return false;

    // 3. Search Bar Filter (Matching Name/Ingredients/Description)
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchIngs = p.ingredients ? p.ingredients.some(i => i.toLowerCase().includes(query)) : false;
      if (!matchName && !matchDesc && !matchIngs) return false;
    }

    // 4. Client Favorites Filter Toggle
    if (showOnlyFavorites) {
      return favoriteIds.includes(p.id);
    }

    return true;
  });

  // Split Category helper
  const categories = [
    { id: "all", label: "Tudo", icon: <UtensilsCrossed size={14} /> },
    { id: "burgers", label: "Burgers Grelhados", icon: <Flame size={14} /> },
    { id: "combos", label: "Combos Promos", icon: <Sparkles size={14} /> },
    { id: "sides", label: "Batatas & Onion", icon: <Award size={14} /> },
    { id: "drinks", label: "Cold Drinks", icon: <CupSoda size={14} /> },
    { id: "desserts", label: "Doces & Sobremesas", icon: <ThumbsUp size={14} /> }
  ];

  const promosInGrid = products.filter(p => p.isActive && p.isPromo).slice(0, 3);
  const featuredInGrid = products.filter(p => p.isActive && p.isFeatured).slice(0, 3);

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
        currentView={currentView}
        onSetView={(view) => {
          setCurrentView(view);
          setShowOnlyFavorites(false);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Container */}
      {currentView === "admin" ? (
        <AdminPanel
          products={products}
          coupons={coupons}
          orders={orders}
          settings={settings}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onAddCoupon={handleAddCoupon}
          onUpdateCoupon={handleUpdateCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onUpdateOrder={handleUpdateOrder}
          onDeleteOrder={handleDeleteOrder}
          onUpdateSettings={handleUpdateSettings}
        />
      ) : (
        <main className="flex-1 pb-16">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8 animate-fadeIn">
            
            {/* Header of the Menu with Category & Modern Integrated Search */}
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

      {/* ==========================================
          MODALS & OVERLAYS ORCHESTRATION
          ========================================== */}
      
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          relatedProducts={products.filter(p => p.isActive && p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 2)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCartSophisticated}
          onSubmitReview={handleSubmitReview}
          whatsappNumber={settings.whatsappNumber}
        />
      )}

      {/* Floating Side Shopping Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        coupons={coupons}
        settings={settings}
        onOrderCompleted={handleOrderCompleted}
      />

    </div>
  );
}
