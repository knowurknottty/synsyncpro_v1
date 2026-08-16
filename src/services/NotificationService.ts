/**
 * Notification Service
 *
 * Web Notifications for session reminders
 */

export interface NotificationPreferences {
  enabled: boolean;
  reminderMinutes: number; // 15, 30, 60
  sound: boolean;
}

const PREFS_KEY = 'synsync_notification_prefs';

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Show notification
 */
export function showNotification(
  title: string,
  body: string,
  onClick?: () => void
): void {
  if (Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'synsync-session',
    requireInteraction: false,
  });

  if (onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  // Auto-close after 10 seconds
  setTimeout(() => notification.close(), 10000);
}

/**
 * Schedule session reminder
 */
export function scheduleSessionReminder(
  sessionTime: number,
  protocolName: string,
  onClick?: () => void
): number | null {
  const prefs = getPreferences();

  if (!prefs.enabled) {
    return null;
  }

  const reminderTime = sessionTime - prefs.reminderMinutes * 60 * 1000;
  const delay = reminderTime - Date.now();

  if (delay <= 0) {
    return null; // Too late
  }

  const timeoutId = window.setTimeout(() => {
    showNotification(
      'Session Reminder',
      `Your ${protocolName} session starts in ${prefs.reminderMinutes} minutes`,
      onClick
    );
  }, delay);

  return timeoutId;
}

/**
 * Get notification preferences
 */
export function getPreferences(): NotificationPreferences {
  const stored = localStorage.getItem(PREFS_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Fall through to defaults
    }
  }

  return {
    enabled: false,
    reminderMinutes: 15,
    sound: true,
  };
}

/**
 * Save notification preferences
 */
export function savePreferences(prefs: NotificationPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

/**
 * Test notification
 */
export async function testNotification(): Promise<boolean> {
  const granted = await requestNotificationPermission();

  if (granted) {
    showNotification('Test Notification', 'Notifications are working!');
    return true;
  }

  return false;
}
