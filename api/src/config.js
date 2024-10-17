require("dotenv").config();
const fs = require("fs");

// const randomSecret = require('crypto').randomBytes(12).toString('hex');
const randomSecret = require("crypto").randomBytes(18).toString("hex");
const packageJson = require("../package.json");

// General Configuration
const APPNAME = packageJson.name || "app";
const ENVPREFIX = packageJson.env_prefix || APPNAME;

function envCase(s) {
  const strArr = s.split(/[_-]/);
  const snakeArr = strArr.reduce(
    (acc, val) => acc.concat(val.toLowerCase()),
    []
  );
  return snakeArr.join("_").toUpperCase();
}

function getEnv(v) {
  const basename = envCase(v);
  const fullname = envCase(`${ENVPREFIX}_${v}`);
  const genname = envCase(`ULS_${v}`);
  const value =
    process.env[fullname] ||
    process.env[genname] ||
    process.env[basename] ||
    null;
  return value;
}

// Service Generic
const config = {
  appName: APPNAME,
  port: parseInt(getEnv("HTTP_LISTEN_PORT") || "5000", 10),
  is_production: process.env.NODE_ENV === "production",
  is_test: process.env.NODE_ENV === "test",
};

// Logging
config.loglevel = (getEnv("LOGLEVEL") || "info").toLowerCase();
// config.requestLoglevel = (getEnv('REQUEST_LOGLEVEL') || 'debug').toLowerCase();

// Superadmin / development-mode
config.superadmin_password = getEnv("SUPERADMIN_PASSWORD") || null;

// Database Configuration
let database = {};
const database_type = "POSTGRES";
const dbEnv = (n) => getEnv(`${database_type}_${n}`);
if (dbEnv("URI")) {
  database.uri = dbEnv("URI");

  const p = new URL(database.uri);
  database.host = dbEnv("HOSTNAME") || p.hostname;
  database.port = parseInt(dbEnv("PORT"), 10) || p.port;
  database.username = dbEnv("USERNAME") || p.username;
  database.password = dbEnv("PASSWORD") || p.password;
  database.options = p.search;
  if (database_type === "MYSQL") {
    database.database = dbEnv("DATABASE") || p.pathname.slice(1);
    database.schema = dbEnv("DATABASE") || p.pathname.slice(1);
    // TODO - reassemble the URI from parts (ie. URL encode username/password)
  }
  if (database_type === "POSTGRES") {
    database.database = dbEnv("DATABASE") || p.pathname.slice(1);
    database.schema = dbEnv("SCHEMA") || p.searchParams.get("schema");
    // TODO - reassemble the URI from parts (ie. URL encode username/password)
  }
} else {
  // eslint-disable-next-line no-console
  console.log("WARN - no database configuration specified");
  database = null;
}
config.database = database;

// Redis configuration
let redis = {};
const redisEnv = (n) => getEnv(`REDIS_${n}`);
if (getEnv("REDIS_URI")) {
  redis.uri = getEnv("REDIS_URI");
  // TODO -- assemble uri from component envvars
  const p = new URL(redis.uri);
  redis.host = redisEnv("HOSTNAME") || p.hostname;
  redis.port = parseInt(redisEnv("PORT"), 10) || p.port;
  redis.username = redisEnv("USERNAME") || p.username;
  redis.password = decodeURIComponent(redisEnv("PASSWORD") || p.password);
  redis.options = p.search;
  redis.database = redisEnv("DATABASE") || p.pathname.slice(1);
} else {
  // eslint-disable-next-line no-console
  console.log("WARN - no redis configuration specified");
  redis = null;
}
config.redis = redis;

// Secrets
config.session_secret = getEnv("SESSION_SECRET") || randomSecret;
config.session_store = true;

config.jwt_secret = getEnv("JWT_SECRET") || config.session_secret;
config.cookie_secret = getEnv("COOKIE_SECRET") || config.session_secret;
config.hyperstream_secret = getEnv("HYPERSTREAM_SECRET") || null;

config.encryption_secret = getEnv("ENCRYPTION_SECRET") || null;
config.previous_encryption_secret =
  getEnv("PREVIOUS_ENCRYPTION_SECRET") || null;

