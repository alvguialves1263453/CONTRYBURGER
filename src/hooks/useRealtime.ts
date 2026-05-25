import { useEffect } from "react";
import { supabase } from "../supabaseClient";

interface RealtimeCallbacks {
  onOrderChange?: (payload: any) => void;
  onNotificationChange?: (payload: any) => void;
  onProductChange?: (payload: any) => void;
}

export function useRealtime({
  onOrderChange,
  onNotificationChange,
  onProductChange
}: RealtimeCallbacks) {
  useEffect(() => {
    // 1. Listen to orders modification channels (pedidos)
    const ordersChannel = supabase
      .channel("pedidos-realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pedidos"
        },
        (payload) => {
          if (onOrderChange) {
            onOrderChange(payload);
          }
        }
      )
      .subscribe();

    // 2. Listen to system notifications channel
    const notificationsChannel = supabase
      .channel("notificacoes-realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notificacoes"
        },
        (payload) => {
          if (onNotificationChange) {
            onNotificationChange(payload);
          }
        }
      )
      .subscribe();

    // 3. Listen to menu updates (produtos)
    const productsChannel = supabase
      .channel("produtos-realtime-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "produtos"
        },
        (payload) => {
          if (onProductChange) {
            onProductChange(payload);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions when component unmounts
    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(productsChannel);
    };
  }, [onOrderChange, onNotificationChange, onProductChange]);
}
