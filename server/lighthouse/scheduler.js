const q = require('queue')();

const Team = require('../team/team.model');
const lighthouseTest = require('./lighthouse');

const thirtySeconds = 1000 * 30;

q.concurrency = 2;
q.timeout = thirtySeconds;
q.autostart = true;

const state = new Map();

function schedlueTest({ teamId, url }) {
  if (state.has(url)) {
    return;
  }
  state.set(url, teamId);
  function testJob() {
    return lighthouseTest(url);
  }

  testJob.url = url;
  q.push(testJob);
  Team.update({ _id: teamId }, { buildStatus: 'pending' });
  return;
}

q.on('timeout', (next, job) => {
  const { url } = job;
  const teamId = state.get(url);

  return Team.updateOne({ _id: teamId }, { buildStatus: 'failed' })
    .then(() => state.delete(url))
    .then(next);
});

q.on('success', (results) => {
  const url = results.url.slice(0);
  const teamId = state.get(url);

  // eslint-disable-next-line no-param-reassign
  delete results.url;
  return Team.update(
    { _id: teamId },
    { $push: { lighthouse: { ...results, date: new Date() } }, buildStatus: 'complete' }
  ).then(() => {
    state.delete(url);
  });
});

q.on('error', (err, job) => {
  const { url } = job;
  const teamId = state.get(url);
  // eslint-disable-next-line no-console
  console.error(err);
  return Team.updateOne({ _id: teamId }, { buildStatus: 'failed' }).then(() => state.delete(url));
});

module.exports = schedlueTest;
