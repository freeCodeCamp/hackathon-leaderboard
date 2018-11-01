function handlePassportLogin(req, res) {
  return res.redirect('/');
}

function handleSignout(req, res) {
  if (req.session) {
    req.session.destroy();
  }
  req.logout();
  return res.redirect('/');
}
/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = { handlePassportLogin, handleSignout, getRandomNumber };
