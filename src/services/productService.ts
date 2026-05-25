import { supabase } from "../supabaseClient";
import { Product, Review } from "../types";

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
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("ordem", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all active products, along with their reviews from the reviews table
   */
  async getProducts(): Promise<Product[]> {
    // Fetch products
    const { data: dbProducts, error: pError } = await supabase
      .from("produtos")
      .select("*")
      .order("name", { ascending: true });

    if (pError) {
      console.error("Error loading products:", pError);
      return [];
    }

    // Fetch reviews
    const { data: dbReviews, error: rError } = await supabase
      .from("avaliacoes")
      .select("*");

    if (rError) {
      console.error("Error loading reviews:", rError);
    }

    // Pack into React structures
    const packedReviews = dbReviews || [];
    const products: Product[] = (dbProducts || []).map((dbProd) => {
      const prodReviews = packedReviews
        .filter((r) => r.produto_id === dbProd.id)
        .map((r): Review => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          comment: r.comment || "",
          date: r.date
        }));

      return {
        id: dbProd.id,
        name: dbProd.name,
        description: dbProd.description,
        fullDescription: dbProd.full_description || "",
        price: Number(dbProd.price),
        promoPrice: dbProd.promo_price !== null ? Number(dbProd.promo_price) : null,
        badge: dbProd.badge,
        category: dbProd.categoria_slug,
        imageUrl: dbProd.image_url,
        gallery: [], // Loaded locally or from a structured gallery table if needed
        ingredients: dbProd.ingredients || [],
        estimatedTime: dbProd.estimated_time,
        isFeatured: dbProd.is_featured,
        isPromo: dbProd.is_promo,
        isActive: dbProd.is_active,
        salesCount: dbProd.sales_count,
        reviews: prodReviews
      };
    });

    return products;
  },

  /**
   * Save a newly typed recipe / item in Supabase
   */
  async createProduct(p: Omit<Product, "id" | "reviews" | "salesCount">): Promise<any> {
    const dbPayload = {
      categoria_slug: p.category,
      name: p.name,
      description: p.description,
      full_description: p.fullDescription,
      price: p.price,
      promo_price: p.promoPrice,
      badge: p.badge,
      image_url: p.imageUrl,
      ingredients: p.ingredients,
      estimated_time: p.estimatedTime,
      is_featured: p.isFeatured,
      is_promo: p.isPromo,
      is_active: p.isActive
    };

    const { data, error } = await supabase
      .from("produtos")
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update fields for a product by its ID
   */
  async updateProduct(id: string, p: Partial<Product>): Promise<any> {
    const dbPayload: any = {};
    if (p.category !== undefined) dbPayload.categoria_slug = p.category;
    if (p.name !== undefined) dbPayload.name = p.name;
    if (p.description !== undefined) dbPayload.description = p.description;
    if (p.fullDescription !== undefined) dbPayload.full_description = p.fullDescription;
    if (p.price !== undefined) dbPayload.price = p.price;
    if (p.promoPrice !== undefined) dbPayload.promo_price = p.promoPrice;
    if (p.badge !== undefined) dbPayload.badge = p.badge;
    if (p.imageUrl !== undefined) dbPayload.image_url = p.imageUrl;
    if (p.ingredients !== undefined) dbPayload.ingredients = p.ingredients;
    if (p.estimatedTime !== undefined) dbPayload.estimated_time = p.estimatedTime;
    if (p.isFeatured !== undefined) dbPayload.is_featured = p.isFeatured;
    if (p.isPromo !== undefined) dbPayload.is_promo = p.isPromo;
    if (p.isActive !== undefined) dbPayload.is_active = p.isActive;
    if (p.salesCount !== undefined) dbPayload.sales_count = p.salesCount;

    const { data, error } = await supabase
      .from("produtos")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete product by its ID
   */
  async deleteProduct(id: string): Promise<any> {
    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Post a reviews/rating for an item
   */
  async submitReview(productId: string, author: string, rating: number, comment: string, userId?: string) {
    const { data, error } = await supabase
      .from("avaliacoes")
      .insert({
        produto_id: productId,
        user_id: userId || null,
        author,
        rating,
        comment,
        date: new Date().toISOString().split("T")[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
