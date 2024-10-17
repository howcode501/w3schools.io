const bunyan = require('bunyan');
const { customAlphabet } = require('nanoid');
const { nolookalikesSafe } = require('nanoid-dictionary');

function nanocode(length = 16) {
  return customAlphabet(nolookalikesSafe, length)();
}

module.exports = (config) => {
  function mask(p) {
    if (p === null) {
      return '(null)';
    }
    if (p !== '') {
      return '***';
    }
    return p;
  }

  function mask_uri(p) {
    if (p === null) {
      return '(null)';
    }
    const u = new URL(p);
    u.password = mask(u.password);
    return u.toString();
  }

  function jobSerializer(job) {
    const j = {
      id: job.attrs?._id,
      name: job.attrs?.name || job.name,
      priority: job.attrs?.priority,
      repeatInterval: job.attrs?.repeatInterval || job.repeatInterval,
    };
    return j;
  }

  function optionsSerializer(options) {
    if (options) {
      const o = {
        ...options,
        logger: undefined,
      };
      return o;
    }
    return undefined;
  }

  function userSerializer(user) {
    if (user) {
      const u = {
        id: user.id,
        password: mask(user.password),
        username: user.username,
        permissions: user?.permissions || user?.roles?.map((r) => r.name),
        context: user?.context,
      };
      return u;
    }
    return null;
  }

  function bodySerializer(body) {
    if (body) {
      const password = body.password ? mask(body.password) : undefined;
      const b = {
        ...body,
        password,
      };
      return b;
    }
    return undefined;
  }

  function headerSerializer(header) {
    if (header) {
      const h = {
        ...header,
        authorization: header.authorization
          ? mask(header.authorization)
          : undefined,
      };
      return h;
    }
    return undefined;
  }

  function reqSerializer(req) {
    // TODO - better clone
    const r = {
      id: req.id,
      url: req.originalUrl || req.url,
      baseUrl: req.baseUrl,
      sessionId: req.sessionID,
      method: req.method,
      user: userSerializer(req.user),
      headers: headerSerializer(req.headers),
      body: bodySerializer(req.body),
      source: req.useragent?.source,
      params: req.params,
    };
    if (req.query) {
      r.query = { ...req.query };
      if (r.query.password) {
        r.query.password = mask(r.query.password);
      }
    }
    return r;
  }

  function resSerializer(res) {
    // TODO - better clone
    const r = {
      statusMessage: res.statusMessage,
      header: res._header,
      req: reqSerializer(res.req),
    };
    return r;
  }

  function configSerializer(cfg) {
    // TODO -- better clone
    const c = JSON.parse(JSON.stringify(cfg));
    [
      'superadmin_password',
      'cookie_secret',
      'jwt_secret',
      'session_secret',
      'secret_key',
      'apikey',
      'encryption_secret',
      'hyperstream_secret',
      'google_recaptcha',
    ].forEach((field) => {
      if (c[field]) {
        c[field] = mask(c[field]);
      }
    });
    if (c.database?.uri) {
      c.database.uri = mask_uri(c.database.uri);
    }
    if (c.redis?.uri) {
      c.redis.uri = mask_uri(c.redis.uri);
    }
    if (c.database?.password) {
      c.database.password = mask(c.database.password);
    }
    if (c.redis?.password) {
      c.redis.password = mask(c.redis.password);
    }
    if (c.mysql?.password) {
      c.mysql.password = mask(c.mysql.password);
    }
    if (c.mongo?.password) {
      c.mongo.password = mask(c.mongo.password);
    }
    if (c.mysql?.uri) {
      c.mysql.uri = mask(c.mysql.uri);
    }
    if (c.mongo?.uri) {
      c.mongo.uri = mask(c.mongo.uri);
    }
    if (c.email?.sendgrid_apikey) {
      c.email.sendgrid_apikey = mask(c.email.sendgrid_apikey);
    }
    if (c.email?.ses_secret_key) {
      c.email.ses_secret_key = mask(c.email.ses_secret_key);
    }
    return c;
  }

  const streams = [];
  if (config.is_test) {
    streams.push({ path: 'test.log' });
  } else {
    streams.push({ stream: process.stdout });
  }

  const logger = bunyan.createLogger({
    name: config.appName,
    level: config.loglevel,
    streams,
    serializers: {
      req: reqSerializer,
      password: mask,
      token: mask,
      accessToken: mask,
      secret_key: mask,
      // refreshToken: mask,
      config: configSerializer,
      job: jobSerializer,
      user: userSerializer,
      options: optionsSerializer,
    },

    organization: config.organization,
  });

  const middlewareLogger = function middlewarelogger(options) {
    const _logger = options.logger || logger;
    const headerName = options?.headerName || 'x-request-id';

    return function middleware_logger(req, res, next) {
      const id = req.headers[headerName] || nanocode();
      const startOps = {
        req: { method: req.method, url: req.url, headers: req.headers },
      };

      req.logger = _logger.child({
        id,
        type: 'request',
        serializers: { req: reqSerializer, res: resSerializer },
      });

      res.setHeader(headerName, id);
      // TODO - implement config.requestLoglevel
      const { url } = req;
      req.logger.info(`${req.method} ${url}`);
      req.logger.debug(startOps, 'start request');

      const time = process.hrtime();
      res.on('finish', () => {
        const diff = process.hrtime(time);
        const duration = diff[0] * 1e3 + diff[1] * 1e-6;
        req.logger.info(
          { statusMessage: res.statusMessage },
          `${req.method} ${url}`,
        );
        req.logger.debug({ res, duration }, 'end request');
      });

      next();
    };
  };

  return { logger, middlewareLogger };
};
