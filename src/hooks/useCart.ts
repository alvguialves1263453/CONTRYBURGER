import { useState, useEffect, useCallback, useMemo } from "react";
import { couponService } from "../services/couponService";
import { Product, OrderItem, Coupon } from "../types";

export function useCart(userId?: string) {
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading] = useState(false);

  const cartKey = useMemo(() => {
    return userId ? `country_food_cart_${userId}` : "country_food_cart";
  }, [userId]);

  // Load cart items from localStorage
  const refreshCart = useCallback(async () => {
    const local = localStorage.getItem(cartKey);
    if (local) {
      try {
        setCartItems(JSON.parse(local));
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [cartKey]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const saveCart = (items: OrderItem[]) => {
    setCartItems(items);
    localStorage.setItem(cartKey, JSON.stringify(items));
  };

  // Add Item to Cart
  const addToCart = async (product: Product, quantity: number = 1, obs: string = "") => {
    const finalPrice = product.promoPrice !== null ? product.promoPrice : product.price;

    const existingIdx = cartItems.findIndex((item) => item.productId === product.id);
    let updated = [...cartItems];

    if (existingIdx !== -1) {
      updated[existingIdx].quantity += quantity;
      if (obs) {
        updated[existingIdx].obs = obs;
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
    saveCart(updated);
  };

  // Update item count inside Cart
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const updated = cartItems.map((item) => 
      item.productId === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  // Remove Item from Cart
  const removeFromCart = async (productId: string) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    saveCart(updated);
  };

  // Remove all products
  const clearCart = async () => {
    saveCart([]);
    setCoupon(null);
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
