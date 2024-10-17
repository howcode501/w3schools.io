/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 8/9/2021
 */

import { userActionTypes } from './actions';
import jwtDecode from 'jwt-decode';

//Define the user Default Values
const defaultValues = {
  isLogin: false,
  perms: [],
  token: null,
  tokenExpiry: 0,
  decodedToken: {},
  isAllowed: true
};

const initialState = {
  server: {
    ...defaultValues
  },
  client: {
    ...defaultValues
  }
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case userActionTypes.SET_LOGIN:
      return {
        ...state,
        server: {
          ...state.server,
          isLogin: action.isLogin,
          token: action.token,
          tokenExpiry: action.tokenExpiry,
          userData: action.userData,
          decodedToken: jwtDecode(action.token)
        },
        client: {
          ...state.client,
          isLogin: action.isLogin,
          token: action.token,
          tokenExpiry: action.tokenExpiry,
          userData: action.userData,
          decodedToken: jwtDecode(action.token)
        }
      };

    case userActionTypes.SET_LOGOUT:
      return {
        ...state,
        server: {
          defaultValues
        },
        client: {
          defaultValues
        }
      };
    case userActionTypes.SET_ALLOWED:
      return {
        ...state,
        server: {
          isAllowed: action.isAllowed
        },
        client: {
          isAllowed: action.isAllowed
        }
      };
    case userActionTypes.UPDATE_ACCESS_TOKEN:
      return {
        ...state,
        server: {
          ...state.server,
          isLogin: action.isLogin,
          token: action.token,
          userData: action.userData,
          decodedToken: jwtDecode(action.token)
        },
        client: {
          ...state.client,
          isLogin: action.isLogin,
          token: action.token,
          userData: action.userData,
          decodedToken: jwtDecode(action.token)
        }
      };

    /*case userActionTypes.SET_SUPER_ADMIN:
       state.isSuperAdmin = action.isSuperAdmin;
       return state;*/

    default:
      return state;
  }
};

export default userReducer;
