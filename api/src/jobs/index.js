module.exports = async (app, config, logger) => {
  const stripeCron = await require("./stripe")(app, config, logger);

  return {
    ...stripeCron,
  };
};
