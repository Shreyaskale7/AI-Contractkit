// scopeService loads the Groq client at require-time, which needs a key set.
// These tests only exercise the pure helpers, so a placeholder key is fine.
process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-dummy-key';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  verifyClause,
  normalizeScopeResult,
  buildMessages,
  locateClause,
  resolveTone,
} = require('../services/scopeService');

const CONTRACT =
  '<h2>1. SCOPE</h2><p>The Contractor will design and develop a five (5) page marketing website.</p>' +
  '<h2>2. REVISIONS</h2><p>Two (2) rounds of revisions are included per page.</p>';

test('verifyClause matches text that exists in the contract, ignoring HTML/whitespace', () => {
  assert.equal(verifyClause('design and develop a five (5) page marketing website', CONTRACT), true);
  assert.equal(verifyClause('Two   (2) rounds of revisions', CONTRACT), true);
});

test('verifyClause rejects hallucinated / absent clauses', () => {
  assert.equal(verifyClause('the contractor will provide 24/7 phone support', CONTRACT), false);
});

test('verifyClause rejects clauses shorter than 10 chars', () => {
  assert.equal(verifyClause('scope', CONTRACT), false);
});

test('normalizeScopeResult coerces types and clamps confidence to [0,1]', () => {
  const r = normalizeScopeResult(
    { isOutOfScope: 'yes', confidence: 2, relevantClause: '', reasoning: 'x', draftEmail: 'y' },
    CONTRACT
  );
  assert.equal(r.isOutOfScope, true);
  assert.ok(r.confidence >= 0 && r.confidence <= 1);
});

test('normalizeScopeResult converts a percentage confidence to a fraction', () => {
  const r = normalizeScopeResult({ confidence: 80, relevantClause: '' }, CONTRACT);
  assert.equal(r.confidence, 0.8);
});

test('normalizeScopeResult flags and softens an unverified clause', () => {
  const r = normalizeScopeResult(
    { isOutOfScope: true, confidence: 0.95, relevantClause: 'a clause that is not in the contract at all' },
    CONTRACT
  );
  assert.equal(r.clauseVerified, false);
  assert.ok(r.confidence <= 0.5);
});

test('normalizeScopeResult keeps high confidence for a verified clause', () => {
  const r = normalizeScopeResult(
    { isOutOfScope: false, confidence: 0.9, relevantClause: 'Two (2) rounds of revisions are included per page' },
    CONTRACT
  );
  assert.equal(r.clauseVerified, true);
  assert.equal(r.confidence, 0.9);
});

test('normalizeScopeResult defaults gracefully on empty/garbage input', () => {
  const r = normalizeScopeResult(null, CONTRACT);
  assert.equal(r.isOutOfScope, false);
  assert.equal(r.confidence, 0.5);
  assert.equal(r.relevantClause, '');
});

test('buildMessages includes both the contract and the request, truncating long requests', () => {
  const msgs = buildMessages(CONTRACT, 'x'.repeat(5000));
  assert.equal(msgs[0].role, 'system');
  assert.equal(msgs[1].role, 'user');
  assert.ok(msgs[1].content.includes('SCOPE'));
  assert.ok(msgs[1].content.length < 5200); // request was capped at 4000 chars
});

test('buildMessages bakes the chosen tone into the system prompt', () => {
  const upsell = buildMessages(CONTRACT, 'anything', 'upsell')[0].content;
  const firm = buildMessages(CONTRACT, 'anything', 'firm')[0].content;
  assert.ok(upsell.includes('opportunity-framed'));
  assert.ok(firm.includes('firm and direct'));
});

test('resolveTone falls back to professional for unknown tones', () => {
  assert.equal(resolveTone('upsell'), 'upsell');
  assert.equal(resolveTone('nonsense'), 'professional');
  assert.equal(resolveTone(undefined), 'professional');
});

test('locateClause returns offsets and a highlighted context window', () => {
  const loc = locateClause('Two (2) rounds of revisions are included per page', CONTRACT);
  assert.ok(loc);
  assert.ok(loc.start >= 0 && loc.end > loc.start);
  assert.ok(loc.context.match.toLowerCase().includes('two (2) rounds'));
  assert.equal(typeof loc.context.before, 'string');
  assert.equal(typeof loc.context.after, 'string');
});

test('locateClause returns null for a clause not present in the contract', () => {
  assert.equal(locateClause('the contractor guarantees 99.9% uptime forever', CONTRACT), null);
});

test('normalizeScopeResult attaches clauseLocation + clauseContext for a verified clause', () => {
  const r = normalizeScopeResult(
    { isOutOfScope: false, confidence: 0.9, relevantClause: 'design and develop a five (5) page marketing website' },
    CONTRACT
  );
  assert.equal(r.clauseVerified, true);
  assert.ok(r.clauseLocation && Number.isInteger(r.clauseLocation.start));
  assert.ok(r.clauseContext && r.clauseContext.match.length > 0);
});

test('normalizeScopeResult leaves location null for an unverified clause', () => {
  const r = normalizeScopeResult(
    { isOutOfScope: true, confidence: 0.9, relevantClause: 'a clause that does not exist anywhere' },
    CONTRACT
  );
  assert.equal(r.clauseVerified, false);
  assert.equal(r.clauseLocation, null);
  assert.equal(r.clauseContext, null);
});
