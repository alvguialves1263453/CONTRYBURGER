import { supabase } from "../supabaseClient";
import { Order, OrderItem } from "../types";

export const orderService = {
  /**
   * Safe fetch orders connected with user or admin lookup
   */
  async getOrders(userId?: string, isAdmin: boolean = false): Promise<Order[]> {
    let query = supabase.from("pedidos").select(`
      *,
      items:pedido_itens(*)
    `);

    // If customer (not admin), only fetch their own orders
    if (!isAdmin && userId) {
      query = query.eq("user_id", userId);
    } else if (!isAdmin && !userId) {
      // Unauthenticated, return empty list (or handle local state)
      return [];
    }

    const { data: dbOrders, error } = await query.order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return (dbOrders || []).map((o): Order => {
      const packedItems: OrderItem[] = (o.items || []).map((item: any) => ({
        productId: item.produto_id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        obs: item.obs || "",
        imageUrl: item.image_url || ""
      }));

      return {
        id: o.id,
        customerName: o.customer_name,
        customerPhone: o.customer_phone,
        customerAddress: o.customer_address,
        paymentMethod: o.payment_method,
        items: packedItems,
        subtotal: Number(o.subtotal),
        discount: Number(o.discount),
        total: Number(o.total),
        status: o.status as Order["status"],
        timestamp: o.timestamp
      };
    });
  },

  /**
   * Register a new checkout order and its line items inside Supabase
   */
  async createOrder(order: Omit<Order, "id" | "timestamp">, userId?: string): Promise<Order> {
    // 1. Inserir na tabela pedidos
    const { data: dbOrder, error: orderError } = await supabase
      .from("pedidos")
      .insert({
        user_id: userId || null,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.customerAddress,
        payment_method: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        status: order.status || "pendente"
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Inserir itens vinculados
    const itemsPayload = order.items.map((item) => ({
      pedido_id: dbOrder.id,
      produto_id: item.productId.startsWith("prod-") || item.productId.length < 10 ? null : item.productId, // Handle uuids or safe bypass
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      obs: item.obs,
      image_url: item.imageUrl
    }));

    const { error: itemsError } = await supabase
      .from("pedido_itens")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Error inserting order items, deleting order as well:", itemsError);
      // Clean up order to keep DB pure
      await supabase.from("pedidos").delete().eq("id", dbOrder.id);
      throw itemsError;
    }

    // Increment sales count on products asynchronously
    order.items.forEach(async (item) => {
      try {
        if (item.productId && !item.productId.startsWith("prod-")) {
          // Increment sales count inside database
          const { data: pData } = await supabase
            .from("produtos")
            .select("sales_count")
            .eq("id", item.productId)
            .single();

          if (pData) {
            await supabase
              .from("produtos")
              .update({ sales_count: (pData.sales_count || 0) + item.quantity })
              .eq("id", item.productId);
          }
        }
      } catch (err) {
        console.warn("Async increment warning:", err);
      }
    });

    return {
      ...order,
      id: dbOrder.id,
      timestamp: dbOrder.timestamp
    };
  },

  /**
   * Update active ticket status
   */
  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<any> {
    const { data, error } = await supabase
      .from("pedidos")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove absolute records (admin only)
   */
  async deleteOrder(orderId: string): Promise<any> {
    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", orderId);

    if (error) throw error;
  }
};
