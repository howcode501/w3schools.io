import { useEffect, useState } from 'react';
import store from '../store/';
import axios from 'axios';
import useSWR from 'swr';

const state = store;

export default function useUser() {
  //const { token } = useAuth();
  const [user, setUser] = useState(null);

  // get user data
  const { data, error, mutate } = useSWR(
    state.user.token ? '/auth/me' : null,
    (url) =>
      axios
        .request({
          url,
          method: 'get',
          headers: { Authorization: `Bearer ${state.user.token}` }
        })
        .then(({ data }) => data),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (data) {
      setUser(data);
    }
    if (error) {
      setUser(null);
    }
  }, [data, error]);

  return { user, mutate };
}
