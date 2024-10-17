const guardFactory = require("express-jwt-permissions");
const jwt_decode = require("jwt-decode");
const { PermissionError } = require("./error");
// eslint-disable-next-line no-unused-vars
module.exports = async (_app, _helpers) => {
  const { user_where, user_findUnique, user_normalize } = _app.get("datastore");
  const guard = guardFactory({
    requestProperty: "user",
    permissionsProperty: "permissions",
  });

  const checkPermissions = (...perms) => {
    const permissions = [...perms];
    permissions.push(["role:administrator"]);
    permissions.push(["role:msp"]);
    return guard.check(permissions);
  };

  const onlyMSP = guard.check(["role:msp"]);
  const onlyAdministrator = guard.check([["role:msp"], ["role:administrator"]]);
  const anyUser = checkPermissions(["role:user"]);

  // Check if login user can have permission to create users on specfic role
  async function canCreateUsers(req, res, next) {
    // get user details //
    const creatingUser = req.body.data;
    // decode jwt token //
    const currentUser = jwt_decode(req.accessToken);
    if (
      currentUser.permissions.includes("role:administrator") &&
      creatingUser.roles.includes("msp")
    ) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    if (currentUser.permissions.includes("role:user")) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    // proceed further if all good //
    next();
  }

  // for checking list user end point //
  async function canReadUsers(req, res, next) {
    // get read user details //
    const query = await user_where(req.params);
    const user_record = await user_findUnique(query);
    const listUser = await user_normalize(user_record);
    // token decode//
    const currentUser = jwt_decode(req.accessToken);
    if (listUser == null) {
      return res.status(400).json({ error: "no such user" });
    }
    if (
      currentUser.permissions.includes("role:administrator") &&
      listUser.roles.includes("msp")
    ) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    if (
      currentUser.permissions.includes("role:user") &&
      currentUser.id !== listUser.id
    ) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    // proceed further if all good //
    next();
  }

  // for checking user update end point //
  async function canUpdateUsers(req, res, next) {
    // get updating user details //
    const query = await user_where(req.params);
    const user_record = await user_findUnique(query);
    const existingUser = await user_normalize(user_record);
    // token decode//
    const currentUser = jwt_decode(req.accessToken);
    // check new role//
    const updatingData = req.body.data;
    // check access
    if (existingUser == null) {
      return res.status(400).json({ error: "no such user" });
    }
    if (
      currentUser.permissions.includes("role:administrator") &&
      (existingUser.roles.includes("msp") || updatingData.roles.includes("msp"))
    ) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    if (currentUser.permissions.includes("role:user")) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    // proceed further if all good //
    next();
  }

  // Check if login user can have permission to delete users specfic role
  async function canDeleteUsers(req, res, next) {
    // get deleting user details //
    const query = await user_where(req.params);
    const user_record = await user_findUnique(query);
    const deletingUser = await user_normalize(user_record);
    // decode jwt token //
    const currentUser = jwt_decode(req.accessToken);
    // check access
    if (deletingUser == null) {
      return res.status(400).json({ error: "no such user" });
    }
    if (
      currentUser.permissions.includes("role:msp") &&
      (currentUser.id === deletingUser.id)
    ) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    if (
      currentUser.permissions.includes("role:administrator") &&
      (deletingUser.roles.includes("msp") ||
        currentUser.id === deletingUser.id)
    ) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    if (currentUser.permissions.includes("role:user")) {
      return res
        .status(PermissionError.status)
        .json({ message: PermissionError.message });
    }
    // proceed further if all good //
    next();
  }

  return {
    checkPermissions,
    anyUser,
    onlyMSP,
    onlyAdministrator,
    canCreateUsers,
    canReadUsers,
    canUpdateUsers,
    canDeleteUsers,
  };
};
