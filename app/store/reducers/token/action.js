export const tokenAction = {
  SET_TOKEN: 'SET_TOKEN'
};
export const setToken = (token) => (dispatch) => {
  return dispatch({ type: tokenAction.SET_TOKEN, payload: token });
};
