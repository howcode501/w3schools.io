// eslint-disable-next-line no-unused-vars
module.exports = async (models, _config, _logger) => {
  const { Role } = models;

  function role_where({ id, name, role_id, role_name, enabled, hidden }) {
    const query = {};
    if (id || role_id) {
      query.id = id || role_id;
    }
    if (name || role_name) {
      query.name = name || role_name;
    }
    if (enabled) {
      query.enabled = enabled;
    }
    if (hidden) {
      query.hidden = hidden;
    }
    return query;
  }

  async function role_getList(params) {
    const query = {};
    query.enabled = true;

    if (params.role === "administrator") {
      query.name = "user";
    }

    const rolesDb = await Role.findMany({ where: query });
    let roles = [];
    let roleMSP;
    let roleAdmin;
    let roleUser;
    for (let i = 0; i < rolesDb.length; i++) {
      if (rolesDb[i].name === "msp") {
        roleMSP = rolesDb[i];
      }
      if (rolesDb[i].name === "administrator") {
        roleAdmin = rolesDb[i];
      }
      if (rolesDb[i].name === "user") {
        roleUser = rolesDb[i];
      }
    }
    roles.push(roleMSP);
    roles.push(roleAdmin);
    roles.push(roleUser);

    return roles;
  }

  return {
    role_where,
    role_getList,
  };
};
