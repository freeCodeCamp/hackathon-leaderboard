const { isEmpty } = require('lodash');


exports.ifNoBody400 = function ifNoBody400(req, res, next) {
  const { body } = req;
  if (!body || isEmpty(body)) {
    return res.sendStatus(400);
  }
  return next();
};

exports.ifNotOwnTeam400 = function ifNotOwnTeam400(req, res, next) {
  if (req.user.teamId !== req.params.teamId) {
    return res.sendStatus(400);
  }
  return next();
};

