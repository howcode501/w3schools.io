module.exports = async (models, config, logger) => {
  const {
    Feature,
  } = models;

  // Define the data to be returned
  const featureDetailedDataReturn = {
    attachments: true,
  };

  // Construct a query object for features lookups
  // TODO Come back and account for Hidden and Disabled feature
  function feature_where({
    id,
    feature_id,
    feature_name,
    feature_status,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (feature_id) {
      query.feature_id = feature_id;
    }
    if (feature_status) {
      query.feature_status = feature_status;
    }
    if (feature_name) {
      query.feature_name = feature_name;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, 'Query Data');

    return query;
  }

  // Find a unique feature_name based on query params,
  // but return very little information for security
  async function feature_validateFeatureName(params) {
    const query = feature_where(params);

    // If they are searching by feature name, let's add some wildcard features
    if (query.feature_name) {
      const { feature_name } = query;

      query.feature_name = {
        equals: feature_name,
        mode: 'insensitive',
      };
    }
    logger.warn({ query }, 'feature_validateFeatureName');
    const featureMany = Feature.findMany({
      where: query,
    });
    return featureMany;
  }

  // Find a unique feature based on query params
  async function feature_findUnique(params) {
    const query = feature_where(params);

    logger.warn({ query }, 'feature_findUnique');
    const featureFound = Feature.findUnique({
      where: { ...query },
      include: featureDetailedDataReturn,
    });
    return featureFound;
  }

  // Get list of feature
  async function feature_getList(params = {}) {
    const query = feature_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const featureMany = Feature.findMany({
      where: query,
      orderBy: {
        feature_name: 'asc',
      },
      include: featureDetailedDataReturn,
    });
    return featureMany;
  }

  return {
    feature_where,
    feature_validateFeatureName,
    feature_findUnique,
    feature_getList,
  };
};
