export const NotificationService = {
  async requestPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async showNotification(title, body) {
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      new Notification(title, { body });
    }
  }
};
