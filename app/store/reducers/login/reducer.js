/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 9/13/2021
 */

const initialState = {
  server: {
    username: ''
  },
  client: {
    username: '',
    valid: false
  }
};

export default function login(state = initialState, action) {
  switch (action.type) {
    case 'SET_USERNAME':
      return {
        ...state,
        server: {
          ...state.server
        },
        client: {
          ...state.client,
          ...action.payload
        }
      };

    default:
      return state;
  }
}
