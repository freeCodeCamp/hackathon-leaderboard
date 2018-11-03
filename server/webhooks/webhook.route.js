const express = require('express');

const webhookCtrl = require('./webhook.controller');
const { verifyNetlifyOr403 } = require('../middlewares/webhook');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/netlify/:webhookId').post(verifyNetlifyOr403, webhookCtrl.handleNetlifyWebhook);

/* router
  .route('/team/:teamId')
  .get(webhookCtrl.view);*/

module.exports = router;
