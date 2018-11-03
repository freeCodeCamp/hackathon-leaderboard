const mongoose = require('mongoose');
/**
 * Team Schema
 */
const LighthouseSchema = new mongoose.Schema({
  date: Date,
  seo: Number,
  'best-practices': Number,
  accessibility: Number,
  pwa: Number,
  performance: Number
});

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  collaborators: {
    type: [String],
    required: true
  },
  githubRepository: {
    type: String,
    required: true
  },
  siteUrl: {
    type: String
  },
  isOnlineHackathon: {
    type: Boolean
  },
  lighthouse: [LighthouseSchema],
  buildStatus: {
    type: String,
    required: true,
    default: 'initial',
    validate: {
      validator(str) {
        return ['initial', 'pending', 'complete', 'failed'].includes(str);
      },
      message: props => `${props.value} is not a valid build status`
    }
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
TeamSchema.method({});

/**
 * Statics
 */
TeamSchema.statics = {
  /**
   * List teams in descending order of 'teamName'.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<Team[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ teamName: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef Team
 */
module.exports = mongoose.model('Team', TeamSchema);
