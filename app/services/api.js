import { API_ROOT } from '../helpers/config';
import axios from 'axios';
import TokenService from './token';

//This defines our Axios Instance
const instance = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0'
  }
});

instance.interceptors.request.use(
  (config) => {
    const token = TokenService.getLocalAccessToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    if (
      originalConfig.url !== '/auth/login' &&
      originalConfig.url !== '/auth/refresh-token' &&
      err.response
    ) {
      // Access Token was expired
      if (err.response.status === 401 && !originalConfig._retry) {
        try {
          const rs = await instance.get('/auth/refresh-token', {});

          const { accessToken } = rs.data;

          const decodeData = TokenService.getDecodedToken(accessToken);
          TokenService.updateLocalAccessToken(accessToken, decodeData);

          return instance(originalConfig);
        } catch (_error) {
          window.location.replace('/');
          return null;
          //return Promise.reject(_error);
        }
      }
    }
    return null;
    //return Promise.reject(err);
  }
);

export default instance;
