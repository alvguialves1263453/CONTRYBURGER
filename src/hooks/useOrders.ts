import { useState, useEffect, useCallback } from "react";
import { orderService } from "../services/orderService";
import { Order } from "../types";

export function useOrders(userId?: string, isAdmin: boolean = false) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders(userId, isAdmin);
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar histórico de pedidos.");
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const createOrder = async (order: Omit<Order, "id" | "timestamp">) => {
    try {
      setLoading(true);
      const newOrder = await orderService.createOrder(order, userId);
      await refreshOrders();
      return newOrder;
    } catch (err: any) {
      setError(err.message || "Erro ao registrar pedido.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(orderId, status);
      await refreshOrders();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status do pedido.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setLoading(true);
      await orderService.deleteOrder(orderId);
      await refreshOrders();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar registro de pedido.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    refreshOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder
  };
}
