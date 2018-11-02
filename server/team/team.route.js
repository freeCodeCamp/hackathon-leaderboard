const express = require('express');
const validate = require('express-validation');

const { ifNoUserRedirect } = require('../middlewares/user');
const { ifNoBody400 } = require('../middlewares/util');
const teamCtrl = require('./team.contoller');
const validators = require('./team.validation');
const User = require('../user/user.model');

const router = express.Router(); // eslint-disable-line new-cap

function deleteValidator(req, res, next) {
  return User.findOne({ _id: req.user._id })
  .then((user) => {
    if (user.teamId !== req.params.teamId) {
      return next(new Error('Unauthorized'));
    }
    return next();
  });
}

router
  .route('/')
  /** GET /api/teams - Get list of users */
  .get(teamCtrl.list)
  /** POST /api/teams - Create new team */
  .post(ifNoUserRedirect(), ifNoBody400, validate(validators.createTeam), teamCtrl.create);

router
  .route('/:teamId')
  .get(teamCtrl.single)
  .post(ifNoUserRedirect(), validate(validators.createTeam), teamCtrl.update);

router
  .route('/delete/:teamId')
  .delete(ifNoUserRedirect(), deleteValidator, teamCtrl.deleteTeam);

module.exports = router;
