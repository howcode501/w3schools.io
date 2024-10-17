module.exports = async (models, config, logger, _prisma) => {
  const { UserAppDeviceId } = models;

  // Construct a query object for user app device id lookups
  // TODO Come back and account for Hidden and Disabled subscription
  function userAppDeviceId_where({
    id,
    user_id,
    app_id,
    feature_id,
    device_id,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (user_id) {
      query.user_id = user_id;
    }
    if (app_id) {
      query.app_id = app_id;
    }
    if (feature_id) {
      query.feature_id = feature_id;
    }
    if (device_id) {
      query.device_id = device_id;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique user app device id based on query params
  async function userAppDeviceId_findUnique(params) {
    const query = userAppDeviceId_where(params);

    logger.warn({ query }, "userAppDeviceId_findUnique");

    const userAppDeviceIdFound = UserAppDeviceId.findUnique({
      where: { ...query },
    });
    return userAppDeviceIdFound;
  }

  async function userAppDeviceId_insert(params) {
    const userAppDeviceId = await UserAppDeviceId.create({
      data: {
        ...params,
      },
    });

    logger.debug({ userAppDeviceId }, "userAppDeviceId inserted");
    return userAppDeviceId;
  }

  // Normalize user app device id into a structure for transport over REST
  async function userAppDeviceId_normalize(userAppDeviceId) {
    if (!userAppDeviceId) {
      return null;
    }

    logger.debug(userAppDeviceId, "userAppDeviceId Normalize Data In");

    return userAppDeviceId;
  }

  // Get list of user app device id
  async function userAppDeviceId_getList(params = {}) {
    const query = userAppDeviceId_where(params);

    const userAppDeviceIDMany = UserAppDeviceId.findMany({
      where: query,
      orderBy: {
        device_id: "asc",
      },
    });
    return userAppDeviceIDMany;
  }

  async function userAppDeviceId_update(id, params) {
    const userAppDeviceId = await UserAppDeviceId.update({
      where: { id },
      data: { ...params },
    });

    return userAppDeviceId;
  }

  async function userAppDeviceId_deleteHard(userAppDeviceId) {
    logger.debug({ userAppDeviceId }, "Found userAppDeviceId..");

    // finally, delete the userAppDeviceId record
    await UserAppDeviceId.delete({ where: { id: userAppDeviceId.id } });

    logger.debug({ userAppDeviceId }, "userAppDeviceId Hard delete complete");

    return userAppDeviceId;
  }

  async function rawQuery(query) {
    const result = await _prisma.$queryRawUnsafe(query);
    return result;
  }

  return {
    userAppDeviceId_where,
    userAppDeviceId_findUnique,
    userAppDeviceId_insert,
    userAppDeviceId_normalize,
    userAppDeviceId_getList,
    userAppDeviceId_update,
    userAppDeviceId_deleteHard,
    rawQuery,
  };
};
