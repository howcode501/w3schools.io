import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

// extract
const API_ROOT = publicRuntimeConfig.API_ROOT;
const API_ENDPOINT = publicRuntimeConfig.API_ENDPOINT;
const AUTH_ENDPOINT = publicRuntimeConfig.AUTH_ENDPOINT;
const LOGLEVEL = publicRuntimeConfig.LOGLEVEL;
const SENTRY_DSN = publicRuntimeConfig.SENTRY_DSN;
const GOOGLE_RECAPTCHA = publicRuntimeConfig.GOOGLE_RECAPTCHA;
const APP_BASE_URL = publicRuntimeConfig.APP_BASE_URL;
const TINY_MCE_API_KEY = publicRuntimeConfig.TINY_MCE_API_KEY;

// Server Side
const IS_SERVER_SIDE = typeof window === 'undefined' ? true : false;

export {
  API_ROOT,
  API_ENDPOINT,
  AUTH_ENDPOINT,
  LOGLEVEL,
  SENTRY_DSN,
  GOOGLE_RECAPTCHA,
  IS_SERVER_SIDE,
  APP_BASE_URL,
  TINY_MCE_API_KEY
};
