import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

// ─── Push Notifications setup ────────────────────────────────
export async function setupPushNotifications(userId: string) {
  if (!isNative) return;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const permission = await PushNotifications.requestPermissions();
    if (permission.receive === 'granted') {
      await PushNotifications.register();
      PushNotifications.addListener('registration', (token) => {
        // Send token to backend to associate with user
        fetch('/api/users/push-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, platform })
        });
      });
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('[Push]', notification);
      });
    }
  } catch (err) {
    console.warn('Push notifications not available:', err);
  }
}

// ─── Status bar control (iOS/Android) ────────────────────────
export async function setStatusBar(isDark = false) {
  if (!isNative) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({ color: isDark ? '#0e0e0e' : '#f7f4ef' });
  } catch {}
}

// ─── Haptic feedback ─────────────────────────────────────────
export async function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (!isNative) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    if (type === 'success') await Haptics.notification({ type: NotificationType.Success });
    else if (type === 'error') await Haptics.notification({ type: NotificationType.Error });
    else {
      const styleMap = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy };
      await Haptics.impact({ style: styleMap[type] });
    }
  } catch {}
}

// ─── Safe area insets hook ────────────────────────────────────
export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  useEffect(() => {
    if (isNative && platform === 'ios') {
      // iOS safe area — set CSS env vars handled natively
      setInsets({ top: 44, bottom: 34, left: 0, right: 0 });
    }
  }, []);
  return insets;
}

// ─── Keyboard avoid hook ─────────────────────────────────────
export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    if (!isNative) return;
    import('@capacitor/keyboard').then(({ Keyboard }) => {
      Keyboard.addListener('keyboardWillShow', (info) => setKeyboardHeight(info.keyboardHeight));
      Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    });
  }, []);
  return { keyboardHeight };
}

// ─── Apple Pay availability check ────────────────────────────
export function useApplePayAvailable() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (platform === 'ios' || (platform === 'web' && /Safari/.test(navigator.userAgent))) {
      setAvailable(!!(window as any).ApplePaySession?.canMakePayments?.());
    }
  }, []);
  return available;
}
