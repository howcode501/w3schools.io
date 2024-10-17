// eslint-disable-next-line no-unused-vars
module.exports = async (_app, _helpers) => {
  function getFilterOptions(req_query) {
    /*
    let opts = {
      start: query._start || 0,
      end: query._end || null,
      order: query._order || null,
      sort: query._sort || null,
    };
    if (query.sortBy) { opts.sort = req.query.sortBy; }
    if (query.orderBy) { opts.order = req.query.orderBy; }
    if (query.perPage && req.query.currentPage) {
      opts.start = (query.currentPage - 1) * req.query.perPage;
      opts.end = opts.start + parseInt(query.perPage,10);
    }
    return opts;
    */

    return req_query;
  }

  function sortslice(result, req_query) {
    const options = req_query;
    // const options = getFilterOptions(req_query);
    if (options && result.length > 0) {
      result.sort((a, b) => {
        try {
          // TODO - normalize field
          const na = a[options.sort];
          const nb = b[options.sort];
          const rank = (r) => (options.order === "DESC" ? -r : r);
          if (na < nb) {
            return rank(-1);
          }
          if (na > nb) {
            return rank(1);
          }
        } catch (err) {
          // ignore error
          // TODO -- figure out how to log sort failure 'only once'
        }
        return 0;
      });
    }
    if (options && options.start !== null && options.end) {
      // eslint-disable-next-line no-param-reassign
      result = result.slice(options.start, options.end);
    }
    return result;
  }

  return { getFilterOptions, sortslice };
};
