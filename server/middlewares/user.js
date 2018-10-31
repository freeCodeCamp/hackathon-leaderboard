exports.ifNoUserRedirect = (redirect = '/') => (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.redirect(redirect);
};
