const express = require('express');
const { pick } = require('lodash');

const config = require('./config/config');
const userRoutes = require('./server/user/user.route');
const authRoutes = require('./server/auth/auth.route');
const teamRoutes = require('./server/team/team.route');
const webhookRoutes = require('./server/webhooks/webhook.route');
const { ifNoUserRedirect } = require('./server/middlewares/user');

const Team = require('./server/team/team.model');
const Webhook = require('./server/webhooks/webhook.model');

const api = express.Router(); // eslint-disable-line new-cap
const router = express.Router(); // eslint-disable-line new-cap

api.get('/health-check', (req, res) => res.send('OK'));
api.use('/users', userRoutes);
api.use('/auth', authRoutes);
api.use('/teams', teamRoutes);
api.use('/webhook', webhookRoutes);

router.get('/', (req, res) => {
  if (req.user) {
    const { username } = req.user;
    return res.render('welcome', { username });
  }
  return res.render('home', { githubClientId: config.github.id });
});

router.get('/signout', (req, res) => res.redirect('/api/auth/signout'));

router.get('/team', ifNoUserRedirect(), (req, res, next) => {
  const { teamId } = req.user;
  if (teamId) {
    return Promise.all([
      Team.findById(teamId),
      Webhook.findOne({ belongsTo: teamId, name: 'netlify' })
    ]).then(([team, webhooks]) => {
      if (!team) return res.render('createTeam');
      return res.render('manageTeam', { team, webhooks: pick(webhooks, ['name', 'webhook', 'secret']) });
    }).catch(next);
  }
  return res.render('createTeam');
});

function provideRoutes(app) {
  app.use('/api', api);
  app.use(router);
  return;
}

module.exports = provideRoutes;
