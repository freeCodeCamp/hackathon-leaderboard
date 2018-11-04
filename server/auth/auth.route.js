const express = require('express');
const expressJwt = require('express-jwt');

const authCtrl = require('./auth.controller');
const config = require('../../config/config');
const passport = require('../../config/passport');

const { ifNoUserRedirect } = require('../middlewares/user');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router
  .route('/random-number')
  .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);

router
  .route('/github/callback')
  .get(
    passport.authenticate('github', { failureRedirect: '/' }),
    authCtrl.handlePassportLogin
  );

router.route('/signout').get(ifNoUserRedirect(), authCtrl.handleSignout);

module.exports = router;
