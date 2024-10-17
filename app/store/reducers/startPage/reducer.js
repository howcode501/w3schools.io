/*
 * File Created for APP Inc
 * Project: app
 * User: ***
 * Date: 8/6/2021
 */

// import {HYDRATE} from 'next-redux-wrapper';

const initialState = {
  server: {
    startingPoint: '/'
  },
  client: {
    startingPoint: '/'
  }
};

export default function startpage(state = initialState, action) {
  switch (action.type) {
    case 'SET_START':
      return {
        ...state,
        server: {
          ...state.server,
          startingPoint: action.payload
        },
        client: {
          ...state.client,
          startingPoint: action.payload
        }
      };

    default:
      return state;
  }
}
