const express = require('express');
const validate = require('express-validation');

const { ifNoUserRedirect } = require('../middlewares/user');
const { ifNoBody400, ifNotOwnTeam400 } = require('../middlewares/util');
const teamCtrl = require('./team.contoller');
const validators = require('./team.validation');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/teams - Get list of users */
  .get(teamCtrl.list)
  /** POST /api/teams - Create new team */
  .post(ifNoUserRedirect(), ifNoBody400, validate(validators.createTeam), teamCtrl.create);

router
  .route('/:teamId')
  .get(teamCtrl.single)
  .post(ifNoUserRedirect(), ifNoBody400, validate(validators.createTeam), teamCtrl.update);

router
  .route('/webhooks/:teamId')
  .get(teamCtrl.viewWebhooks)
  .post(teamCtrl.newWebhooks);

router
  .route('/analyze/:teamId')
  .get(teamCtrl.analyze);

router
  .route('/delete/:teamId')
  .post(ifNoUserRedirect(), ifNotOwnTeam400, teamCtrl.deleteTeam);

module.exports = router;
