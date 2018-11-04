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
  collaborators: ['Bouncey', '@raisedadead'],
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

    it('should call `create` on the Team model', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };
      const req = mockReq(request);
      const res = mockRes();

      create(req, res)
        .then(() => {
          expect(Team.create).to.be.calledWith({
            ...team,
            collaborators: ['Bouncey', 'raisedadead']
          });
          done();
        })
        .catch(done);
    });
    it('should call `update` on the User model with the team id', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };
      const req = mockReq(request);
      const res = mockRes();

      create(req, res)
        .then(() => {
          expect(User.update).to.be.calledWith(user, { teamId: newTeam._id });
          done();
        })
        .catch(done);
    });
    it('should acknowledge a successful team creation', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };
      const req = mockReq(request);
      const res = mockRes();

      create(req, res)
        .then(() => {
          const jsonCalledWith = res.json.getCalls()[0].args[0];

          expect(jsonCalledWith.acknowledged).to.equal(true);
          done();
        })
        .catch(done);
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

      create(req, res)
        .then(() => {
          expect(res.status).to.be.calledWith(500);
          expect(res.json).to.be.calledWith({ acknowledged: false });
          expect(User.update.called).to.equal(false);
          done();
        })
        .catch(done);
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

      create(req, res, next)
        .then(() => {
          expect(User.update.called).to.equal(false);
          expect(next.calledOnce).to.equal(true);
          done();
        })
        .catch(done);
    });

    it('creates two new webhooks', (done) => {
      const { create } = teamCtrl;
      const request = {
        body: team,
        user
      };

      const req = mockReq(request);
      const res = mockRes();

      create(req, res)
        .then(() => {
          expect(Webhook.create.calledTwice).to.equal(true);
          done();
        })
        .catch(done);
    });
  });
});
