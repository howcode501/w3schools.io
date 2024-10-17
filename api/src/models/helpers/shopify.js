module.exports = async (models, config, logger) => {
  const { Shopify } = models;

  // Construct a query object for shopify lookups
  function shopify_where({ id, order_id, order_name, email, search_string }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (order_id) {
      query.order_id = order_id.toString();
    }
    if (order_name) {
      query.order_name = order_name;
    }
    if (email) {
      query.email = email;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique shopify order based on query params
  async function shopify_findUnique(params) {
    const query = shopify_where(params);

    logger.warn({ query }, "shopify_findUnique");

    const shopifyFound = Shopify.findUnique({
      where: { ...query },
    });
    return shopifyFound;
  }

  // Normalize shopify into a structure for transport over REST
  async function shopify_normalize(shopify) {
    if (!shopify) {
      return null;
    }

    logger.debug(shopify, "shopify Normalize Data In");

    return shopify;
  }

  // Get list of shopify
  async function shopify_getList(params = {}) {
    const query = shopify_where(params);

    const shopifyMany = Shopify.findMany({
      where: query,
      orderBy: {
        order_id: "asc",
      },
    });
    return shopifyMany;
  }

  async function shopify_insert(params) {
    const shopify = await Shopify.create({
      data: { ...params },
    });
    return shopify;
  }

  async function shopify_update(id, params) {
    await Shopify.update({
      where: { id: id },
      data: { ...params },
    });
    return await shopify_getList();
  }

  return {
    shopify_where,
    shopify_findUnique,
    shopify_normalize,
    shopify_getList,
    shopify_insert,
    shopify_update,
  };
};
