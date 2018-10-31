const mongoose = require('mongoose');

const schema = mongoose.Schema;

const UserSchema = schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  githubId: {
    type: String
  },
  avatar: {
    type: String
  },
  githubProfile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  teamId: {
    type: String
  }
});

module.exports = UserSchema;
