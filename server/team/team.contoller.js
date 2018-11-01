const debug = require('debug');

const Team = require('./team.model');
const User = require('../user/user.model');
const launchChromeAndRunLighthouse = require('../lighthouse/lighthouse');

const log = debug('fcc:team:controller');

function create(req, res) {
  const body = req.body;
  return Team.create(body)
    .then((newTeam) => {
      if (!newTeam) {
        return res.status(500).json({ acknowladged: false });
      }
      return res.status(200).json(newTeam);
    })
    .then(teamId => User.update({ _id: req.user._id }, { teamId }));
}

function join(req, res) {
  Team.findOneAndUpdate(
    { _id: req.body.team },
    { $push: { collaborators: req.user } },
    { safe: true, new: true, multi: false }
  )
  .then((team) => {
    log(team);
    return res.redirect(`/user/${req.user._id}`);
  });
}
/* updates lighthouse scores for all teams.
TODO parameterize and update selected */
function analyze(req, res) {
  Team.find({})
  .sort()
  .lean()
  .then((teams) => {
    if (teams.length === 0) {
      return res.redirect('/team');
    }
    async function updateLeaderboard() {
      await new Promise((resolve, reject) => {
        teams.forEach((team) => {
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
            .then((result) => {
              log(result);
            })
            .catch((err) => {
              if (err) {
                reject(err);
              }
            });
          });
        });
        resolve();
      });
    }
    updateLeaderboard();
    return Team.find({})
    .sort()
    .lean()
    .then((newteams) => {
      log(newteams);
      return res.status(200).json(newteams);
    });
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
module.exports = { create, list, analyze, join };
