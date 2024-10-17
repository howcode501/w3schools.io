module.exports = async (models, config, logger) => {
  const {
    App,
  } = models;

  // Define the data to be returned
  const appDetailedDataReturn = {
    attachments: true,
  };

  // Construct a query object for apps lookups
  // TODO Come back and account for Hidden and Disabled app
  function app_where({
    id,
    app_id,
    app_name,
    app_status,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (app_id) {
      query.app_id = app_id;
    }
    if (app_status) {
      query.app_status = app_status;
    }
    if (app_name) {
      query.app_name = app_name;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, 'Query Data');

    return query;
  }

  // Find a unique app_name based on query params,
  // but return very little information for security
  async function app_validateAppName(params) {
    const query = app_where(params);

    // If they are searching by app name, let's add some wildcard features
    if (query.app_name) {
      const { app_name } = query;

      query.app_name = {
        equals: app_name,
        mode: 'insensitive',
      };
    }
    logger.warn({ query }, 'app_validateAppName');
    const appMany = App.findMany({
      where: query,
    });
    return appMany;
  }

  // Find a unique app based on query params
  async function app_findUnique(params) {
    const query = app_where(params);

    logger.warn({ query }, 'app_findUnique');
    const AppFound = App.findUnique({
      where: { ...query },
      include: appDetailedDataReturn,
    });
    return AppFound;
  }

  // Get list of app
  async function app_getList(params = {}) {
    const query = app_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const appMany = App.findMany({
      where: query,
      orderBy: {
        app_name: 'asc',
      },
      include: appDetailedDataReturn,
    });
    return appMany;
  }

  return {
    app_where,
    app_validateAppName,
    app_findUnique,
    app_getList,
  };
};
