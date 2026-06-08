import { Settings } from "../types";

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  averageTicket: number;
}

export interface WeeklyRevenuePoint {
  dayLabel: string;
  totalDay: number;
  countDay: number;
}

export const dashboardService = {
  /**
   * Fetch aggregate KPI cards from local database values
   */
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders for metrics");
      const orders: any[] = await response.json();
      
      const completed = orders.filter((o) => o.status === "entregue");
      const totalRevenue = completed.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const totalOrders = orders.length;
      const completedOrders = completed.length;
      const pendingOrders = orders.filter((o) => ["pendente", "confirmado", "em_preparo", "enviado"].includes(o.status)).length;
      const averageTicket = completedOrders > 0 ? (totalRevenue / completedOrders) : 0;
      
      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        averageTicket
      };
    } catch (err) {
      console.error("Local metrics computation error:", err);
      return { totalRevenue: 0, totalOrders: 0, completedOrders: 0, pendingOrders: 0, averageTicket: 0 };
    }
  },

  /**
   * Read past week's daily totals for the custom SVG bar chart report
   */
  async getWeeklyRevenue(): Promise<WeeklyRevenuePoint[]> {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) throw new Error("Failed to fetch orders for weekly revenue");
      const orders: any[] = await response.json();
      
      const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const group: { [key: string]: { total: number; count: number } } = {};
      
      weekdays.forEach((day) => {
        group[day] = { total: 0, count: 0 };
      });
      
      orders.forEach((o) => {
        if (o.status !== "cancelado") {
          const date = new Date(o.timestamp);
          const dayLabel = weekdays[date.getDay()];
          if (group[dayLabel]) {
            group[dayLabel].total += Number(o.total || 0);
            group[dayLabel].count += 1;
          }
        }
      });
      
      return weekdays.map((day) => ({
        dayLabel: day,
        totalDay: group[day].total,
        countDay: group[day].count
      }));
    } catch (err) {
      console.error("Local weekly revenue computation error:", err);
      return [];
    }
  },

  /**
   * Safe fetch restaurant contacts, fees and status lights
   */
  async getShopSettings(): Promise<Settings> {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return await response.json();
    } catch (err) {
      console.error("Local settings fetch error:", err);
      return {
        whatsappNumber: "5511999999999",
        storeOpen: true,
        estimatedDeliveryTime: "30-45 min",
        deliveryFee: 7.00
      };
    }
  },

  /**
   * Update restaurant configs
   */
  async updateShopSettings(s: Settings): Promise<Settings> {
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    if (!response.ok) throw new Error("Failed to update settings");
    const res = await response.json();
    return res.settings;
  }
};
