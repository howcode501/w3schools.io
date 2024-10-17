module.exports = async (models, config, logger) => {
  const { AuditLog } = models;
  const auditLogDataReturn = {
    user: {
      include: {
        profile: true,
      },
    },
  };
  // Construct a query object for AuditLogs lookups
  function auditLog_where({
    id, user_id, event, created, search_string,
  }) {
    const query = {};
    if (id) {
      query.id = id || user_id;
    }
    if (event) {
      query.name = event;
    }
    if (created) {
      query.created = created;
    }
    if (search_string) {
      query.search_string = search_string;
    }
    return query;
  }

  // Get list of AuditLogs
  async function auditLog_getList(params = {}) {
    const query = auditLog_where(params);
    const rv = await AuditLog.findMany({
      where: {
        event:{
          notIn:['Hyperstream URL Generated']
        }
      },
      orderBy: {
        id: 'desc',
      },
      include: auditLogDataReturn,
    });
   


    return rv;
  }
  // AuditLogs insert
  // auditLog_insert({admin_user:req.user,data: { username: "test"}},"New user created");
  async function auditLog_insert(data, action) {
    logger.debug({ data }, 'Insert AuditLog');
    const auditLog = await AuditLog.create({
      data: {
        user_id: data.admin_user.id,
        event: action,
        data: data.data,
      },
      include: auditLogDataReturn,
    });

    logger.debug({ auditLog }, 'AuditLog Inserted');
    return auditLog;
  }
  return {
    auditLog_getList,
    auditLog_insert,
  };
};
