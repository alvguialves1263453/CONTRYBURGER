import { useEffect } from "react";

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
    // Purely offline/local storage: no socket listeners needed
  }, [onOrderChange, onNotificationChange, onProductChange]);
}
