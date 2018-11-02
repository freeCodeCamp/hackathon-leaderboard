const mongoose = require('mongoose');

/**
 * Webhook Schema
 */
const WebhookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hook: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  secret: {
    type: String,
    required: true
  },
  belongsTo: {
    type: String,
    required: true
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
WebhookSchema.method({});

/**
 * Statics
 */
WebhookSchema.statics = {};

/**
 * @typedef Webhook
 */
module.exports = mongoose.model('Webhook', WebhookSchema);
