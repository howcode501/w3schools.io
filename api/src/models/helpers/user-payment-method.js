module.exports = async (models, config, logger) => {
  const { UserPaymentMethod } = models;

  // Construct a query object for subscriptions lookups
  // TODO Come back and account for Hidden and Disabled subscription
  function userPaymentMethod_where({
    id,
    user_id,
    payment_id,
    is_default,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (user_id) {
      query.user_id = user_id;
    }
    if (payment_id) {
      query.payment_id = payment_id;
    }
    if (is_default === true || is_default === false) {
      query.is_default = is_default;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique userPaymentMethod based on query params
  async function userPaymentMethod_findUnique(params) {
    const query = userPaymentMethod_where(params);

    logger.warn({ query }, "userPaymentMethod_findUnique");

    const paymentMethodFound = UserPaymentMethod.findUnique({
      where: { ...query },
    });
    return paymentMethodFound;
  }

  // Normalize userPaymentMethod into a structure for transport over REST
  async function userPaymentMethod_normalize(userPaymentMethod) {
    if (!userPaymentMethod) {
      return null;
    }

    logger.debug(userPaymentMethod, "userPaymentMethod Normalize Data In");

    return userPaymentMethod;
  }

  // Get list of system config
  async function userPaymentMethod_getList(params = {}) {
    const query = userPaymentMethod_where(params);

    const userPaymentMethod = UserPaymentMethod.findMany({
      where: query,
      orderBy: {
        user_id: "asc",
      },
    });
    return userPaymentMethod;
  }

  async function userPaymentMethod_createMany(params) {
    await UserPaymentMethod.createMany({
      data: { ...params },
    });
    return await userPaymentMethod_getList();
  }

  async function userPaymentMethod_updateMany(id, params) {
    await UserPaymentMethod.updateMany({
      where: { user_id: id },
      data: { ...params },
    });
    return await userPaymentMethod_getList();
  }

  async function userPaymentMethod_upsert(params) {
    const { payment_id } = params;
    let paymentMethod = await userPaymentMethod_findUnique({ payment_id });

    logger.debug({ paymentMethod }, "paymentMethod");

    if (paymentMethod === null) {
      logger.debug({ paymentMethod }, "No such paymentMethod, creating..");

      paymentMethod = await UserPaymentMethod.create({
        data: {
          ...params,
        },
      });
    } else {
      logger.debug({ paymentMethod }, "paymentMethod exists, updating..");
      paymentMethod = await UserPaymentMethod.update({
        where: { id: paymentMethod.id },
        data: {
          ...params,
        },
      });
    }

    logger.debug({ paymentMethod }, "paymentMethod Upserted");
    return paymentMethod;
  }

  async function userPaymentMethod_delete(params) {
    await UserPaymentMethod.delete({
      where: { ...params },
    });
    return true;
  }

  return {
    userPaymentMethod_where,
    userPaymentMethod_findUnique,
    userPaymentMethod_normalize,
    userPaymentMethod_getList,
    userPaymentMethod_createMany,
    userPaymentMethod_updateMany,
    userPaymentMethod_upsert,
    userPaymentMethod_delete,
  };
};
