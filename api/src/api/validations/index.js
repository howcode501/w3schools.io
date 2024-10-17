const Yup = require('yup');
const constants = require('../../constants');

module.exports = async (app) => {
  const usersValidation = await require('./users')(app, constants, Yup);

  return {
    ...usersValidation,

  };
};
