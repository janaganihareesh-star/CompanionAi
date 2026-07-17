import api from './api';

/**
 * Converts the VAPID public key from base64 string to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Requests notification permissions and registers the push subscription.
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported by the browser.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied.');
      return false;
    }

    // Register service worker if not already
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('[Push OS] Service Worker registered.');

    // Wait until service worker is active
    await navigator.serviceWorker.ready;

    // Fetch public VAPID key from backend
    const res = await api.get('/api/push/public-key');
    const publicKey = res.data.publicKey;
    const applicationServerKey = urlBase64ToUint8Array(publicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    console.log('[Push OS] Push Subscription created:', subscription);

    // Send subscription to backend
    await api.post('/api/push/subscribe', subscription);
    console.log('[Push OS] Subscription sent to backend successfully.');
    
    return true;
  } catch (error) {
    console.error('[Push OS] Error subscribing to push:', error);
    return false;
  }
}
