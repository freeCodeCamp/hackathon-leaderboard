const scheduleTest = require('../lighthouse/scheduler');


function handleNetlifyWebhook(req, res) {
  const {
    body: { url }
  } = req;

  res.sendStatus(200);
  const { teamId } = res.locals;
  return scheduleTest({ teamId, url });
}

module.exports = { handleNetlifyWebhook };
