import { dashboardActionTypes } from './actions';

const initialState = {
  server: {
    leftDrawer: true
  },
  client: {
    leftDrawer: false
  }
};

export default function dashboard(state = initialState, action) {
  switch (action.type) {
    case dashboardActionTypes.TOGGLE_LEFT_DRAWER:
      return {
        ...state,
        server: {
          ...state.server,
          leftDrawer: action.payload
        },
        client: {
          ...state.client,
          leftDrawer: action.payload
        }
      };

    default:
      return state;
  }
}
