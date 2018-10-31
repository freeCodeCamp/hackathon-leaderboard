const debug = require('debug');

const Team = require('./team.model');
const User = require('../user/user.model');

const log = debug('fcc:team:controller');

function create(req, res) {
  const { body: team } = req;
  log(team);
  return Team.create(team)
    .then((newTeam) => {
      if (!newTeam) {
        return res.status(500).json({ acknowladged: false });
      }
      res.status(200).json({ acknowladged: true });
      return newTeam._id;
    })
    .then(teamId => User.update({ _id: req.user._id }, { teamId }));
}
module.exports = { create };
