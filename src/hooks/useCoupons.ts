import { useState, useEffect, useCallback } from "react";
import { couponService } from "../services/couponService";
import { Coupon } from "../types";

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await couponService.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar cupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCoupons();
  }, [refreshCoupons]);

  const addCoupon = async (c: Omit<Coupon, "id" | "currentUses">) => {
    try {
      setLoading(true);
      await couponService.createCoupon(c);
      await refreshCoupons();
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar cupom.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    try {
      setLoading(true);
      await couponService.updateCoupon(id, updates);
      await refreshCoupons();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar cupom.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      setLoading(true);
      await couponService.deleteCoupon(id);
      await refreshCoupons();
    } catch (err: any) {
      setError(err.message || "Erro ao remover cupom.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    coupons,
    loading,
    error,
    refreshCoupons,
    addCoupon,
    updateCoupon,
    deleteCoupon
  };
}
