import { supabase } from "../supabaseClient";
import { Coupon } from "../types";

export const couponService = {
  /**
   * Fetch all discount coupons registered
   */
  async getCoupons(): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .order("code", { ascending: true });

    if (error) {
      console.error("Error fetching coupons:", error);
      return [];
    }

    return (data || []).map((c): Coupon => ({
      id: c.id,
      code: c.code,
      type: c.type as "percent" | "fixed",
      value: Number(c.value),
      expiryDate: c.expiry_date,
      maxUses: c.max_uses,
      currentUses: c.current_uses,
      isActive: c.is_active
    }));
  },

  /**
   * Validate code inputs from user checkout
   */
  async validateCoupon(code: string): Promise<Coupon | null> {
    const cleanCode = code.toUpperCase().trim();
    const { data, error } = await supabase
      .from("cupons")
      .select("*")
      .eq("code", cleanCode)
      .single();

    if (error || !data) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    const isExpired = data.expiry_date < today;

    if (!data.is_active || isExpired || (data.current_uses >= data.max_uses)) {
      return null;
    }

    return {
      id: data.id,
      code: data.code,
      type: data.type as "percent" | "fixed",
      value: Number(data.value),
      expiryDate: data.expiry_date,
      maxUses: data.max_uses,
      currentUses: data.current_uses,
      isActive: data.is_active
    };
  },

  /**
   * Register a new coupon in Supabase
   */
  async createCoupon(c: Omit<Coupon, "id" | "currentUses">): Promise<any> {
    const { data, error } = await supabase
      .from("cupons")
      .insert({
        code: c.code.toUpperCase().trim(),
        type: c.type,
        value: c.value,
        expiry_date: c.expiryDate,
        max_uses: c.maxUses,
        current_uses: 0,
        is_active: c.isActive
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update fields for a coupon by its ID
   */
  async updateCoupon(id: string, c: Partial<Coupon>): Promise<any> {
    const dbPayload: any = {};
    if (c.code !== undefined) dbPayload.code = c.code.toUpperCase().trim();
    if (c.type !== undefined) dbPayload.type = c.type;
    if (c.value !== undefined) dbPayload.value = c.value;
    if (c.expiryDate !== undefined) dbPayload.expiry_date = c.expiryDate;
    if (c.maxUses !== undefined) dbPayload.max_uses = c.maxUses;
    if (c.currentUses !== undefined) dbPayload.current_uses = c.currentUses;
    if (c.isActive !== undefined) dbPayload.is_active = c.isActive;

    const { data, error } = await supabase
      .from("cupons")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete coupon by its ID
   */
  async deleteCoupon(id: string): Promise<any> {
    const { error } = await supabase
      .from("cupons")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
