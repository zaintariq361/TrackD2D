'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store';

interface SocketLike {
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  off: (event: string, handler: (...args: unknown[]) => void) => void;
  emit: (event: string, ...args: unknown[]) => void;
  disconnect: () => void;
}

export function useRealtime() {
  const queryClient = useQueryClient();
  const { isAuthenticated, accessToken, organization } = useAuthStore();
  const socketRef = useRef<SocketLike | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || typeof window === 'undefined') return;

    let socket: SocketLike;
    let cleanup = () => {};

    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        socket = io(apiUrl, {
          auth: { token: accessToken },
          transports: ['websocket', 'polling'],
        }) as unknown as SocketLike;

        socketRef.current = socket;

        socket.on('connect', () => {
          if (organization?.id) {
            socket.emit('join:org', organization.id);
          }
        });

        const handleLeadCreated = () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        };

        const handleLeadUpdated = () => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        };

        const handleActivityCreated = () => {
          queryClient.invalidateQueries({ queryKey: ['activities'] });
        };

        socket.on('lead:created', handleLeadCreated);
        socket.on('lead:updated', handleLeadUpdated);
        socket.on('activity:created', handleActivityCreated);

        cleanup = () => {
          socket.off('lead:created', handleLeadCreated);
          socket.off('lead:updated', handleLeadUpdated);
          socket.off('activity:created', handleActivityCreated);
          socket.disconnect();
          socketRef.current = null;
        };
      } catch (err) {
        // Socket.io not available or connection failed — silently skip
        console.warn('[useRealtime] Socket connection failed:', err);
      }
    };

    initSocket();

    return () => {
      cleanup();
    };
  }, [isAuthenticated, accessToken, organization?.id, queryClient]);

  const emitLocation = useCallback((lat: number, lng: number) => {
    if (socketRef.current) {
      socketRef.current.emit('location:update', { lat, lng });
    }
  }, []);

  return { emitLocation };
}
