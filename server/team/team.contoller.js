const nanoId = require('nanoid');

const { host } = require('../../config/config');
const Team = require('./team.model');
const User = require('../user/user.model');
const launchChromeAndRunLighthouse = require('../lighthouse/lighthouse');
const Webhook = require('../webhooks/webhook.model');

function generateKeys() {
  return {
    id: nanoId(24),
    secret: nanoId(80)
  };
}

function generateWebhook(provider) {
  const { id, secret } = generateKeys();
  return { webhook: `${host}/api/webhook/${provider}/${id}`, id, secret, name: provider };
}

function createWebhooks() {
  return {
    github: generateWebhook('github'),
    netlify: generateWebhook('netlify')
  };
}

function createRelationships(userId, teamId, webhooks) {
  const { netlify, github } = webhooks;
  netlify.belongsTo = teamId;
  github.belongsTo = teamId;
  return Promise.all([
    User.update({ _id: userId }, { teamId }),
    Webhook.create(netlify),
    Webhook.create(github)
  ]);
}

function create(req, res, next) {
  const { body: team } = req;
  const collaborators = Array.isArray(team.collaborators)
    ? team.collaborators
    : team.collaborators
        .split(',')
        .map(str => str.trim())
        .filter(Boolean);
  const webhooks = createWebhooks();
  return Team.create({ ...team, collaborators })
    .then((newTeam) => {
      if (!newTeam) {
        res.status(500).json({ acknowledged: false });
        return null;
      }
      return createRelationships(req.user._id, newTeam._id, webhooks).then(() =>
        res.json({ acknowledged: true, webhooks })
      );
    })
    .catch(next);
}

function update(req, res) {
  const { body: team } = req;
  const collaborators = team.collaborators
    .split(',')
    .map(str => str.trim())
    .filter(Boolean);
  team.collaborators = collaborators;
  Team.findOneAndUpdate(
    { _id: req.params.teamId },
    { $set: team },
    { safe: true, new: true, multi: false }
  ).then(() => {
    res.redirect('/team');
  });
}
/* updates lighthouse scores for a team */
function analyze(req, res) {
  return Team.findOne({ _id: req.params.teamId }).then((team) => {
    if (!team) {
      return res.redirect('/team');
    }
    async function updateTeamScore() {
      await new Promise((resolve, reject) => {
        launchChromeAndRunLighthouse(team.siteUrl).then((results) => {
          const resultsAddDate = results;
          resultsAddDate.date = new Date();
          Team.findOneAndUpdate(
            { _id: team._id },
            {
              $push: { lighthouse: resultsAddDate }
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
  return Team.findOne({ _id: req.params.teamId }).then((team) => {
    if (!team) {
      return res.redirect('/team');
    }
    return res.status(200).json(team);
  });
}

function deleteTeam(req, res) {
  return Team.remove({ _id: req.params.teamId }).then(team =>
    res.status(200).json(`deleted team ${team.name}`)
  );
}

module.exports = { create, update, list, analyze, single, deleteTeam };
