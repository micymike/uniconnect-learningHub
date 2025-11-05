import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'https://app.uniconnect-learninghub.co.ke/api';

export const useSocket = (userId: string | null) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const newSocket = io(API_BASE.replace('/api', ''), {
      auth: { userId },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return { socket, isConnected };
};
