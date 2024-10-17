/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 10/20/2021
 */
import store from '../store';
import jwt from 'jwt-decode';

//We won't use this, because send the Refresh token as a cookie
const getLocalRefreshToken = () => {
  //const user = JSON.parse(localStorage.getItem('user'));
  //return user?.refreshToken;
};

//This is where we grab our token from Redux
const getLocalAccessToken = () => {
  const token = store.getState().user.client.token;
  return token;
};

//This will return the USER ROLE
const getUserRole = () => {
  let userRole;
  if (store.getState().user.client.userData) {
    userRole = store.getState().user.client.userData.roles[0];
  }
  return userRole;
};

//This will return the USER DATA
const getUserData = () => {
  let userData;
  if (store.getState().user.client.userData) {
    userData = store.getState().user.client.userData;
  }
  return userData;
};

const getUserIsLoggedIn = () => {
  if (store.getState().user.client.isLogin) {
    return store.getState().user.client.isLogin;
  }
  return false;
};

//This is where we decode token
const getDecodedToken = (token) => {
  let userData = store.getState().user.client.userData;
  if (userData) {
    return userData;
  } else {
    const userData = jwt(token);
    updateLocalAccessToken(token, userData);
    return userData;
  }
};

//This is where we set their access token
const updateLocalAccessToken = (token, userData) => {
  store.dispatch({
    type: 'UPDATE_ACCESS_TOKEN',
    isLogin: true,
    token: token,
    userData: userData
  });
};

// we don't use this
const getUser = () => {
  //return JSON.parse(localStorage.getItem('user'));
};

// we don't use this
const setUser = () => {
  // Removed.  We aren't using Local Storage
  // localStorage.setItem('user', JSON.stringify(user));
};

const removeUser = () => {
  //localStorage.removeItem('user');
  store.dispatch({
    type: 'SET_LOGOUT'
  });
};

const TokenService = {
  getLocalRefreshToken,
  getLocalAccessToken,
  updateLocalAccessToken,
  getUserIsLoggedIn,
  getUser,
  setUser,
  getDecodedToken,
  getUserData,
  removeUser,
  getUserRole
};

export default TokenService;
