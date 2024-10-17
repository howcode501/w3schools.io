const express = require('express');
const asyncHandler = require('express-async-handler');

module.exports = async (app, helpers, validations) => {
  const router = express.Router();
  const { sortslice, onlyMSP } = helpers;
  const {
    auth_method_profile_getList,
    auth_method_profile_where,
    auth_method_profile_findUnique,
    auth_method_profile_normalize,
    auth_method_profile_update,
    auth_method_profile_setUsers,
    auth_method_profile_setApps,
    auth_method_profile_insert,
    auth_method_profile_getSmallList,
  } = app.get('datastore');

  const { auth_method_profiles_validateSchema } = validations;

  function parse_body(body) {
    const data = {};

    if (body?.display_name) {
      data.name = body?.display_name;
    }

    // TODO Temporary Fix for Backend Services
    if (body?.name) {
      data.name = body?.display_name;
    }

    if (body?.id) {
      // delete body.id;
    }

    if (body?.description) {
      data.description = body?.description;
    }

    if (body?.enabled !== undefined) {
      data.enabled = body.enabled;
    }

    return data;
  }

  // Endpoints
  router.get(
    '/',
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info('GET /api/auth_method_profiles');

      const msp_user = res.req.user.roles.includes('msp');
      const q = msp_user ? {} : { hidden: false };
      const auth_method_profiles = await auth_method_profile_getList(q);

      const total = auth_method_profiles.length;
      const filtered = sortslice(auth_method_profiles, req.query);

      res.set('X-Total-Count', total);
      res.json({ data: filtered });
    }),
  );

  // Get All auth_method_profile Options for Edit and New Forms
  router.get(
    '/options',
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info('GET /api/auth_method_profiles/options');
      const dataReturn = {};

      // Get Permissions List
      // const permissions = await permissions_getList();

      // dataReturn.permissions = permissions;

      res.json({ data: dataReturn });
    }),
  );

  // SEARCH auth_method_profiles
  router.post(
    '/search',
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.debug('GET /api/auth_method_profiles/search');

      const q = parse_body(req.body.data);
      req.logger.debug({ q }, 'Parsed Body');
      const auth_method_profiles = await auth_method_profile_getSmallList(q);

      const total = auth_method_profiles.length;
      const filtered = sortslice(auth_method_profiles, req.query);

      res.set('X-Total-Count', total);
      res.json({ data: filtered });
    }),
  );

  // READ
  router.get(
    '/:id',
    onlyMSP,
    asyncHandler(async (req, res) => {
      req.logger.info('GET /api/auth_method_profiles/:id');

      const query = await auth_method_profile_where(req.params);
      const auth_method_profile_record = await auth_method_profile_findUnique(query);
      const auth_method_profile = await auth_method_profile_normalize(auth_method_profile_record);

      if (auth_method_profile) {
        res.json({ data: { auth_method_profile } });
      } else {
        res.status(400).json({ error: 'no such auth_method_profile' });
      }
    }),
  );

  // CREATE
  router.put(
    '/',
    onlyMSP,
    auth_method_profiles_validateSchema,
    asyncHandler(async (req, res) => {
      const data = parse_body(req.body);
      req.logger.debug({ data }, 'Data for Creation');
      const rec = await auth_method_profile_insert({ data });

      const users = req.body?.users;
      const variants = req.body?.variants;

      if (users) {
        auth_method_profile_setUsers({ users, auth_method_profile: rec });
      }

      if (variants) {
        auth_method_profile_setApps({ variants, auth_method_profile: rec });
      }

      const auth_method_profile = auth_method_profile_normalize(rec);
      if (auth_method_profile) {
        res.json({ data: { auth_method_profile } });
      } else {
        res.status(400).json({ error: 'Unable to Create auth_method_profile' });
      }
    }),
  );

  // UPDATE
  router.post(
    '/:id',
    onlyMSP,
    auth_method_profiles_validateSchema,
    asyncHandler(async (req, res) => {
      req.logger.info('POST /api/auth_method_profiles/:id');

      const data = parse_body(req.body);

      req.logger.debug({ data }, 'Parsed auth_method_profile Data');
      const rec = await auth_method_profile_update({ id: req.params.id, data });
      const users = req.body?.users;
      const variants = req.body?.variants;
      req.logger.debug({ users }, 'Users Data Passed in');

      if (users) {
        auth_method_profile_setUsers({ users, auth_method_profile: rec });
      }

      if (variants) {
        auth_method_profile_setApps({ variants, auth_method_profile: rec });
      }

      const auth_method_profile = await auth_method_profile_normalize(rec);
      if (auth_method_profile) {
        res.json({ data: { auth_method_profile } });
      } else {
        res.status(400).json({ error: 'Unable to Update auth_method_profile' });
      }
    }),
  );

  return router;
};
