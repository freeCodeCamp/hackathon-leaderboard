const express = require('express');

const { ifNoUserRedirect } = require('../middlewares/user');
const teamCtrl = require('./team.contoller');

const router = express.Router(); // eslint-disable-line new-cap

const multer = require('multer');
const bodyParser = require('body-parser');

const parseForm = bodyParser.urlencoded({ extended: false });
const parseJSONBody = bodyParser.json();
const parseBody = [parseJSONBody, parseForm];

const upload = multer();

router
  .route('/')
  /** GET /api/teams - Get list of users */
  .get(teamCtrl.list)
  /** POST /api/teams - Create new team */
  .post(ifNoUserRedirect(), upload.array(), parseBody, teamCtrl.create);

router
  .route('/analyze')
  .post(teamCtrl.analyze);

router
  .route('/join')
  .post(ifNoUserRedirect(), teamCtrl.join);

module.exports = router;
