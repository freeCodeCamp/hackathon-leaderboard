// const mongoose = require('mongoose');
// const request = require('supertest-as-promised');
// const httpStatus = require('http-status');
// const chai = require('chai'); // eslint-disable-line import/newline-after-import
// const expect = chai.expect;
// const app = require('../../index');

// chai.config.includeStack = true;

// /**
//  * root level hooks
//  */
// after((done) => {
//   // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
//   mongoose.models = {};
//   mongoose.modelSchemas = {};
//   mongoose.connection.close();
//   done();
// });

// describe('## Team APIs', () => {
//   let team = {
//     // _id: '5bdae3192e51f46e97fe61f9',
//     name: 'fCCTeam',
//     githubRepository: 'https://github.com/freeCodeCamp/hackathon-leaderboard',
//     siteUrl: 'https://freeCodeCamp.com',
//     // lighthouse: [],
//     collaborators: [
//       'Bouncey'
//     ],
//     // __v: 0
//   };

//   describe('# POST /api/teams', () => {
//     xit('should create a new team', (done) => {
//       request(app)
//         .post('/api/teams')
//         .send(team)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.name).to.equal(team.name);
//           expect(res.body.githubRepository).to.equal(team.githubRepository);
//           expect(res.body.siteUrl).to.equal(team.siteUrl);
//           expect(res.body.collaborators).to.equal(team.collaborators.join(','));
//           team = res.body;
//           done();
//         })
//         .catch(done);
//     });

//     xit('should update an existing team', (done) => {
//       request(app)
//         .post(`/api/teams/${team._id}`)
//         .send(team)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.name).to.equal(team.name);
//           expect(res.body.githubRepository).to.equal(team.githubRepository);
//           expect(res.body.siteUrl).to.equal(team.siteUrl);
//           expect(res.body.collaborators).to.equal(team.collaborators.join(','));
//           team = res.body;
//           done();
//         })
//         .catch(done);
//     });
//   });

//   describe('# GET /api/teams/:teamId', () => {
//     xit('should get team details', (done) => {
//       request(app)
//         .get(`/api/teams/${team._id}`)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.name).to.equal(team.name);
//           expect(res.body.githubRepository).to.equal(team.githubRepository);
//           expect(res.body.siteUrl).to.equal(team.siteUrl);
//           expect(res.body.collaborators).to.equal(team.collaborators);
//           done();
//         })
//         .catch(done);
//     });

//     xit('should report error with message - Not found, when team does not exist', (done) => {
//       request(app)
//         .get('/api/teams/56c787ccc67fc16ccc1a5e92')
//         .expect(httpStatus.NOT_FOUND)
//         .then((res) => {
//           expect(res.body.message).to.equal('Not Found');
//           done();
//         })
//         .catch(done);
//     });
//   });

//   describe('# GET /api/teams', () => {
//     xit('should get all teams', (done) => {
//       request(app)
//         .get('/api/teams')
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body).to.be.an('array');
//           done();
//         })
//         .catch(done);
//     });

//     xit('should get all teams (with limit and skip)', (done) => {
//       request(app)
//         .get('/api/teams')
//         .query({ limit: 10, skip: 1 })
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body).to.be.an('array');
//           done();
//         })
//         .catch(done);
//     });
//   });

//   describe('# DELETE /api/teams/delete/:teamId', () => {
//     xit('should delete user', (done) => {
//       request(app)
//         .delete(`/api/teams/delete/${team._id}`)
//         .expect(httpStatus.OK)
//         .then((res) => {
//           expect(res.body.name).to.equal(team.name);
//           expect(res.body.githubRepository).to.equal(team.githubRepository);
//           expect(res.body.siteUrl).to.equal(team.siteUrl);
//           expect(res.body.collaborators).to.equal(team.collaborators);
//           done();
//         })
//         .catch(done);
const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const { mockReq, mockRes } = require('sinon-express-mock');
const proxyquire = require('proxyquire');

const Team = require('./team.model');
const User = require('../user/user.model');
const Webhook = require('../webhooks/webhook.model');

const { expect } = chai;
chai.use(sinonChai);

const team = {
  name: 'freeCodeCamp',
  collaborators: 'Bouncey, raisedadead',
  githubRepository: 'https://github.com/freeCodeCamp/freeeCodeCamp',
  siteUrl: 'https://www.freecodecamp.org',
  isOnlineHackathon: true
};

const newTeam = {
  ...team,
  _id: '5bdb80d3042e1757a14865e4',
  __v: 0,
  collaborators: ['Bouncey', 'raisedadead']
};

const user = { _id: 123 };
describe('# Team API', () => {
  describe('create', () => {
    let teamCtrl;

    beforeEach(() => {
      sinon.stub(Webhook, 'create').resolves();
      sinon.stub(Team, 'create').resolves(newTeam);
      sinon.stub(User, 'update').resolves();
      teamCtrl = proxyquire('./team.contoller', {
        './team.model': Team,
        '../user/user.model': User,
        '../webhooks/webhook.model': Webhook
      });
    });

    afterEach(() => {
      Team.create.restore();
      User.update.restore();
      Webhook.create.restore();
    });

    it('should call `create` on the Team model', () => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };
      const req = mockReq(request);
      const res = mockRes();

      create(req, res).then(() => {
        expect(Team.create).to.be.calledWith({
          ...team,
          collaborators: ['Bouncey', 'raisedadead']
        });
      });
    });

    it('should call `update` on the User model with the team id', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };
      const req = mockReq(request);
      const res = mockRes();

      create(req, res).then(() => {
        expect(User.update).to.be.calledWith(user, { teamId: newTeam._id });
        done();
      });
    });

    it('should acknowledge a successful team creation', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };
      const req = mockReq(request);
      const res = mockRes();

      create(req, res).then(() => {
        expect(res.status).to.be.calledWith(200);
        const jsonCalledWith = res.json.getCalls()[0].args;
        expect(jsonCalledWith.acknowledged);
        expect('netlify' in jsonCalledWith);
        expect('github' in jsonCalledWith);
        done();
      });
    });

    it('should acknowledge a failed attempt at creating a team', (done) => {
      Team.create.restore();
      User.update.restore();
      sinon.stub(Team, 'create').resolves(null);
      sinon.stub(User, 'update').resolves();
      const teamCtrlFails = proxyquire('./team.contoller', {
        './team.model': Team,
        '../user/user.model': User
      });
      const { create } = teamCtrlFails;
      const request = {
        body: team,
        user
      };

      const req = mockReq(request);
      const res = mockRes();

      create(req, res).then(() => {
        expect(res.status).to.be.calledWith(500);
        expect(res.json).to.be.calledWith({ acknowledged: false });
        expect(User.update.called).to.equal(false);
        done();
      });
    });

    it('should not call User.update if the request throws', (done) => {
      Team.create.restore();
      User.update.restore();
      sinon.stub(Team, 'create').rejects();
      sinon.stub(User, 'update').resolves();
      const teamCtrlFails = proxyquire('./team.contoller', {
        './team.model': Team,
        '../user/user.model': User
      });
      const { create } = teamCtrlFails;
      const request = {
        body: team,
        user
      };

      const req = mockReq(request);
      const res = mockRes();
      const next = sinon.spy();

      create(req, res, next).then(() => {
        expect(User.update.called).to.equal(false);
        expect(next.calledOnce);
        done();
      });
    });

    it('creates two new webhooks', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };

      const req = mockReq(request);
      const res = mockRes();

      create(req, res).then(() => {
        expect(Webhook.create.calledTwice);
        done();
      });
    });
  });
});
