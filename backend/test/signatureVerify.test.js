const { test } = require('node:test');
const assert = require('node:assert/strict');
const { hashContent, verifyContractIntegrity } = require('../utils/signatureVerify');

const CONTENT = '<h2>1. SCOPE</h2><p>The Contractor shall build a website.</p>';

const signedContract = (content, hash) => ({
  content,
  signature: {
    contentHash: hash ?? hashContent(content),
    signedAt: new Date('2026-06-22T10:30:00Z'),
    signerName: 'Acme Corp',
    signerEmail: 'ops@acme.com',
    ip: '203.0.113.42',
  },
});

test('hashContent is deterministic and produces a 64-char SHA-256 hex digest', () => {
  const a = hashContent(CONTENT);
  assert.equal(a, hashContent(CONTENT));
  assert.match(a, /^[a-f0-9]{64}$/);
});

test('hashContent changes when a single character changes', () => {
  assert.notEqual(hashContent(CONTENT), hashContent(CONTENT + ' '));
});

test('verifyContractIntegrity reports valid for an unmodified signed contract', () => {
  const r = verifyContractIntegrity(signedContract(CONTENT));
  assert.equal(r.status, 'valid');
  assert.equal(r.verified, true);
  assert.equal(r.recordedHash, r.currentHash);
});

test('verifyContractIntegrity detects tampering when content changed after signing', () => {
  // Signed with the original hash, but the stored content was altered afterwards.
  const c = signedContract('<p>ALTERED — pay ten times more.</p>', hashContent(CONTENT));
  const r = verifyContractIntegrity(c);
  assert.equal(r.status, 'tampered');
  assert.equal(r.verified, false);
  assert.notEqual(r.recordedHash, r.currentHash);
});

test('verifyContractIntegrity reports unsigned when there is no signature', () => {
  const r = verifyContractIntegrity({ content: CONTENT });
  assert.equal(r.status, 'unsigned');
  assert.equal(r.verified, false);
});

test('verifyContractIntegrity handles a missing contract', () => {
  const r = verifyContractIntegrity(null);
  assert.equal(r.status, 'not_found');
  assert.equal(r.verified, false);
});

test('verifyContractIntegrity surfaces signer metadata for the certificate', () => {
  const r = verifyContractIntegrity(signedContract(CONTENT));
  assert.equal(r.signerName, 'Acme Corp');
  assert.equal(r.signerEmail, 'ops@acme.com');
  assert.equal(r.ip, '203.0.113.42');
  assert.ok(r.signedAt);
});
