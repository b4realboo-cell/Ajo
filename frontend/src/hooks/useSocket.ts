import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore, useNetworkStore, useChatStore, useNotifStore } from '../store';

let socket: Socket | null = null;

export function useSocket() {
  const { accessToken } = useAuthStore();
  const { activeNetworkId } = useNetworkStore();
  const { addMessage } = useChatStore();
  const { addNotification } = useNotifStore();
  const prevNetworkId = useRef<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_SOCKET_URL || '', {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnectionAttempts: 5
      });

      socket.on('connect', () => console.log('[Socket] Connected'));
      socket.on('disconnect', () => console.log('[Socket] Disconnected'));
      socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
    }

    // Real-time message handler
    socket.on('new-message', (msg: any) => {
      addMessage(msg.networkId, msg);
    });

    // Real-time notification handler
    socket.on('notification', (notif: any) => {
      addNotification(notif);
      // Haptic feedback on mobile
      try {
        import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) =>
          Haptics.impact({ style: ImpactStyle.Light })
        );
      } catch {}
    });

    return () => {
      socket?.off('new-message');
      socket?.off('notification');
    };
  }, [accessToken]);

  // Join/leave network chat room when active network changes
  useEffect(() => {
    if (!socket || !activeNetworkId) return;
    if (prevNetworkId.current && prevNetworkId.current !== activeNetworkId) {
      socket.emit('leave-network', prevNetworkId.current);
    }
    socket.emit('join-network', activeNetworkId);
    prevNetworkId.current = activeNetworkId;
  }, [activeNetworkId]);

  const sendMessage = (networkId: string, content: string) => {
    socket?.emit('send-message', { networkId, content });
  };

  return { sendMessage, socket };
}

export function getSocket() { return socket; }
