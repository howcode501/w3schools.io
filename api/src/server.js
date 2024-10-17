const express = require("express");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const useragent = require("express-useragent");
const session = require("express-session");
const cron = require("node-cron");
const fileUpload = require("express-fileupload");
const Ctx = require("./ctx");
const Auth = require("./auth");
const Api = require("./api");
const App = require("./app");
const Open = require("./open");
const SessionStats = require("./sessions");
const UserStats = require("./userstats");
const TenantInfo = require("./tenantinfo");
const Webhooks = require("./webhooks");
const mailchimp = require("./mailChimp");
// new crons
const jobs = require("./jobs");

module.exports = async () => {
  // Initialize singletons
  const {
    config,
    logger,
    middlewareLogger,
    utilities,
    controllers,
    datastore,
    notify,
  } = await Ctx();

  logger.debug({ config }, "Configuration");

  // Initialize server
  const app = express();
  const http = require("http").createServer(app);

  app.set("trust proxy", 1);

  app.set("configuration", config);
  app.set("datastore", datastore);
  app.set("notify", notify);
  app.set("logger", logger);
  app.set("controllers", controllers);
  app.set("utilities", {
    ...utilities,
  });
  app.set("mailchimp", mailchimp);
  app.set("utilities", { ...utilities });

  const { passport, accessTokenMiddleware, authRouter } = await Auth(
    app,
    utilities
    //    io,
  );
  const { apiRouter } = await Api(app, utilities);
  const { appRouter } = await App(app, utilities);
  const { openRouter } = await Open(app, utilities);
  const { sessionLoggingRouter } = await SessionStats(app, utilities);
  const { userstatsLoggingRouter } = await UserStats(app, utilities);
  const { tenantInfoRouter } = await TenantInfo(app, utilities);
  const { webhookRouter } = await Webhooks(app);

  // ------ Middleware ------

  // TODO -- review CORS requirements
  const corsOptions = {
    // To allow requests from client
    origin: [
      "http://dev.local:3000",
      "http://dev.local",
      "http://localhost:3000",
      "http://127.0.0.1",
      "http://localhost",
      "*",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  };

  // CORS
  app.use(cors(corsOptions));

  // stripe web hook
  app.use("/api/webhooks", webhookRouter);

  app.use((req, res, next) => {
    res.set("Access-Control-Expose-Headers", "X-Total-Count");
    res.header("Content-Type", "application/json");
    // intercept OPTIONS method
    if (req.method === "OPTIONS") {
      res.send(200);
    } else {
      next();
    }
  });

  // Parse Useragent
  app.use(useragent.express());

  // Enable Request/Response Logging
  app.use(middlewareLogger({ logger }));

  // Request Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(config.cookie_secret));

  // Initialize Session tracking
  const sessionMiddleware = session({
    secret: config.cookie_secret,
    cookie: { secure: config.is_production },
    resave: false,
    saveUninitialized: false,
    store: datastore?.session_store,
  });

  app.use(sessionMiddleware);

  // ------ Routes ------
  app.use(passport.initialize());
  app.use(passport.session());

  // File upload
  app.use(fileUpload());
  // Auth Routes
  app.use("/auth", authRouter);
  // Auth Routes
  app.use("/open", openRouter);
  // API Key Routes
  app.use("/api/app", appRouter);
  // API Routes
  app.use("/api", accessTokenMiddleware, apiRouter);
  // Session Logging Routes
  app.use("/sessions", sessionLoggingRouter);
  // UserStats Logging Routes
  app.use("/userstats", userstatsLoggingRouter);

  // Basic tenant Info
  app.use("/tenantinfo", tenantInfoRouter);

  // Cron jobs
  // include jobs
  const {
    cronStripe_UpdateIfSubscriptionCanceled,
    cronStripe_sendRenewalMail5Days,
    cronStripe_sendRenewalMail5Days_PaymentMethodNotSet,
  } = await jobs(app, config, logger);

  // every day at 01:00
  cron.schedule("0 1 * * *", () => {
    try {
      cronStripe_sendRenewalMail5Days();
      cronStripe_sendRenewalMail5Days_PaymentMethodNotSet();
    } catch (error) {
      logger.error(error.message);
    }
  });

  // every hour
  cron.schedule("0 * * * *", () => {
    try {
      cronStripe_UpdateIfSubscriptionCanceled();
    } catch (error) {
      logger.error(error.message);
    }
  });

  // generate a 404 error for unrecognized route
  app.use((_req, _res, next) => {
    next(createError(404));
  });

  // ------ Error Handling ------
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    // report errors in development-mode
    // res.locals.message = err.message;
    // res.locals.error = req.app.get("env") == "development" ? err : {};

    // response
    const { path, method } = req;
    const status = err.status || 500;
    const code = err.code || "general_error";
    const message = err.message || "General Error";
    const user = req.user || "-no-identity-";

    if (err.status < 500) {
      logger.warn(
        {
          method,
          path,
          status,
          code,
          user,
        },
        message
      );
      res.status(status).json({ message });
    } else {
      // AuditLog log exception
      if (req.user) {
        datastore.auditLog_insert(
          { admin_user: req.user, data: { message, code, status } },
          "server-exception"
        );
      }
      logger.error(err);
      logger.error(
        {
          path,
          status,
          code,
          user,
        },
        message
      );
      res.status(status);
    }
  });

  return {
    app,
    config,
    logger,
    http,
  };
};
