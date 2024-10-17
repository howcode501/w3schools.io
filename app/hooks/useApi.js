import api from '../services/api';

const useApi = () => {
  const formatFilter = (filters) => {
    return Object.keys(filters).reduce((acc, filterKey) => {
      const [name, operator = 'eq'] = filterKey.split(':');
      return {
        ...acc,
        [name]: `${filters[filterKey]}:${operator}`
      };
    }, {});
  };

  //Setup our API Resources
  const rest = (resource, params) => {
    const { page: currentPage, perPage } = params.pagination || {};
    const { field: sortBy, order: orderBy } = params.sort || {};
    const data = params.data;
    return { data };
  };

  //GET Data
  const get = async (resource, params = {}) => {
    //socket.connect();
    return new Promise((resolve, reject) => {
      //Call the API
      api
        .get(resource)
        .then((res) => {
          if (res?.status === 200) {
            resolve(res);
          } else if (res) {
            // Error handle null response
            reject(res);
          }
        })
        .catch((e) => reject(e));
    });
  };

  const put = async (resource, params) => {
    const { data: inData } = rest(resource, params);

    //Post data
    const putData = await api.put(resource, params);

    return putData;
  };

  const post = async (resource, params) => {
    const { data: inData } = rest(resource, params);

    //Post data
    const postData = await api.post(resource, params);

    return postData;
  };

  const patch = async (resource, params) => {
    const { data: inData } = rest(resource, params);

    // Patch data
    const patchData = await api.patch(resource, params);

    return patchData;
  };

  const del = async (resource, params) => {
    // eslint-disable-next-line no-unused-vars
    const { data: inData } = rest(resource, params);

    const delData = await api.delete(resource, params);
    return delData;
  };

  return { get, put, post, del, patch };
};

export default useApi;
