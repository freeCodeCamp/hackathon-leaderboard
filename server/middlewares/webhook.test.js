const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const { mockReq, mockRes } = require('sinon-express-mock');
const proxyquire = require('proxyquire');

const mockWebhookInstance = require('./__mocks__/mockWebhookInstance');
const mockPayload = require('./__mocks__/webhook-payload.json');
const mockHeaders = require('./__mocks__/webhook-headers.json');
const Webhook = require('../webhooks/webhook.model');

const { expect } = chai;
chai.use(sinonChai);

describe('Webhook middleware', () => {
  describe('verifyNetlifyOr403', () => {
    const mockWebhookId = mockWebhookInstance.id.slice(0);
    const mockWebhookBelongsTo = mockWebhookInstance.belongsTo.slice(0);
    let webhookMiddlewares;

    beforeEach(() => {
      sinon.stub(Webhook, 'findOne').resolves(mockWebhookInstance);
      webhookMiddlewares = proxyquire('./webhook', {
        '../webhooks/webhook.model': Webhook
      });
    });

    afterEach(() => {
      Webhook.findOne.restore();
    });

    it('sends a 400 when the webhookId is missing', (done) => {
      const { verifyNetlifyOr403 } = webhookMiddlewares;
      const request = {
        headers: mockHeaders,
        body: mockPayload,
        params: { webhookId: '' }
      };
      const req = mockReq(request);
      const res = mockRes({ req });

      verifyNetlifyOr403(req, res)
        .then(() => {
          expect(res.status).to.be.calledWith(400);
          expect(res.json).to.be.calledWith('The webhook ID is missing or malformed');
          done();
        })
        .catch(done);
    });

    it('sends a 400 when the webhookId is not the correct length', (done) => {
      const { verifyNetlifyOr403 } = webhookMiddlewares;
      const request = {
        headers: mockHeaders,
        body: mockPayload,
        params: { webhookId: 'not the right length' }
      };
      const req = mockReq(request);
      const res = mockRes({ req });

      verifyNetlifyOr403(req, res)
        .then(() => {
          expect(res.status).to.be.calledWith(400);
          expect(res.json).to.be.calledWith('The webhook ID is missing or malformed');
          done();
        })
        .catch(done);
    });

    it('sends a 403 when the signatures do not match', (done) => {
      const { verifyNetlifyOr403 } = webhookMiddlewares;
      const request = {
        headers: {
          ...mockHeaders,
          'x-webhook-signature': 'not-a-real-signature'
        },
        body: mockPayload,
        params: { webhookId: 'q6Cm1EpNMfx8BTLkEeteIqHv' }
      };
      const req = mockReq(request);
      const res = mockRes({ req });

      verifyNetlifyOr403(req, res)
        .then(() => {
          expect(res.sendStatus).to.be.calledWith(403);
          done();
        })
        .catch(done);
    });

    it('calls `next()` when the signatures match', (done) => {
      const { verifyNetlifyOr403 } = webhookMiddlewares;
      const request = {
        headers: mockHeaders,
        body: mockPayload,
        params: { webhookId: mockWebhookId }
      };
      const req = mockReq(request);
      const res = mockRes({ req });
      const next = sinon.spy();

      verifyNetlifyOr403(req, res, next)
        .then(() => {
          expect(next.called).to.equal(true);
          done();
        })
        .catch(done);
    });

    it('attaches the `belongsTo` team id to res.locals', (done) => {
      const { verifyNetlifyOr403 } = webhookMiddlewares;
      const request = {
        headers: mockHeaders,
        body: mockPayload,
        params: { webhookId: mockWebhookId }
      };
      const req = mockReq(request);
      const res = mockRes({ req });
      const next = sinon.spy();

      verifyNetlifyOr403(req, res, next)
        .then(() => {
          expect(res.locals.teamId).to.equal(mockWebhookBelongsTo);
          done();
        })
        .catch(done);
    });
  });
});
