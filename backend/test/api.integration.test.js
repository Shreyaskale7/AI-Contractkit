// backend/test/api.integration.test.js
// End-to-end API tests against a real (in-memory) MongoDB. These cover the
// properties that matter most for a multi-tenant SaaS — auth, per-user data
// isolation, public-view redaction, signed-contract immutability, and the
// scope-defense endpoints — without invoking any paid AI calls (contracts are
// seeded directly via the models, and the immutability guard returns before
// the LLM is ever called).
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-dummy-key';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const app = require('../app');
const Contract = require('../models/Contract');
const Client = require('../models/Client');

const auth = (token) => ['Authorization', `Bearer ${token}`];

let mongod;
const userA = {};
const userB = {};
let contractA; // owned by user A
let signedContract; // owned by user A, status 'signed'

before(async () => {
  // launchTimeout is generous because mongod can be slow to boot on cold
  // CI runners / Windows (antivirus scanning the binary). 60s is plenty.
  mongod = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
  await mongoose.connect(mongod.getUri());

  const a = await request(app).post('/api/auth/register')
    .send({ name: 'Alice', email: 'alice@test.com', password: 'password123' });
  userA.token = a.body.token;
  userA.id = a.body._id;

  const b = await request(app).post('/api/auth/register')
    .send({ name: 'Bob', email: 'bob@test.com', password: 'password123' });
  userB.token = b.body.token;
  userB.id = b.body._id;

  const client = await Client.create({ userId: userA.id, name: 'Acme', email: 'acme@x.com' });

  contractA = await Contract.create({
    userId: userA.id,
    clientId: client._id,
    title: 'Alice Contract',
    content: '<p>Confidential contract body</p>',
    aiPrompt: 'the private prompt',
    riskAnalysis: [{ originalText: 'x', riskLevel: 'high', reasoning: 'uncapped liability' }],
    versions: [{ content: '<p>old</p>', instruction: 'tweak', changedBy: 'refine' }],
    publicToken: 'tok_public_a',
  });

  signedContract = await Contract.create({
    userId: userA.id,
    clientId: client._id,
    title: 'Signed Contract',
    content: '<p>signed body</p>',
    status: 'signed',
    publicToken: 'tok_signed_a',
  });
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

// ─────────────── Auth ───────────────

test('register returns a token and omits the password hash', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'Carol', email: 'carol@test.com', password: 'password123' });
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.email, 'carol@test.com');
  assert.equal(res.body.passwordHash, undefined);
});

test('register rejects a short password', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'X', email: 'short@test.com', password: 'short' });
  assert.equal(res.status, 400);
});

test('register rejects a malformed email', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'X', email: 'not-an-email', password: 'password123' });
  assert.equal(res.status, 400);
});

test('register rejects a duplicate email', async () => {
  const res = await request(app).post('/api/auth/register')
    .send({ name: 'Alice2', email: 'alice@test.com', password: 'password123' });
  assert.equal(res.status, 400);
});

test('login succeeds with correct credentials and fails with wrong ones', async () => {
  const ok = await request(app).post('/api/auth/login')
    .send({ email: 'alice@test.com', password: 'password123' });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);

  const bad = await request(app).post('/api/auth/login')
    .send({ email: 'alice@test.com', password: 'wrongpass' });
  assert.equal(bad.status, 401);
});

test('GET /me requires a valid token', async () => {
  const noToken = await request(app).get('/api/auth/me');
  assert.equal(noToken.status, 401);

  const withToken = await request(app).get('/api/auth/me').set(...auth(userA.token));
  assert.equal(withToken.status, 200);
  assert.equal(withToken.body.email, 'alice@test.com');
});

// ─────────────── Per-user data isolation ───────────────

test('contract list is scoped to the owner', async () => {
  const a = await request(app).get('/api/contracts').set(...auth(userA.token));
  assert.equal(a.status, 200);
  assert.ok(a.body.some((c) => c._id === contractA.id.toString()));

  const b = await request(app).get('/api/contracts').set(...auth(userB.token));
  assert.equal(b.status, 200);
  assert.ok(!b.body.some((c) => c._id === contractA.id.toString()));
});

test('a user cannot read another user\'s contract by id', async () => {
  const mine = await request(app).get(`/api/contracts/${contractA.id}`).set(...auth(userA.token));
  assert.equal(mine.status, 200);

  const theirs = await request(app).get(`/api/contracts/${contractA.id}`).set(...auth(userB.token));
  assert.equal(theirs.status, 404);
});

test('a user cannot delete another user\'s contract', async () => {
  // The scoped delete is a no-op for a non-owner; the contract must survive.
  await request(app).delete(`/api/contracts/${contractA.id}`).set(...auth(userB.token));
  const stillThere = await request(app).get(`/api/contracts/${contractA.id}`).set(...auth(userA.token));
  assert.equal(stillThere.status, 200);
});

// ─────────────── Public-view redaction ───────────────

test('the public contract view strips private fields', async () => {
  const res = await request(app).get('/api/contracts/public/tok_public_a');
  assert.equal(res.status, 200);
  assert.ok(res.body.content); // public content is present
  assert.equal(res.body.riskAnalysis, undefined);
  assert.equal(res.body.aiPrompt, undefined);
  assert.equal(res.body.versions, undefined);
});

// ─────────────── Signed-contract immutability ───────────────

test('a signed contract cannot be refined (409, before any AI call)', async () => {
  const res = await request(app)
    .post(`/api/contracts/${signedContract.id}/refine`)
    .set(...auth(userA.token))
    .send({ instruction: 'change the payment terms' });
  assert.equal(res.status, 409);
});

// ─────────────── Scope-defense endpoints ───────────────

test('logging a scope defense and reading the summary is owner-scoped', async () => {
  const log = await request(app)
    .post(`/api/contracts/${contractA.id}/scope-defense`)
    .set(...auth(userA.token))
    .send({ estimatedValue: 1000, requestText: 'build a mobile app too', isOutOfScope: true });
  assert.equal(log.status, 201);

  const summaryA = await request(app).get('/api/contracts/scope-defenses').set(...auth(userA.token));
  assert.equal(summaryA.status, 200);
  assert.equal(summaryA.body.summary.count, 1);
  assert.equal(summaryA.body.summary.totalIdentified, 1000);

  const summaryB = await request(app).get('/api/contracts/scope-defenses').set(...auth(userB.token));
  assert.equal(summaryB.body.summary.count, 0);
});

test('a user cannot log a scope defense on another user\'s contract', async () => {
  const res = await request(app)
    .post(`/api/contracts/${contractA.id}/scope-defense`)
    .set(...auth(userB.token))
    .send({ estimatedValue: 500 });
  assert.equal(res.status, 404);
});
