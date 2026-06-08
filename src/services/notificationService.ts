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
    const local = localStorage.getItem("country_food_notifications");
    return local ? JSON.parse(local) : [];
  },

  /**
   * Register system alerts (can trigger push and layout animations)
   */
  async createNotification(userId: string, title: string, message: string) {
    const newNotif: SystemNotification = {
      id: "notif-" + Date.now() + Math.floor(Math.random() * 1000),
      userId: userId || null,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    const local = localStorage.getItem("country_food_notifications");
    const list = local ? JSON.parse(local) : [];
    list.unshift(newNotif);
    localStorage.setItem("country_food_notifications", JSON.stringify(list));
    return newNotif;
  },

  /**
   * Switch the read status tag to True
   */
  async markAsRead(id: string): Promise<any> {
    const local = localStorage.getItem("country_food_notifications");
    if (local) {
      const list = JSON.parse(local);
      const idx = list.findIndex((n: any) => n.id === id);
      if (idx !== -1) {
        list[idx].isRead = true;
        localStorage.setItem("country_food_notifications", JSON.stringify(list));
      }
    }
    return { success: true };
  }
};
