/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 9/13/2021
 */

export const loginActionTypes = {
  SET_USERNAME: 'SET_USERNAME'
};

export const setUsername = (payload) => (dispatch) => {
  return dispatch({ type: loginActionTypes.SET_USERNAME, payload });
};
