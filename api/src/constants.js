// Previous regex: /^[a-zA-Z0-9 !@#$%^&*)(+=._-]+$/gu
const EMOJIS_REGEX = /^[\w \r\n]+(?:['";:!@#$%^&*)(+=.,_-]([\w \r\n]+)|([\.\?\)\]\}]{1}))*$/gu;
const EMAIL_REGEX = /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/gu;

module.exports = {
  EMOJIS_REGEX,
  EMAIL_REGEX,
};
