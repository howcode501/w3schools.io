module.exports = async (models, config, logger) => {
  const { PromoCode } = models;

  // Define the data to be returned
  const promoCodeDetailedDataReturn = {
    products: {
      select: {
        id: true,
        product_name: true,
        product_status: true,
        product_description: true,
        product_learn_more: true,
        apps: true,
        features: true,
      },
    },
    apps: true,
    features: true,
    subscriptions: true,
    subscription_pricing_plan: true,
  };

  // Construct a query object for subscriptions lookups
  // TODO Come back and account for Hidden and Disabled subscription
  function promoCode_where({ id, code, status, search_string }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (code) {
      query.code = code;
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

  // Find a unique subscription_name based on query params,
  // but return very little information for security
  async function promoCode_validateCodeName(params) {
    const query = promoCode_where(params);

    // If they are searching by code name, let's add some wildcard features
    if (query.code) {
      const { code } = query;

      query.code = {
        equals: code,
        mode: "insensitive",
      };
    }
    logger.warn({ query }, "promoCode_validateCodeName");
    const promoCodeMany = PromoCode.findMany({
      where: query,
    });
    return promoCodeMany;
  }

  // Find a unique subscription based on query params
  async function promoCode_findUnique(params) {
    const query = promoCode_where(params);

    logger.warn({ query }, "promoCode_findUnique");

    const promoCodeFound = PromoCode.findUnique({
      where: { ...query },
      include: promoCodeDetailedDataReturn,
    });
    return promoCodeFound;
  }

  async function promoCode_upsert({
    id,
    code,
    description,
    expire_date_time,
    status,
    products = {},
    apps = {},
    features = {},
    subscriptions = {},
    subscription_pricing_plan = {},
    deleted = null,
  }) {
    if (!code) logger.debug({ code }, "Upsert code");
    let promoCode;
    if (id !== "" && id !== undefined) {
      promoCode = await promoCode_findUnique({ id });
    } else {
      promoCode = await promoCode_findUnique({ code });
    }

    if (promoCode === null) {
      logger.debug({ code }, "No such code, creating..");
      promoCode = await PromoCode.create({
        data: {
          code,
          description,
          expire_date_time,
          status,
          products: {
            connect: products,
          },
          apps: {
            connect: apps,
          },
          features: {
            connect: features,
          },
          subscriptions: {
            connect: subscriptions,
          },
          subscription_pricing_plan: {
            connect: subscription_pricing_plan,
          },
        },
        include: promoCodeDetailedDataReturn,
      });
    } else {
      // disconnect first and update
      await PromoCode.update({
        where: { id: promoCode.id },
        data: {
          products: {
            set: [],
          },
          apps: {
            set: [],
          },
          features: {
            set: [],
          },
          subscriptions: {
            set: [],
          },
          subscription_pricing_plan: {
            set: [],
          },
        },
        include: promoCodeDetailedDataReturn,
      });
      logger.debug({ code }, "code exists, updating..");
      promoCode = await PromoCode.update({
        where: { id: promoCode.id },
        data: {
          code,
          description,
          expire_date_time,
          status,
          products: {
            connect: products,
          },
          apps: {
            connect: apps,
          },
          features: {
            connect: features,
          },
          subscriptions: {
            connect: subscriptions,
          },
          subscription_pricing_plan: {
            connect: subscription_pricing_plan,
          },
        },
        include: promoCodeDetailedDataReturn,
      });
    }

    logger.debug({ promoCode }, "promoCode Upserted");
    return promoCode;
  }

  // Normalize promoCode into a structure for transport over REST
  async function promoCode_normalize(promoCode) {
    if (!promoCode) {
      return null;
    }

    logger.debug(promoCode, "promoCode Normalize Data In");

    return promoCode;
  }

  // Get list of promo codes
  async function promoCode_getList(params = {}) {
    const query = promoCode_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const promoCodeMany = PromoCode.findMany({
      where: query,
      orderBy: {
        code: "asc",
      },
      include: promoCodeDetailedDataReturn,
    });
    return promoCodeMany;
  }

  async function promoCode_update(id, params) {
    const promoCode = await PromoCode.update({
      where: { id },
      data: { ...params },
    });

    return promoCode;
  }

  async function promoCode_deleteHard(promoCode) {
    logger.debug({ promoCode }, "Found PromoCode..");

    // finally, delete the promoCode record
    await PromoCode.delete({ where: { id: promoCode.id } });

    logger.debug({ promoCode }, "PromoCode Hard delete complete");

    return promoCode;
  }

  return {
    promoCode_where,
    promoCode_validateCodeName,
    promoCode_findUnique,
    promoCode_upsert,
    promoCode_normalize,
    promoCode_getList,
    promoCode_update,
    promoCode_deleteHard,
  };
};
