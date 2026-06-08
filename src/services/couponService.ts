import { Coupon } from "../types";

export const couponService = {
  /**
   * Fetch all discount coupons registered
   */
  async getCoupons(): Promise<Coupon[]> {
    try {
      const response = await fetch("/api/coupons");
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return await response.json();
    } catch (err) {
      console.error("Local coupons fetch error:", err);
      return [];
    }
  },

  /**
   * Validate code inputs from user checkout
   */
  async validateCoupon(code: string): Promise<Coupon | null> {
    const cleanCode = code.toUpperCase().trim();
    try {
      const response = await fetch("/api/coupons");
      if (!response.ok) return null;
      const list: Coupon[] = await response.json();
      const found = list.find((c) => c.code === cleanCode);
      if (!found) return null;
      const today = new Date().toISOString().split("T")[0];
      const isExpired = found.expiryDate < today;
      if (!found.isActive || isExpired || (found.currentUses >= found.maxUses)) {
        return null;
      }
      return found;
    } catch (err) {
      console.error("Local validation error:", err);
      return null;
    }
  },

  /**
   * Register a new coupon
   */
  async createCoupon(c: Omit<Coupon, "id" | "currentUses">): Promise<any> {
    const response = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    if (!response.ok) throw new Error("Failed to create coupon");
    const res = await response.json();
    return res.coupon;
  },

  /**
   * Update fields for a coupon by its ID
   */
  async updateCoupon(id: string, c: Partial<Coupon>): Promise<any> {
    const response = await fetch(`/api/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });
    if (!response.ok) throw new Error("Failed to update coupon");
    const res = await response.json();
    return res.coupon;
  },

  /**
   * Delete coupon by its ID
   */
  async deleteCoupon(id: string): Promise<any> {
    const response = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete coupon");
    return;
  }
};
