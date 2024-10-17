/*
 * File Created for APP Inc
 * Project: nextjs-spike
 * User: ***
 * Date: 8/31/2021
 */
export const dashboardActionTypes = {
  TOGGLE_LEFT_DRAWER: 'TOGGLE_LEFT_DRAWER'
};

export const toggleLeftDrawer = (newState) => (dispatch) => {
  return dispatch({
    type: dashboardActionTypes.TOGGLE_LEFT_DRAWER,
    payload: newState
  });
};
