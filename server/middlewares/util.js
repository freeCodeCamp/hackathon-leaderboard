const { isEmpty } = require('lodash');
const Team = require('../team/team.model');

function castMaybeStringToArray(maybeString) {
  return Array.isArray(maybeString) ? maybeString : maybeString.split(',');
}

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


exports.ifDuplicate400 = async function ifDuplicate400(req, res, next) {
  const { body } = req;
  const collaborators = castMaybeStringToArray(body.collaborators)
    .map(str => str.trim().replace(/@/g, ''))
    .filter((item, pos, self) => !!item && self.indexOf(item) === pos);
  const filtered = (await Promise.all(collaborators.map(member =>
        Team.find({ _id: { $ne: req.params.teamId }, collaborators: member })
        .then((dup) => {
          if (dup.length > 0) { return false; }
          return member;
        }))
    )).filter(Boolean);

  if (filtered.length !== collaborators.length) {
    return res.sendStatus(400);
  }
  // eslint-disable-next-line no-param-reassign
  req.body.collaborators = collaborators;
  return next();
};
