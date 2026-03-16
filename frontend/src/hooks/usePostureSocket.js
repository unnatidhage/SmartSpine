import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function usePostureSocket(userId) {
  const socketRef = useRef(null);
  const [latest, setLatest] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io('/', { transports: ['websocket'] });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on(`posture:${userId}`, (data) => {
      setLatest({ ...data, timestamp: new Date(data.timestamp) });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  return { latest, connected };
}
