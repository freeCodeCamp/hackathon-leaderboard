const mongoose = require('mongoose');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');

chai.config.includeStack = true;

/**
 * root level hooks
 */
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

describe('## Team APIs', () => {
  let team = {
    // _id: '5bdae3192e51f46e97fe61f9',
    name: 'fCCTeam',
    githubRepository: 'https://github.com/freeCodeCamp/hackathon-leaderboard',
    siteUrl: 'https://freeCodeCamp.com',
    // lighthouse: [],
    collaborators: [
      'Bouncey'
    ],
    // __v: 0
  };

  describe('# POST /api/teams', () => {
    xit('should create a new team', (done) => {
      request(app)
        .post('/api/teams')
        .send(team)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(team.name);
          expect(res.body.githubRepository).to.equal(team.githubRepository);
          expect(res.body.siteUrl).to.equal(team.siteUrl);
          expect(res.body.collaborators).to.equal(team.collaborators.join(','));
          team = res.body;
          done();
        })
        .catch(done);
    });

    xit('should update an existing team', (done) => {
      request(app)
        .post(`/api/teams/${team._id}`)
        .send(team)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(team.name);
          expect(res.body.githubRepository).to.equal(team.githubRepository);
          expect(res.body.siteUrl).to.equal(team.siteUrl);
          expect(res.body.collaborators).to.equal(team.collaborators.join(','));
          team = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/teams/:teamId', () => {
    xit('should get team details', (done) => {
      request(app)
        .get(`/api/teams/${team._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(team.name);
          expect(res.body.githubRepository).to.equal(team.githubRepository);
          expect(res.body.siteUrl).to.equal(team.siteUrl);
          expect(res.body.collaborators).to.equal(team.collaborators);
          done();
        })
        .catch(done);
    });

    xit('should report error with message - Not found, when team does not exist', (done) => {
      request(app)
        .get('/api/teams/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/teams', () => {
    xit('should get all teams', (done) => {
      request(app)
        .get('/api/teams')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });

    xit('should get all teams (with limit and skip)', (done) => {
      request(app)
        .get('/api/teams')
        .query({ limit: 10, skip: 1 })
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.be.an('array');
          done();
        })
        .catch(done);
    });
  });

  describe('# DELETE /api/teams/delete/:teamId', () => {
    xit('should delete user', (done) => {
      request(app)
        .delete(`/api/teams/delete/${team._id}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.name).to.equal(team.name);
          expect(res.body.githubRepository).to.equal(team.githubRepository);
          expect(res.body.siteUrl).to.equal(team.siteUrl);
          expect(res.body.collaborators).to.equal(team.collaborators);
          done();
        })
        .catch(done);
    });
  });
});