// RefreshToken
config.jwt_token_expiration = parseInt(
  getEnv("JWT_TOKEN_EXPIRES") || "300",
  10
);
// OneTimeToken
config.jwt_onetime_token_expiration = parseInt(
  getEnv("JWT_ONETIME_TOKEN_EXPIRES") || "86400",
  10
);
config.jwt_issuer = "thoughtcastowners.com";
config.refreshToken_name = `${config.appName}-refresh-token`.toLowerCase();
config.refreshToken_remember_expiration = parseInt(
  getEnv("REMEMBER_ME_EXPIRES") || "2592000",
  10
);
config.refreshToken_expiration = parseInt(
  getEnv("REFRESH_TOKEN_EXPIRES") || "86400",
  10
);
// Frontend IP
config.frontend_ip = "http://localhost:3000";
// SSO
config.base_uri = getEnv("BASEURI") || null;
config.fqdn = getEnv("ULS_FQDN_SERVER");

if (config.base_uri) {
  const b = new URL(config.base_uri);
  config.fqdn = b.hostname;
}

// Email
config.email = {};
config.email.reply_address =
  getEnv("EMAIL_REPLY_ADDRESS") || "support@thoughtcastmagic.com";
config.email.provider = getEnv("EMAIL_PROVIDER") || "nodemailer";
switch (config.email.provider) {
  case "sendgrid":
    config.email.sendgrid_apikey = getEnv("SENDGRID_APIKEY") || null;
    break;
  case "ses":
    config.email.ses_region = getEnv("SES_REGION") || "us-east";
    config.email.ses_access_key = getEnv("SES_ACCESS_KEY") || null;
    config.email.ses_secret_key = getEnv("SES_SECRET_KEY") || null;
    break;
  case "nodemailer":
    config.email.nodemailer_from = getEnv("NODEMAILER_FROM") || null;
    config.email.nodemailer_host = getEnv("NODEMAILER_HOST") || null;
    config.email.nodemailer_user = getEnv("NODEMAILER_USER") || null;
    config.email.nodemailer_password = getEnv("NODEMAILER_PASSWORD") || null;
    config.email.nodemailer_port = parseInt(
      getEnv("NODEMAILER_PORT") || 587,
      10
    );
    config.email.nodemailer_secure = parseInt(
      getEnv("NODEMAILER_SECURE") || false,
      10
    );
    break;
  default:
    break;
}

// Google Recaptcha
config.google_recaptcha = getEnv("GOOGLE_RECAPTCHA") || null;

// gets customer code
config.customerCode = getEnv("CUSTOMER_CODE") || "";

// Compute organization/tenant_id
config.organization = getEnv("TENANT_ID") || config.fqdn || null;

// Frontend Base URL
config.frontend_url = getEnv("FRONTEND_URL") || null;

// Tenant's AD OU
config.organization_ou = getEnv("ORG_OU") || null;

config.upload_dir = getEnv("UPLOAD_DIR") || "../app/public/uploads/";
config.upload_replace_dir = getEnv("UPLOAD_DIR_REPLACE") || "uploads/";

config.stripe = {
  stripe_mode: "",
  stripe_live_publishable_key: "",
  stripe_live_secret_key: "",
  stripe_test_publishable_key: "",
  stripe_test_secret_key: "",
};

// Amazon s3
config.amazon = {};
config.amazon.access_key_id = getEnv("AWS_ACCESS_KEY_ID") || null;
config.amazon.secret_access_key = getEnv("AWS_SECRET_ACCESS_KEY") || null;
config.amazon.s3_region = getEnv("S3_REGION") || null;
config.amazon.s3_bucket = getEnv("S3_BUCKET") || null;
config.amazon.s3_bucket_mode = getEnv("S3_BUCKET_MODE") || "development";
config.amazon.s3_bucket_base_url =
  "https://thoughtcastowners.s3.us-east-2.amazonaws.com";

(config.amazon.s3_expireTime = getEnv("S3_EXPIRE_TIME") || 6000),
  (config.amazon.s3_contentLengthMin = getEnv("S3_CONTENT_LENGTH_MIN") || 10),
  (config.amazon.s3_contentLengthMax =
    getEnv("S3_CONTENT_LENGTH_MAX") || 5000000),
  (module.exports = config);
