const { isEmpty } = require('lodash');


exports.ifNoBody400 = function ifNoBody400(req, res, next) {
  const { body } = req;
  if (!body || isEmpty(body)) {
    return res.sendStatus(400);
  }
  return next();
};
