const express = require('express');

const webhookCtrl = require('./webhook.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/github/:id').post(webhookCtrl.handleGitHubWebhook);

router.route('/netlify/:id').post(webhookCtrl.handleNetlifyWebhook);

module.exports = router;
