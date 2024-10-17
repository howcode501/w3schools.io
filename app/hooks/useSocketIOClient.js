import React from 'react';
import { initSocketClient } from '../services';
import TokenService from '../services/token';

const useSocketIOClient = (callback = () => {}) => {
  const token = TokenService.getLocalAccessToken();
  const [socket, setSocket] = React.useState(null);

  React.useEffect(() => {
    if (!token) return;

    const socket = initSocketClient();
    setSocket(socket);

    socket.on('connect', () => {
      setIsConnected(true);
      callback('connected');
    });

    socket.on('disconnect', () => {
      callback('disconnect');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [token]);

  return [socket];
};

export default useSocketIOClient;
