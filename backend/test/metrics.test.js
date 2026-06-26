const { test } = require('node:test');
const assert = require('node:assert/strict');
const { confusionMatrix, scores, evaluate } = require('./../eval/metrics');

test('confusionMatrix counts tp/fp/fn/tn correctly', () => {
  const predicted = [true, true, false, false];
  const expected = [true, false, true, false];
  assert.deepEqual(confusionMatrix(predicted, expected), { tp: 1, fp: 1, fn: 1, tn: 1 });
});

test('confusionMatrix throws on length mismatch', () => {
  assert.throws(() => confusionMatrix([true], [true, false]));
});

test('scores computes a perfect classifier as 1.0 across the board', () => {
  const m = scores({ tp: 5, fp: 0, fn: 0, tn: 5 });
  assert.deepEqual(m, { accuracy: 1, precision: 1, recall: 1, f1: 1 });
});

test('scores avoids divide-by-zero', () => {
  const m = scores({ tp: 0, fp: 0, fn: 0, tn: 0 });
  assert.deepEqual(m, { accuracy: 0, precision: 0, recall: 0, f1: 0 });
});

test('evaluate goes from boolean arrays straight to scores', () => {
  const m = evaluate([true, true, false], [true, true, false]);
  assert.equal(m.accuracy, 1);
  assert.equal(m.f1, 1);
});
