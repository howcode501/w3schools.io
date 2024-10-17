/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 10/20/2021
 */

import { API_ROOT } from '../helpers/config';
import { io } from 'socket.io-client';
import TokenService from './token';

const initSocketClient = () => {
  const token = TokenService.getLocalAccessToken();
  if (!token) return;

  return io(API_ROOT, {
    auth: {
      token: `Bearer ${token}`
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`
    },
    path: '/api/sockets',
    withCredentials: true
  });
};

export default initSocketClient;
