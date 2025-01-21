self.addEventListener('push', (event) => {
  console.log('Push event received:', event.data);
    const data = event.data ? event.data.json() : {}; // 接收推播資料 (JSON 格式)
    const title = data.title || 'Notification Title';
    const options = {
      body: data.body || 'Notification Body',
      icon: data.icon || '/icon.png',
      badge: data.badge || '/badge.png',
    };
  
    // 顯示通知
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // 關閉通知
    const clickUrl = event.notification.data?.url || '/';

    // 開啟指定的頁面
    event.waitUntil(clients.openWindow(clickUrl));
});