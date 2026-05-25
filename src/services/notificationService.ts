import { supabase } from "../supabaseClient";

export interface SystemNotification {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  /**
   * Safe load notifications matching authentication slots
   */
  async getNotifications(userId: string): Promise<SystemNotification[]> {
    const { data, error } = await supabase
      .from("notificacoes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading notifications:", error);
      return [];
    }

    return (data || []).map((n): SystemNotification => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      isRead: n.is_read,
      createdAt: n.created_at
    }));
  },

  /**
   * Register system alerts (can trigger push and layout animations)
   */
  async createNotification(userId: string, title: string, message: string) {
    const { data, error } = await supabase
      .from("notificacoes")
      .insert({
        user_id: userId,
        title,
        message,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Switch the read status tag to True
   */
  async markAsRead(id: string): Promise<any> {
    const { data, error } = await supabase
      .from("notificacoes")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
