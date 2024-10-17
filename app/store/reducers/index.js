/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 8/6/2021
 */

import { combineReducers } from 'redux';
import startpage from './startPage/reducer';
import user from './user/reducer';
import dashboard from './dashboard/reducer';
import login from './login/reducer';

const rootReducer = combineReducers({
  startpage: startpage,
  user: user,
  dashboard: dashboard,
  login: login
});

export default rootReducer;
