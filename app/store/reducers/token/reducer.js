const initialStat = {
  token: ''
};
export default function token(state = initialStat, action) {
  switch (action.type) {
    case 'SET_TOKEN':
      return {
        ...state,
        token: action.payload
      };

    default:
      return state;
  }
}
