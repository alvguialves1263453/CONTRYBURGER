import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Coupon, Order, Settings } from "./src/types";

const app = express();
const PORT = 3000;

// Body parsing middlewares
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

const dbPath = path.join(process.cwd(), "db.json");

// Helper to read DB safely
function readDatabase() {
  try {
    if (!fs.existsSync(dbPath)) {
      // Return simple fallback structure if file deleted
      return { products: [], coupons: [], orders: [], settings: { whatsappNumber: "5511999999999", storeOpen: true, estimatedDeliveryTime: "30-45 min", deliveryFee: 7.0 } };
    }
    const raw = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database file, using empty structure:", error);
    return { products: [], coupons: [], orders: [], settings: { whatsappNumber: "5511999999999", storeOpen: true, estimatedDeliveryTime: "30-45 min", deliveryFee: 7.0 } };
  }
}

// Helper to write DB safely
function writeDatabase(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// ==========================================
// API REST ENDPOINTS
// ==========================================

// Get entire database (useful for client hydration or export)
app.get("/api/db", (req, res) => {
  res.json(readDatabase());
});

// Settings Endpoints
app.get("/api/settings", (req, res) => {
  const db = readDatabase();
  res.json(db.settings || { whatsappNumber: "5511999999999", storeOpen: true, estimatedDeliveryTime: "35-50 min", deliveryFee: 7.0 });
});

app.put("/api/settings", (req, res) => {
  const db = readDatabase();
  db.settings = { ...db.settings, ...req.body };
  writeDatabase(db);
  res.json({ message: "Configurações atualizadas com sucesso", settings: db.settings });
});

// Products Endpoints
app.get("/api/products", (req, res) => {
  const db = readDatabase();
  res.json(db.products || []);
});

app.post("/api/products", (req, res) => {
  const db = readDatabase();
  const newProduct: Product = {
    id: "prod-" + Math.floor(Math.random() * 1000000),
    name: req.body.name || "Novo Lanche",
    description: req.body.description || "",
    price: parseFloat(req.body.price) || 0,
    promoPrice: req.body.promoPrice ? parseFloat(req.body.promoPrice) : null,
    badge: req.body.badge || null,
    category: req.body.category || "burgers",
    imageUrl: req.body.imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    gallery: req.body.gallery || [],
    ingredients: req.body.ingredients || [],
    fullDescription: req.body.fullDescription || "",
    estimatedTime: req.body.estimatedTime || "20-30 min",
    isFeatured: !!req.body.isFeatured,
    isPromo: !!req.body.isPromo,
    isActive: req.body.isActive !== undefined ? !!req.body.isActive : true,
    salesCount: 0,
    reviews: []
  };
  
  if (!db.products) db.products = [];
  db.products.push(newProduct);
  writeDatabase(db);
  res.json({ message: "Produto adicionado com sucesso!", product: newProduct });
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const products: Product[] = db.products || [];
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  // Update product fields
  const updated = {
    ...products[idx],
    ...req.body,
    price: req.body.price !== undefined ? parseFloat(req.body.price) : products[idx].price,
    promoPrice: req.body.promoPrice !== undefined ? (req.body.promoPrice ? parseFloat(req.body.promoPrice) : null) : products[idx].promoPrice,
  };

  products[idx] = updated;
  db.products = products;
  writeDatabase(db);
  res.json({ message: "Produto atualizado com sucesso!", product: updated });
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const products: Product[] = db.products || [];
  const filtered = products.filter((p) => p.id !== id);
  db.products = filtered;
  writeDatabase(db);
  res.json({ message: "Produto excluído com sucesso!" });
});

// Post a review for a specific product
app.post("/api/products/:id/reviews", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const products: Product[] = db.products || [];
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Produto não encontrado" });
  }

  const newReview = {
    id: "rev-" + Date.now() + Math.floor(Math.random() * 1000),
    author: req.body.author || "Anônimo",
    rating: Number(req.body.rating) || 5,
    comment: req.body.comment || "",
    date: new Date().toISOString().split("T")[0]
  };

  if (!products[idx].reviews) products[idx].reviews = [];
  products[idx].reviews.push(newReview);
  
  db.products = products;
  writeDatabase(db);
  res.json({ message: "Avaliação publicada!", review: newReview, product: products[idx] });
});

