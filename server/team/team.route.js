const express = require('express');

const { ifNoUserRedirect } = require('../middlewares/user');
const teamCtrl = require('./team.contoller');

const router = express.Router(); // eslint-disable-line new-cap

router
  .route('/')
  /** GET /api/teams - Get list of users */
  .get(teamCtrl.list)
  /** POST /api/teams - Create new team */
  .post(ifNoUserRedirect(), teamCtrl.create);

router
  .route('/analyze')
  .get(teamCtrl.analyze);

router
  .route('/join')
  .get(teamCtrl.joinForm)
  .post(ifNoUserRedirect(), teamCtrl.join);

module.exports = router;
