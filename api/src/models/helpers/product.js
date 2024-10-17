module.exports = async (models, config, logger, helpers) => {
  const { Product, App, Feature } = models;

  // Define the data to be returned
  const productDetailedDataReturn = {
    apps: {
      include: {
        attachments: {
          select: {
            file_name_org: true,
            file_name: true,
            public_url: true,
          },
        },
      },
    },
    features: {
      include: {
        attachments: {
          select: {
            file_name_org: true,
            file_name: true,
            public_url: true,
          },
        },
      },
    },
    attachments: true,
  };

  // Construct a query object for products lookups
  // TODO Come back and account for Hidden and Disabled product
  function product_where({
    id,
    product_id,
    product_name,
    product_status,
    search_string,
  }) {
    const query = {};
    if (id) {
      query.id = parseInt(id);
    }
    if (product_id) {
      query.product_id = product_id;
    }
    if (product_status) {
      query.product_status = product_status;
    }
    if (product_name) {
      query.product_name = product_name;
    }
    const trimmed_search_string = search_string?.trim();
    if (trimmed_search_string) {
      query.search_string = trimmed_search_string;
    }
    logger.debug({ query }, "Query Data");

    return query;
  }

  // Find a unique product_name based on query params,
  // but return very little information for security
  async function product_validateProductName(params) {
    const query = product_where(params);

    // If they are searching by product name, let's add some wildcard features
    if (query.product_name) {
      const { product_name } = query;

      query.product_name = {
        equals: product_name,
        mode: "insensitive",
      };
    }
    logger.warn({ query }, "product_validateProductName");
    const productMany = Product.findMany({
      where: query,
    });
    return productMany;
  }

  // Find a unique product based on query params
  async function product_findUnique(params) {
    const query = product_where(params);

    logger.warn({ query }, "product_findUnique");
    const productFound = Product.findUnique({
      where: { ...query },
      include: productDetailedDataReturn,
    });
    return productFound;
  }

  async function product_upsert({
    id,
    product_name,
    product_id,
    product_description,
    product_learn_more,
    product_icon_id,
    product_status,
    apps = {},
    features = {},
    deleted = null,
  }) {
    if (!product_name) logger.debug({ product_name }, "Upsert product");
    let product;
    if (id !== "" && id !== undefined) {
      product = await product_findUnique({ id });
    } else {
      product = await product_findUnique({ product_name });
    }

    // reform apps and features array
    const app_create = [];
    const app_update = [];
    const feature_create = [];
    const feature_update = [];
    apps.map((app) => {
      if (app?.id == "") {
        delete app.id;
        const appIconId = app.app_icon_id;
        delete app.app_icon_id;
        delete app?.attachments;
        delete app?.attachment;
        if (appIconId !== "" && appIconId !== undefined) {
          const newApp = {
            ...app,
            attachments: { connect: { id: appIconId } },
          };
          app_create.push(newApp);
        } else {
          app_create.push(app);
        }
      } else {
        const updateId = app.id;
        delete app.product_id;
        delete app.id;
        const appIconId = app.app_icon_id;
        delete app.app_icon_id;
        delete app?.attachments;
        delete app?.attachment;

        const dt = {
          where: { id: updateId },
          data: {
            ...app,
          },
        };
        if (appIconId !== "" && appIconId !== null && appIconId !== undefined) {
          dt.data.attachments = { connect: { id: appIconId } };
        }
        app_update.push(dt);
      }
    });
    features.map((feature) => {
      if (feature?.id == "") {
        delete feature.id;
        const featureIconId = feature.feature_icon_id;
        delete feature.feature_icon_id;
        delete feature?.attachments;
        delete feature?.attachment;
        if (featureIconId !== "" && featureIconId !== undefined) {
          const newFeature = {
            ...feature,
            attachments: { connect: { id: featureIconId } },
          };
          feature_create.push(newFeature);
        } else {
          feature_create.push(feature);
        }
      } else {
        const updateId = feature.id;
        delete feature.id;
        delete feature.product_id;
        const featureIconId = feature.feature_icon_id;
        delete feature.feature_icon_id;
        delete feature?.attachments;
        delete feature?.attachment;
        const dt = {
          where: { id: updateId },
          data: {
            ...feature,
          },
        };
        if (
          featureIconId !== "" &&
          featureIconId !== null &&
          featureIconId !== undefined
        ) {
          dt.data.attachments = { connect: { id: featureIconId } };
        }
        feature_update.push(dt);
      }
    });
    if (product === null) {
      logger.debug({ product_name }, "No such product, creating..");
      product = await Product.create({
        data: {
          product_name,
          product_id,
          product_description,
          product_learn_more,
          product_icon_id,
          product_status,
          apps: {
            create: app_create,
          },
          features: {
            create: feature_create,
          },
        },
        include: productDetailedDataReturn,
      });
    } else {
      logger.debug({ product_name }, "Product exists, updating..");
      product = await Product.update({
        where: { id: product.id },
        data: {
          product_name,
          product_id,
          product_description,
          product_learn_more,
          product_icon_id,
          product_status,
          deleted,
          apps: {
            create: app_create,
            update: app_update,
          },
          features: {
            create: feature_create,
            update: feature_update,
          },
        },
        include: productDetailedDataReturn,
      });
    }

    logger.debug({ product }, "Product Upserted");
    return product;
  }

  // Normalize product into a structure for transport over REST
  async function product_normalize(product) {
    if (!product) {
      return null;
    }

    logger.debug(product, "Product Normalize Data In");

    const {
      id,
      product_id,
      product_name,
      product_description,
      product_learn_more,
      product_status,
    } = product;

    const { apps, features, attachments } = product;

    return {
      id,
      product_id,
      product_name,
      product_description,
      product_learn_more,
      product_status,
      apps,
      features,
      attachments,
    };
  }

  // Product update
  async function product_update(id, params) {
    const product = await Product.update({
      where: { id },
      data: { ...params },
    });

    return product;
  }

  // Get list of product
  async function product_getList(params = {}) {
    const query = product_where(params);

    if (params.deleted === 1) {
      // Process to included deleted
    } else {
      // Don't inlcuded deleted
      query.deleted = null;
    }

    const productMany = Product.findMany({
      where: query,
      orderBy: {
        product_order: "asc",
      },
      include: productDetailedDataReturn,
    });
    return productMany;
  }

  async function product_deleteHard(product) {
    logger.debug({ product }, "Found product..");

    // delete product attachment
    if (product?.attachments) {
      // delete it from s3
      const path = product?.attachments?.public_url.replace(
        `${config.amazon.s3_bucket_base_url}/`,
        ""
      );
      await helpers.amazon_deleteImage(path);
      // delete if from our db
      await helpers.attachment_delete(product?.attachments?.id);
    }

    if (product?.apps) {
      // delete all apps attachment
      await Promise.all(
        product?.apps.map(async (app) => {
          if (app?.attachments) {
            try {
              const path = app?.attachments?.public_url.replace(
                `${config.amazon.s3_bucket_base_url}/`,
                ""
              );
              await helpers.amazon_deleteImage(path);
              // delete if from our db
              await helpers.attachment_delete(app?.attachments?.id);
            } catch (err) {
              logger.info({ err }, "delete app attachment product delete..");
            }
          }
        })
      );
      // finally delete apps
      await App.deleteMany({
        where: { product_id: product.id },
      });
    }

    if (product?.features) {
      // delete all features attachment
      await Promise.all(
        product?.features.map(async (feature) => {
          if (feature?.attachments) {
            try {
              const path = feature?.attachments?.public_url.replace(
                `${config.amazon.s3_bucket_base_url}/`,
                ""
              );
              await helpers.amazon_deleteImage(path);
              // delete if from our db
              await helpers.attachment_delete(feature?.attachments?.id);
            } catch (err) {
              logger.info(
                { err },
                "delete feature attachment product delete.."
              );
            }
          }
        })
      );
      // finally delete features
      await Feature.deleteMany({
        where: { product_id: product.id },
      });
    }

    // finally, delete the product record
    await Product.delete({ where: { id: product.id } });

    logger.debug({ product }, "Product Hard delete complete");

    return product;
  }

  return {
    product_where,
    product_validateProductName,
    product_findUnique,
    product_upsert,
    product_normalize,
    product_getList,
    product_deleteHard,
    product_update,
  };
};