// Coupons Endpoints
app.get("/api/coupons", (req, res) => {
  const db = readDatabase();
  res.json(db.coupons || []);
});

app.post("/api/coupons", (req, res) => {
  const db = readDatabase();
  const newCoupon: Coupon = {
    id: "coup-" + Math.floor(Math.random() * 1000000),
    code: (req.body.code || "").toUpperCase(),
    type: req.body.type || "percent",
    value: parseFloat(req.body.value) || 0,
    expiryDate: req.body.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    maxUses: Number(req.body.maxUses) || 100,
    currentUses: 0,
    isActive: req.body.isActive !== undefined ? !!req.body.isActive : true
  };

  if (!db.coupons) db.coupons = [];
  db.coupons.push(newCoupon);
  writeDatabase(db);
  res.json({ message: "Cupom criado com sucesso!", coupon: newCoupon });
});

app.put("/api/coupons/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const coupons: Coupon[] = db.coupons || [];
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Cupom não encontrado" });
  }

  const updated = {
    ...coupons[idx],
    ...req.body,
    value: req.body.value !== undefined ? parseFloat(req.body.value) : coupons[idx].value,
  };

  coupons[idx] = updated;
  db.coupons = coupons;
  writeDatabase(db);
  res.json({ message: "Cupom atualizado com sucesso!", coupon: updated });
});

app.delete("/api/coupons/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const coupons: Coupon[] = db.coupons || [];
  const filtered = coupons.filter((c) => c.id !== id);
  db.coupons = filtered;
  writeDatabase(db);
  res.json({ message: "Cupom excluído com sucesso!" });
});

// Orders Endpoints
app.get("/api/orders", (req, res) => {
  const db = readDatabase();
  res.json(db.orders || []);
});

app.post("/api/orders", (req, res) => {
  const db = readDatabase();
  const newOrder: Order = {
    id: "ord-" + Math.floor(1000 + Math.random() * 9000), // Nice short, readable order ID
    customerName: req.body.customerName || "Cliente do Rancho",
    customerPhone: req.body.customerPhone || "",
    customerAddress: req.body.customerAddress || "Retirada",
    paymentMethod: req.body.paymentMethod || "Pix",
    items: req.body.items || [],
    subtotal: parseFloat(req.body.subtotal) || 0,
    discount: parseFloat(req.body.discount) || 0,
    total: parseFloat(req.body.total) || 0,
    status: req.body.status || "pendente",
    timestamp: new Date().toISOString()
  };

  // If new order was built, increment sales counts for items & coupon uses
  if (db.products && newOrder.items && newOrder.items.length > 0) {
    newOrder.items.forEach((item: any) => {
      const idx = db.products.findIndex((p: any) => p.id === item.productId);
      if (idx !== -1) {
        db.products[idx].salesCount = (db.products[idx].salesCount || 0) + item.quantity;
      }
    });
  }

  // Handle coupon usage count increment if applied
  const appliedCode = req.body.appliedCouponCode;
  if (appliedCode && db.coupons) {
    const idx = db.coupons.findIndex((c: any) => c.code.toUpperCase() === appliedCode.toUpperCase());
    if (idx !== -1) {
      db.coupons[idx].currentUses = (db.coupons[idx].currentUses || 0) + 1;
    }
  }

  if (!db.orders) db.orders = [];
  db.orders.push(newOrder);
  writeDatabase(db);
  res.json({ message: "Pedido registrado!", order: newOrder });
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const orders: Order[] = db.orders || [];
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Pedido não encontrado" });
  }

  orders[idx] = { ...orders[idx], ...req.body };
  db.orders = orders;
  writeDatabase(db);
  res.json({ message: "Status do pedido atualizado!", order: orders[idx] });
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const orders: Order[] = db.orders || [];
  const filtered = orders.filter((o) => o.id !== id);
  db.orders = filtered;
  writeDatabase(db);
  res.json({ message: "Pedido removido com sucesso!" });
});

// ==========================================
// STATIC FILES & VITE INTEGRATION
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In DEVELOPMENT mode, let Vite handle client-side files & hot-reloads
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In PRODUCTION mode, serve index.html and compiled bundles from physical 'dist'
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Country Food Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
