import { useState, useEffect, useCallback } from "react";
import { productService, Category } from "../services/productService";
import { Product, Review } from "../types";
import { supabase } from "../supabaseClient";

export function useProducts(userId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Categories & Products
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [pData, cData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setProducts(pData);
      setCategories(cData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar cardápio.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Favorites
  const refreshFavorites = useCallback(async () => {
    if (!userId) {
      // Unauthenticated: load from localStorage
      const local = localStorage.getItem("contry_food_favs");
      if (local) {
        setFavoriteIds(JSON.parse(local));
      } else {
        setFavoriteIds([]);
      }
      return;
    }

    try {
      const { data, error: fError } = await supabase
        .from("favoritos")
        .select("produto_id")
        .eq("user_id", userId);

      if (fError) throw fError;
      setFavoriteIds((data || []).map((f) => f.produto_id));
    } catch (err) {
      console.error("Error retrieving favorites:", err);
    }
  }, [userId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Toggle Favorite
  const toggleFavorite = async (productId: string) => {
    const isCurrentlyFav = favoriteIds.includes(productId);

    if (!userId) {
      // Unauthenticated: save to localStorage
      let updated = [];
      if (isCurrentlyFav) {
        updated = favoriteIds.filter((id) => id !== productId);
      } else {
        updated = [...favoriteIds, productId];
      }
      setFavoriteIds(updated);
      localStorage.setItem("contry_food_favs", JSON.stringify(updated));
      return;
    }

    try {
      if (isCurrentlyFav) {
        setFavoriteIds((prev) => prev.filter((id) => id !== productId));
        await supabase
          .from("favoritos")
          .delete()
          .eq("user_id", userId)
          .eq("produto_id", productId);
      } else {
        setFavoriteIds((prev) => [...prev, productId]);
        await supabase
          .from("favoritos")
          .insert({ user_id: userId, produto_id: productId });
      }
    } catch (err) {
      console.error("Error updating favorites in database:", err);
      // Revert state
      refreshFavorites();
    }
  };

  // Add Product
  const addProduct = async (p: Omit<Product, "id" | "reviews" | "salesCount">) => {
    try {
      setLoading(true);
      await productService.createProduct(p);
      await refreshData();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar produto.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update Product
  const updateProduct = async (p: Product) => {
    try {
      setLoading(true);
      await productService.updateProduct(p.id, p);
      await refreshData();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar produto.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      await refreshData();
    } catch (err: any) {
      setError(err.message || "Erro ao remover do cardápio.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit product assessment/review
  const submitReview = async (productId: string, author: string, rating: number, comment: string) => {
    try {
      await productService.submitReview(productId, author, rating, comment, userId);
      await refreshData();
    } catch (err: any) {
      console.error("Error saving review:", err);
      throw err;
    }
  };

  return {
    products,
    categories,
    favoriteIds,
    loading,
    error,
    refreshData,
    toggleFavorite,
    addProduct,
    updateProduct,
    deleteProduct,
    submitReview
  };
}
