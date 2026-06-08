import { Product } from "../types";

export interface Category {
  id: string;
  slug: string;
  label: string;
  icon: string | null;
  ordem: number;
}

export const productService = {
  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    return [
      { id: "all", slug: "all", label: "Todos", icon: "🤠", ordem: 1 },
      { id: "burgers", slug: "burgers", label: "Hambúrgueres", icon: "🍔", ordem: 2 },
      { id: "combos", slug: "combos", label: "Combos Caipiras", icon: "📦", ordem: 3 },
      { id: "sides", slug: "sides", label: "Acompanhamentos", icon: "🍟", ordem: 4 },
      { id: "drinks", slug: "drinks", label: "Bebidas", icon: "🍹", ordem: 5 },
      { id: "desserts", slug: "desserts", label: "Sobremesas", icon: "🥧", ordem: 6 }
    ];
  },

  /**
   * Fetch all active products, along with their reviews from the reviews table
   */
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const list: Product[] = await response.json();
      return list;
    } catch (err) {
      console.error("Local products fetch error:", err);
      return [];
    }
  },

  /**
   * Save a newly typed recipe / item
   */
  async createProduct(p: Omit<Product, "id" | "reviews" | "salesCount">): Promise<any> {
    const response = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!response.ok) throw new Error("Failed to create product");
    const res = await response.json();
    return res.product;
  },

  /**
   * Update fields for a product by its ID
   */
  async updateProduct(id: string, p: Partial<Product>): Promise<any> {
    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    if (!response.ok) throw new Error("Failed to update product");
    const res = await response.json();
    return res.product;
  },

  /**
   * Delete product by its ID
   */
  async deleteProduct(id: string): Promise<any> {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete product");
    return;
  },

  /**
   * Post a reviews/rating for an item
   */
  async submitReview(productId: string, author: string, rating: number, comment: string, userId?: string) {
    const response = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, rating, comment, userId }),
    });
    if (!response.ok) throw new Error("Failed to submit review");
    const res = await response.json();
    return res.review;
  }
};
