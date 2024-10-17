// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
//const { withSentryConfig } = require('@sentry/nextjs');

// api
const API_ROOT = process.env.NEXT_PUBLIC_API_URL || '';
const API_ENDPOINT = `${API_ROOT}/api`;
const AUTH_ENDPOINT = `${API_ROOT}/auth`;
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/';

// loglevel
const LOGLEVEL = process.env.NEXT_PUBLIC_LOGLEVEL || 'info';

// sentry.io
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || null;

// google recaptcha
const GOOGLE_RECAPTCHA = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA || null;

const TINY_MCE_API_KEY = process.env.NEXT_PUBLIC_TINY_MCE_API_KEY || null;

const configs = {
  API_ROOT,
  API_ENDPOINT,
  AUTH_ENDPOINT,
  LOGLEVEL,
  SENTRY_DSN,
  GOOGLE_RECAPTCHA,
  APP_BASE_URL,
  TINY_MCE_API_KEY
};

/*
 const SentryWebpackPluginOptions = {
 // Additional config options for the Sentry Webpack plugin. Keep in mind that
 // the following options are set automatically, and overriding them is not
 // recommended:
 //   release, url, org, project, authToken, configFile, stripPrefix,
 //   urlPrefix, include, ignore

 //silent: true, // Suppresses all logs
 // For all available options, see:
 // https://github.com/getsentry/sentry-webpack-plugin#options.
 }

 // Make sure adding Sentry options is the last code to run before exporting, to
 // ensure that your source maps include changes from all other Webpack plugins
 //module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions);
 */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'false'
});

/*module.exports = withBundleAnalyzer({
 serverRuntimeConfig : {
 ...configs
 },
 publicRuntimeConfig : {
 ...configs
 }
 })*/

module.exports = {
  generateBuildId: async () => {
    return process.env.NEXT_PUBLIC_GIT_COMMIT_SHA || 'development';
  },
  serverRuntimeConfig: {
    ...configs
  },
  publicRuntimeConfig: {
    ...configs
  }
};
const withYAML = require('next-yaml');
module.exports = withYAML(module.exports);
