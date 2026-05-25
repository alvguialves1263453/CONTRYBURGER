import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { couponService } from "../services/couponService";
import { Product, OrderItem, Coupon } from "../types";

export function useCart(userId?: string) {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load cart items from Supabase (if logged in) or from localStorage (if guest)
  const refreshCart = useCallback(async () => {
    if (!userId) {
      // Guest User: load from localStorage
      const local = localStorage.getItem("contry_food_cart");
      if (local) {
        try {
          setCartItems(JSON.parse(local));
        } catch {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      return;
    }

    try {
      setLoading(true);
      // Fetch user's shopping cart id
      const { data: cartData, error: cError } = await supabase
        .from("carrinho")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (cError || !cartData) {
        // If trigger didn't create a cart yet, initialize it
        const { data: newCart } = await supabase
          .from("carrinho")
          .insert({ user_id: userId })
          .select()
          .single();
        
        setCartItems([]);
        return;
      }

      // Fetch cart items joined with products
      const { data: itemsData, error: iError } = await supabase
        .from("carrinho_itens")
        .select(`
          quantity,
          obs,
          produtos (
            id,
            name,
            price,
            promo_price,
            image_url
          )
        `)
        .eq("carrinho_id", cartData.id);

      if (iError) throw iError;

      const items: OrderItem[] = (itemsData || []).map((row: any) => {
        const prod = row.produtos;
        const finalPrice = prod?.promo_price !== null ? Number(prod?.promo_price) : Number(prod?.price);
        return {
          productId: prod?.id,
          name: prod?.name || "Lanche do Rancho",
          price: finalPrice,
          quantity: row.quantity,
          obs: row.obs || "",
          imageUrl: prod?.image_url
        };
      });

      setCartItems(items);
    } catch (err) {
      console.error("Error refreshing cart from database:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Sync to local storage for guests
  const saveGuestCart = (items: OrderItem[]) => {
    setCartItems(items);
    localStorage.setItem("contry_food_cart", JSON.stringify(items));
  };

  // Add Item to Cart
  const addToCart = async (product: Product, quantity: number = 1, obs: string = "") => {
    const finalPrice = product.promoPrice !== null ? product.promoPrice : product.price;

    if (!userId) {
      // Guest logic
      const existingIdx = cartItems.findIndex((item) => item.productId === product.id);
      let updated = [...cartItems];

      if (existingIdx !== -1) {
        updated[existingIdx].quantity += quantity;
        if (obs) {
          updated[existingIdx].obs = obs; // Update instructions
        }
      } else {
        updated.push({
          productId: product.id,
          name: product.name,
          price: finalPrice,
          quantity,
          obs,
          imageUrl: product.imageUrl
        });
      }
      saveGuestCart(updated);
      return;
    }

    try {
      setLoading(true);
      // Fetch user's cart
      const { data: cartData } = await supabase
        .from("carrinho")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartData) return;

      // Upsert cart item row
      const { data: existing } = await supabase
        .from("carrinho_itens")
        .select("id, quantity")
        .eq("carrinho_id", cartData.id)
        .eq("produto_id", product.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("carrinho_itens")
          .update({ 
            quantity: existing.quantity + quantity,
            obs: obs || undefined
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("carrinho_itens")
          .insert({
            carrinho_id: cartData.id,
            produto_id: product.id,
            quantity: quantity,
            obs: obs || ""
          });
      }

      await refreshCart();
    } catch (err) {
      console.error("Error adding item to database cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update item count inside Cart
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    if (!userId) {
      const updated = cartItems.map((item) => 
        item.productId === productId ? { ...item, quantity } : item
      );
      saveGuestCart(updated);
      return;
    }

    try {
      setLoading(true);
      const { data: cartData } = await supabase
        .from("carrinho")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartData) return;

      await supabase
        .from("carrinho_itens")
        .update({ quantity })
        .eq("carrinho_id", cartData.id)
        .eq("produto_id", productId);

      await refreshCart();
    } catch (err) {
      console.error("Error updating cart quantity:", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove Item from Cart
  const removeFromCart = async (productId: string) => {
    if (!userId) {
      const updated = cartItems.filter((item) => item.productId !== productId);
      saveGuestCart(updated);
      return;
    }

    try {
      setLoading(true);
      const { data: cartData } = await supabase
        .from("carrinho")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartData) return;

      await supabase
        .from("carrinho_itens")
        .delete()
        .eq("carrinho_id", cartData.id)
        .eq("produto_id", productId);

      await refreshCart();
    } catch (err) {
      console.error("Error removing item from database cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove all products
  const clearCart = async () => {
    if (!userId) {
      saveGuestCart([]);
      setCoupon(null);
      return;
    }

    try {
      setLoading(true);
      const { data: cartData } = await supabase
        .from("carrinho")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!cartData) return;

      await supabase
        .from("carrinho_itens")
        .delete()
        .eq("carrinho_id", cartData.id);

      setCartItems([]);
      setCoupon(null);
    } catch (err) {
      console.error("Error clearing user cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply Coupon
  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const result = await couponService.validateCoupon(code);
      if (result) {
        setCoupon(result);
        return true;
      } else {
        setCouponError("Cupom inválido, vencido ou esgotado!");
        setCoupon(null);
        return false;
      }
    } catch (err) {
      setCouponError("Erro ao validar cupom.");
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cartItems]);

  const discount = useMemo(() => {
    if (!coupon || subtotal === 0) return 0;
    if (coupon.type === "percent") {
      return (subtotal * coupon.value) / 100;
    } else {
      return Math.min(coupon.value, subtotal);
    }
  }, [coupon, subtotal]);

  return {
    cartItems,
    coupon,
    couponError,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount
  };
}
