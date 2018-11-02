function handleNetlifyWebhook(req, res, next) {
  return next();
}

function handleGitHubWebhook(req, res, next) {
  return next();
}

module.exports = { handleGitHubWebhook, handleNetlifyWebhook };
