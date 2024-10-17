/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 10/20/2021
 */

import api from './api';
import TokenService from './token';
import store from '../store';
import axios from 'axios';
import { AUTH_ENDPOINT } from '../helpers/config';

const login = (username, password) => {
  return api
    .post('/auth/signin', {
      username,
      password
    })
    .then((response) => {
      if (response.data.accessToken) {
        TokenService.setUser(response.data);
      }

      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('isLogin');

  //Handle Landing Page
  store.dispatch({
    type: 'SET_LOGOUT'
  });

  // remove session from backend
  axios.request({
    url: `${AUTH_ENDPOINT}/logout`,
    method: 'get',
    withCredentials: true
  });

  TokenService.removeUser();
};

const getCurrentUser = () => {
  //Commented out by balkishan Bush because we should not be using local storage at all  5/26/2022
  //return JSON.parse(localStorage.getItem('user'))
};

const AuthService = {
  login,
  logout,
  getCurrentUser
};

export default AuthService;
