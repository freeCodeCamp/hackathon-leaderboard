const scheduleTest = require('../lighthouse/scheduler');


function handleNetlifyWebhook(req, res) {
  const {
    body: { url, screenshot_url }
  } = req;
  res.sendStatus(200);
  const { teamId } = res.locals;
  // eslint-disable-next-line
  const screenshot = screenshot_url;
  return scheduleTest({ teamId, url, screenshot });
}

module.exports = { handleNetlifyWebhook };
