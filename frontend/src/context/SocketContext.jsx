import React, { createContext, useState, useEffect, useContext } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (stompClient) {
        stompClient.disconnect(() => {
          console.log('WebSocket disconnected.');
        });
        setStompClient(null);
        setIsConnected(false);
      }
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'https://azentrix-fullstack-task2-49qq.onrender.com/ws';
    console.log('Connecting to WebSocket at:', wsUrl);
    
    const socket = new SockJS(wsUrl);
    // Overriding the default console logging of Stomp
    const client = Stomp.over(socket);
    client.debug = (str) => {
      // Custom minimal logs instead of spamming full frames
      if (str.includes('Received') || str.includes('Send') || str.includes('Connect')) {
        console.log('[WebSocket]', str);
      }
    };

    client.connect(
      {},
      (frame) => {
        console.log('WebSocket Connected successfully: ' + frame);
        setStompClient(client);
        setIsConnected(true);
      },
      (error) => {
        console.error('WebSocket connection error, will retry...', error);
        setIsConnected(false);
        // Attempt reconnection after 5 seconds
        setTimeout(() => {
          setIsConnected(false);
        }, 5000);
      }
    );

    return () => {
      if (client) {
        client.disconnect(() => {
          console.log('WebSocket connection cleaned up.');
        });
      }
    };
  }, [user]);

  const value = {
    stompClient,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
