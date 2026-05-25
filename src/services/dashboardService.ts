import { supabase } from "../supabaseClient";
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
   * Fetch aggregate KPI cards using public.vw_dashboard_stats
   */
  async getMetrics(): Promise<DashboardMetrics> {
    const { data, error } = await supabase
      .from("vw_dashboard_stats")
      .select("*")
      .single();

    if (error) {
      console.error("Error reading vw_dashboard_stats view:", error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        averageTicket: 0
      };
    }

    return {
      totalRevenue: Number(data.total_revenue || 0),
      totalOrders: Number(data.total_orders || 0),
      completedOrders: Number(data.completed_orders || 0),
      pendingOrders: Number(data.pending_orders || 0),
      averageTicket: Number(data.average_ticket || 0)
    };
  },

  /**
   * Read past week's daily totals for the custom SVG bar chart report
   */
  async getWeeklyRevenue(): Promise<WeeklyRevenuePoint[]> {
    const { data, error } = await supabase
      .from("vw_revenue_weekly")
      .select("*");

    if (error) {
      console.error("Error reading vw_revenue_weekly view:", error);
      return [];
    }

    return (data || []).map((p): WeeklyRevenuePoint => ({
      dayLabel: p.day_label,
      totalDay: Number(p.total_day || 0),
      countDay: Number(p.count_day || 0)
    }));
  },

  /**
   * Safe fetch resturant contacts, fees and status lights
   */
  async getShopSettings(): Promise<Settings> {
    const { data, error } = await supabase
      .from("configuracoes")
      .select("*")
      .eq("key", "store_general")
      .single();

    const fallback: Settings = {
      whatsappNumber: "5511999999999",
      storeOpen: true,
      estimatedDeliveryTime: "30-45 min",
      deliveryFee: 7.00
    };

    if (error || !data) {
      return fallback;
    }

    const val = data.value;
    return {
      whatsappNumber: val?.whatsappNumber || fallback.whatsappNumber,
      storeOpen: val?.storeOpen !== undefined ? val.storeOpen : fallback.storeOpen,
      estimatedDeliveryTime: val?.estimatedDeliveryTime || fallback.estimatedDeliveryTime,
      deliveryFee: val?.deliveryFee !== undefined ? Number(val.deliveryFee) : fallback.deliveryFee
    };
  },

  /**
   * Update restaurant configs inside Json key-pair records
   */
  async updateShopSettings(s: Settings): Promise<Settings> {
    const { data, error } = await supabase
      .from("configuracoes")
      .upsert({
        key: "store_general",
        value: {
          whatsappNumber: s.whatsappNumber,
          storeOpen: s.storeOpen,
          estimatedDeliveryTime: s.estimatedDeliveryTime,
          deliveryFee: s.deliveryFee
        },
        description: "Informações fundamentais e contatos do rancho"
      }, {
        onConflict: "key"
      })
      .select()
      .single();

    if (error) throw error;
    return s;
  }
};
