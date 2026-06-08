import { Order } from "../types";

export const orderService = {
  /**
   * Safe fetch orders connected with user or admin lookup
   */
  async getOrders(userId?: string, isAdmin: boolean = false): Promise<Order[]> {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders");
      const list: Order[] = await response.json();
      return list.slice().reverse(); // Newest first
    } catch (err) {
      console.error("Local orders fetch error:", err);
      return [];
    }
  },

  /**
   * Register a new checkout order and its line items inside local database
   */
  async createOrder(order: Omit<Order, "id" | "timestamp">, userId?: string): Promise<Order> {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!response.ok) throw new Error("Failed to create order");
    const res = await response.json();
    return res.order;
  },

  /**
   * Update active ticket status
   */
  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<any> {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update order status");
    const res = await response.json();
    return res.order;
  },

  /**
   * Remove absolute records (admin only)
   */
  async deleteOrder(orderId: string): Promise<any> {
    const response = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete order");
    return;
  }
};
