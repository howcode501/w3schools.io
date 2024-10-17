import { createStore, applyMiddleware } from 'redux';
import { HYDRATE } from 'next-redux-wrapper';
import rootReducer from './reducers';
import thunkMiddleware from 'redux-thunk';

const bindMiddleware = (middleware) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const combinedReducer = rootReducer;

const reducer = (state, action) => {
  if (action.type === HYDRATE) {
    const nextState = {
      ...state, // use previous state
      ...action.payload // apply delta from hydration
    };

    if (typeof window !== 'undefined' && state.router) {
      // preserve router value on client side navigation
      nextState.router = state.router;
    }

    return nextState;
  } else {
    return combinedReducer(state, action);
  }
};

//Make the Store
const store = createStore(reducer, bindMiddleware([thunkMiddleware]));

export default store;
