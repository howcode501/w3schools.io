const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  // const config = app.get('configuration');

  const { onlyAdministrator, sortslice } = helpers;

  const {
    product_validateProductName,
    product_upsert,
    product_normalize,
    product_getList,
    product_findUnique,
    product_where,
    auditLog_insert,
    product_deleteHard,
    UserProductAppFeature_getList,
  } = app.get("datastore");

  function parse_body(body) {
    const data = {};
    if (body?.product_name) {
      data.product_name = body.product_name;
    }
    if (body?.product_id) {
      data.product_id = body.product_id;
    }
    if (body?.product_description) {
      data.product_description = body.product_description;
    }
    if (body?.product_learn_more) {
      data.product_learn_more = body.product_learn_more;
    }
    if (body?.product_status === true || body?.product_status === false) {
      data.product_status = body.product_status;
    }

    if (body?.product_icon_id) {
      data.product_icon_id = body?.product_icon_id;
    }
    if (body?.apps) {
      data.apps = body.apps;
    }
    if (body?.features) {
      data.features = body.features;
    }
    if (body?.search_string) {
      data.search_string = body.search_string;
    }

    return data;
  }

  // Endpoints
  // Validate product name for new product
  router.post(
    "/product-validate",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.debug("GET /api/products/product-validate");

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, "Parsed Body");
      const product = await product_validateProductName(q);
      req.logger.debug({ product }, "Product's returned");

      if (product.length > 0) {
        res.json({ data: { exists: true } });
      } else {
        res.json({ data: { exists: false } });
      }
    })
  );

  // LIST
  router.get(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/products");
      const params = {};
      const products = await product_getList(params);

      const total = products.length;
      const filtered = sortslice(products, req.query);

      const sorted = filtered.sort((a) =>
        a.product_name === "Book Test Library" ? -1 : 1
      );

      res.set("X-Total-Count", total);
      res.json({ data: sorted });
    })
  );

  // READ
  router.get(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("GET /api/products/:id");

      const query = await product_where(req.params);
      const product_record = await product_findUnique(query);
      const product = await product_normalize(product_record);

      req.logger.debug(
        { product_record, product },
        "Grab Product's Information for Edit"
      );

      if (product) {
        res.json({ data: { product } });
      } else {
        res.status(400).json({ error: "no such product" });
      }
    })
  );

  // CREATE
  router.put(
    "/",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("PUT /api/products");

      // First we parse the incoming Data
      const data = parse_body(req.body.data);
      req.logger.info("product data", req.body.data);

      // Now we create the record
      const rec = await product_upsert(data);

      // If there are no issues, then we move forward
      if (!rec.error) {
        // AuditLog new product created
        auditLog_insert(
          { admin_user: req.user, data: { productName: rec.name } },
          "product-created"
        );
        const productReturn = await product_normalize(rec);
        if (productReturn) {
          return res.json({ data: { productReturn } });
        }
      }

      // AuditLog if product create error
      auditLog_insert(
        {
          admin_user: req.user,
          data: { productName: rec.name, error: "unable to create" },
        },
        "product-create-error"
      );
      return res.status(400).json({ error: "unable to create" });
    })
  );

  // UPDATE
  router.post(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/products/:id");

      const data = parse_body(req.body.data);

      data.id = req.params.id;
      req.logger.debug({ data }, "Parsed Data for Product");

      const rec = await product_upsert(data);

      const product = await product_normalize(rec);
      if (product) {
        // AuditLog product updated
        auditLog_insert(
          { admin_user: req.user, data: { productName: rec.name } },
          "product-updated"
        );
        res.json({ data: { product } });
      } else {
        // AuditLog product updated error
        auditLog_insert(
          {
            admin_user: req.user,
            data: { productName: rec.name, error: "unable to update" },
          },
          "user-product-error"
        );
        res.status(400).json({ error: "unable to update" });
      }
    })
  );

  // DELETE
  router.delete(
    "/:id",
    onlyAdministrator,
    asyncHandler(async (req, res) => {
      req.logger.info("DELETE /api/products/:id");

      // check if user has products : apps, features
      const checkUserProductsAppsFeatures = await UserProductAppFeature_getList(
        {
          product_id: req.params.id,
        }
      );
      if (checkUserProductsAppsFeatures.length > 0) {
        res.status(400).json({
          error: "Unable to delete product as it in use by user.",
        });
      }
      const query = product_where(req.params);
      const product_record = await product_findUnique(query);
      const recs = await product_normalize(product_record);
      const rec = await product_deleteHard(recs);

      // AuditLog delete product
      auditLog_insert(
        { admin_user: req.user, data: { rec } },
        "product-deleted"
      );

      res.json({ data: { rec } });
    })
  );
  return router;
};
