module.exports = async (models, config, logger) => {
  const { ApiKeys } = models;

  // Construct a query object for api key lookups
  // TODO Come back and account for Hidden and Disabled subscription
  function apiKeys_where({ id, email, key, status, search_string }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (email) {
      query.email = email;
    }
    if (key) {
      query.key = key;
    }
    if (status) {
      query.status = status;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique api email based on query params,
  // but return very little information for security
  async function apiKeys_validateEmail(params) {
    const query = apiKeys_where(params);

    // If they are searching by email key, let's add some wildcard features
    if (query.email) {
      const { email } = query;

      query.email = {
        equals: email,
        mode: "insensitive",
      };
    }
    logger.warn({ query }, "apiKeys_validateEmail");
    const apiKeysMany = ApiKeys.findMany({
      where: query,
    });
    return apiKeysMany;
  }

  // Find a unique api key based on query params
  async function apiKeys_findUnique(params) {
    const query = apiKeys_where(params);

    logger.warn({ query }, "apiKeys_findUnique");

    const apiKeyFound = ApiKeys.findUnique({
      where: { ...query },
    });
    return apiKeyFound;
  }

  async function apiKeys_upsert({ id, email, key, status, routes }) {
    if (!email) logger.debug({ email }, "Upsert api key");
    let apiKey;
    if (id !== "" && id !== undefined) {
      apiKey = await apiKeys_findUnique({ id });
    } else {
      apiKey = await apiKeys_findUnique({ email });
    }

    if (apiKey === null) {
      logger.debug({ email }, "No such api key, creating..");
      apiKey = await ApiKeys.create({
        data: {
          email,
          key,
          status,
          routes,
        },
      });
    } else {
      logger.debug({ email }, "api key exists, updating..");
      apiKey = await ApiKeys.update({
        where: { id: apiKey.id },
        data: {
          email,
          key,
          status,
          routes,
        },
      });
    }

    logger.debug({ apiKey }, "apiKey Upserted");
    return apiKey;
  }

  // Normalize api key into a structure for transport over REST
  async function apiKeys_normalize(apikeys) {
    if (!apikeys) {
      return null;
    }

    logger.debug(apikeys, "apiKeys Normalize Data In");

    return apikeys;
  }

  // Get list of api keys
  async function apiKeys_getList(params = {}) {
    const query = apiKeys_where(params);

    const apiKeysMany = ApiKeys.findMany({
      where: query,
      orderBy: {
        email: "asc",
      },
    });
    return apiKeysMany;
  }

  async function apiKeys_update(id, params) {
    const apiKey = await ApiKeys.update({
      where: { id },
      data: { ...params },
    });

    return apiKey;
  }

  async function apiKeys_deleteHard(apikey) {
    logger.debug({ apikey }, "Found apikey..");

    // finally, delete the apikey record
    await ApiKeys.delete({ where: { id: apikey.id } });

    logger.debug({ apikey }, "apikey Hard delete complete");

    return apikey;
  }

  return {
    apiKeys_where,
    apiKeys_validateEmail,
    apiKeys_findUnique,
    apiKeys_upsert,
    apiKeys_normalize,
    apiKeys_getList,
    apiKeys_update,
    apiKeys_deleteHard,
  };
};
