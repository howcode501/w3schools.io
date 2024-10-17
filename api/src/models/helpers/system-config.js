module.exports = async (models, config, logger) => {
  const { SystemConfig } = models;

  // Construct a query object for subscriptions lookups
  // TODO Come back and account for Hidden and Disabled subscription
  function systemConfig_where({ id, name, value, field_type, search_string }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (name) {
      query.name = name;
    }
    if (value) {
      query.value = value;
    }
    if (field_type) {
      query.field_type = field_type;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique system config based on query params
  async function systemConfig_findUnique(params) {
    const query = systemConfig_where(params);

    logger.warn({ query }, "systemConfig_findUnique");

    const systemConfigFound = SystemConfig.findUnique({
      where: { ...query },
    });
    return systemConfigFound;
  }

  // Normalize SystemConfig into a structure for transport over REST
  async function systemConfig_normalize(systemConfig) {
    if (!systemConfig) {
      return null;
    }

    logger.debug(systemConfig, "systemConfig Normalize Data In");

    return systemConfig;
  }

  // Get list of system config
  async function systemConfig_getList(params = {}) {
    const query = systemConfig_where(params);

    const systemConfigMany = SystemConfig.findMany({
      where: query,
      orderBy: {
        name: "asc",
      },
    });
    return systemConfigMany;
  }

  async function systemConfig_update(params) {
    params.forEach(async (row) => {
      await SystemConfig.update({
        where: { id: row?.id },
        data: { value: row?.value },
      });
    });
    return await systemConfig_getList();
  }

  return {
    systemConfig_where,
    systemConfig_findUnique,
    systemConfig_normalize,
    systemConfig_getList,
    systemConfig_update,
  };
};
