const crypto = require('crypto');
const compare = require('secure-compare');
const debug = require('debug');
const jwt = require('jsonwebtoken');

const Webhook = require('../webhooks/webhook.model');

const log = debug('fcc:middleware:webhook');

async function verifyNetlifyOr403(req, res, next) {
  const { webhookId } = req.params;
  if (!webhookId || webhookId.length !== 24) {
    return res.status(400).json('The webhook ID is missing or malformed');
  }
  const webhook = await Webhook.findOne({ id: webhookId, name: 'netlify' });
  let netlifySignature;
  try {
    netlifySignature = jwt.verify(req.headers['x-webhook-signature'], webhook.secret, {
      iss: 'netlify',
      verify_iss: true,
      algorithm: 'HS256'
    });
  } catch (e) {
    return res.sendStatus(403);
  }
  const computedSignature = `${crypto
    .createHash('sha256', webhook.secret)
    .update(new Buffer(JSON.stringify(req.body), 'utf8'))
    .digest('hex')}`;
  const { sha256: signature } = netlifySignature;

  if (!(computedSignature === signature && compare(computedSignature, signature))) {
    log('This request is not secured! Aborting.');
    return res.sendStatus(403);
  }
  // eslint-disable-next-line no-param-reassign
  res.locals.teamId = webhook.belongsTo;
  return next();
}

exports.verifyNetlifyOr403 = verifyNetlifyOr403;
