const asyncHandler = require("express-async-handler");
const { compose } = require("compose-middleware");

// eslint-disable-next-line no-unused-vars
module.exports = async (app, _passport, _helpers) => {
  const logger = app.get("logger");
  const { systemConfig_getList } = app.get("datastore");
  const tenantInfoHandler = compose([
    asyncHandler(async (req, res) => {
      logger.warn({ req }, "TenantInfo Logger");

      // get tenant basic info from system config, send param default false to user
      const result = await systemConfig_getList();

      // extract the info needed on frontend
      let instanceLogo;
      let instanceName;
      result.forEach((element) => {
        if (element.name === "Site_Title") {
          instanceName = element.selected_value;
        } else if (element.name === "logo") {
          instanceLogo = element.selected_value;
        }
      });
      const response = { tenantInfo: { instanceLogo, instanceName } };
      return res.status(200).json({ data: response });
    }),
  ]);

  const tenantInstanceNameHandler = compose([
    asyncHandler(async (req, res) => {
      logger.warn("GET /tenantinfo/instancename");

      // extract the tenant instance name needed on frontend
      const systemConfig = await systemConfig_getList();
      let instanceName = "ThoughtCast Owners Portal";
      systemConfig.forEach((element) => {
        if (element.name === "Site_Title") {
          instanceName = element.value;
        }
      });
      return res.status(200).json({ instanceName });
    }),
  ]);

  return { tenantInfoHandler, tenantInstanceNameHandler };
};
