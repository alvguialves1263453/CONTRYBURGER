import { useState, useEffect, useCallback, useMemo } from "react";
import { productService, Category } from "../services/productService";
import { Product } from "../types";

export function useProducts(userId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const favKey = useMemo(() => {
    return userId ? `country_food_favs_${userId}` : "country_food_favs";
  }, [userId]);

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
    const local = localStorage.getItem(favKey);
    if (local) {
      try {
        setFavoriteIds(JSON.parse(local));
      } catch {
        setFavoriteIds([]);
      }
    } else {
      setFavoriteIds([]);
    }
  }, [favKey]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // Toggle Favorite
  const toggleFavorite = async (productId: string) => {
    const isCurrentlyFav = favoriteIds.includes(productId);
    let updated = [];
    if (isCurrentlyFav) {
      updated = favoriteIds.filter((id) => id !== productId);
    } else {
      updated = [...favoriteIds, productId];
    }
    setFavoriteIds(updated);
    localStorage.setItem(favKey, JSON.stringify(updated));
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
