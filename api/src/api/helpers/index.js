module.exports = async (app) => {
  // const config = app.get("configuration");
  // const datastore = app.get("datastore");
  // const logger = app.get("logger");
  const globalHelpers = app.get("utilities");

  const errors = require("./error");
  const permHelpers = await require("./permissions")(app, {
    ...errors,
    ...globalHelpers,
  });
  const queryHelpers = await require("./query")(app, {
    ...errors,
    ...globalHelpers,
  });

  return {
    ...errors,
    ...permHelpers,
    ...queryHelpers,
    ...globalHelpers,

  };
};
