const debug = require('debug');

const Team = require('./team.model');
const User = require('../user/user.model');
const launchChromeAndRunLighthouse = require('../lighthouse/lighthouse');

const log = debug('fcc:team:controller');

function create(req, res) {
  const { body: team } = req;
  const collaborators = team.collaborators.split(',').map(str => str.trim())
    .filter(Boolean);
  team.collaborators = collaborators;
  const newTeam = new Team(team);
  return newTeam.save()
  .then(() => {
    if (!newTeam) {
      return res.status(500).json({ acknowladged: false });
    }
    return User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { teamId: newTeam._id } }
    )
    .then((user) => {
      res.redirect(`/api/teams/${user.teamId}`);
    });
  });
}

function update(req, res) {
  const { body: team } = req;
  const collaborators = team.collaborators.split(',').map(str => str.trim())
    .filter(Boolean);
  team.collaborators = collaborators;
  Team.findOneAndUpdate(
    { _id: req.params._id },
    { $set: team },
    { safe: true, new: true, multi: false }
  )
  .then((newTeam) => {
    log(newTeam);
    res.redirect(`/api/teams/${newTeam._id}`);
  });
}
/* updates lighthouse scores for a team */
function analyze(req, res) {
  return Team.findOne({ _id: req.params._id })
  .then((team) => {
    if (!team) {
      return res.redirect('/team');
    }
    async function updateTeamScore() {
      await new Promise((resolve, reject) => {
        launchChromeAndRunLighthouse(team.siteUrl).then((results) => {
          Team.findOneAndUpdate(
            { _id: team._id },
            {
              $push: { lighthouse: results }
            },
            {
              new: true,
              multi: false
            }
          )
          .then((newTeam) => {
            res.status(200).json(newTeam);
            resolve();
          })
          .catch((err) => {
            if (err) {
              reject(err);
            }
          });
        });
      });
    }
    return updateTeamScore();
  });
}

function list(req, res) {
  return Team.find({})
  .sort()
  .lean()
  .then((teams) => {
    if (teams.length === 0) {
      return res.render('createTeam');
    }
    return res.status(200).json(teams);
  });
}

function single(req, res) {
  return Team.findOne(
    { _id: req.params.teamId }
  )
  .then((team) => {
    if (!team) {
      return res.redirect('/team');
    }
    return res.status(200).json(team);
  });
}

function deleteTeam(req, res) {
  return Team.remove({ _id: req.params._id })
  .then(team => res.status(200).json(`deleted team ${team.name}`));
}

module.exports = { create, update, list, analyze, single, deleteTeam };
