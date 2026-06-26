const { test } = require('node:test');
const assert = require('node:assert/strict');
const { summarizeDefenses } = require('../utils/scopeDefense');

test('summarizeDefenses totals identified vs. billed value', () => {
  const s = summarizeDefenses([
    { estimatedValue: 500, status: 'logged' },
    { estimatedValue: 1500, status: 'billed' },
    { estimatedValue: 300, status: 'waived' },
  ]);
  assert.equal(s.count, 3);
  assert.equal(s.totalIdentified, 2300);
  assert.equal(s.totalBilled, 1500);
  assert.deepEqual(s.byStatus, { logged: 1, billed: 1, waived: 1 });
});

test('summarizeDefenses handles an empty list', () => {
  const s = summarizeDefenses([]);
  assert.equal(s.count, 0);
  assert.equal(s.totalIdentified, 0);
  assert.equal(s.totalBilled, 0);
});

test('summarizeDefenses tolerates missing/garbage values', () => {
  const s = summarizeDefenses([
    { status: 'logged' },
    { estimatedValue: 'abc', status: 'billed' },
    { estimatedValue: 200, status: 'billed' },
  ]);
  assert.equal(s.totalIdentified, 200);
  assert.equal(s.totalBilled, 200);
  assert.equal(s.byStatus.billed, 2);
});

test('summarizeDefenses defaults to zero counts for unused statuses', () => {
  const s = summarizeDefenses([{ estimatedValue: 100, status: 'logged' }]);
  assert.equal(s.byStatus.billed, 0);
  assert.equal(s.byStatus.waived, 0);
});
