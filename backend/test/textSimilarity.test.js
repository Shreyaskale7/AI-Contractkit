const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  termFrequency,
  buildIdf,
  tfidf,
  cosineSimilarity,
  rankByTfIdf,
} = require('../utils/textSimilarity');

test('termFrequency counts words >3 chars and strips HTML/punctuation', () => {
  const tf = termFrequency('<p>Payment payment, the API!</p>');
  assert.equal(tf.payment, 2);
  assert.equal(tf.api, undefined); // "api" is 3 chars → filtered out
  assert.equal(tf.the, undefined); // also too short
});

test('buildIdf down-weights terms common to every document', () => {
  const corpus = [
    termFrequency('payment milestone delivery'),
    termFrequency('payment hosting deployment'),
    termFrequency('payment revision rounds'),
  ];
  const idf = buildIdf(corpus);
  // "payment" appears in all 3 docs → lower idf than a unique term.
  assert.ok(idf.payment < idf.milestone);
});

test('cosineSimilarity is 1 for identical vectors and 0 for disjoint', () => {
  const a = { web: 1, design: 2 };
  assert.equal(Number(cosineSimilarity(a, a).toFixed(6)), 1);
  assert.equal(cosineSimilarity({ web: 1 }, { mobile: 1 }), 0);
});

test('cosineSimilarity returns 0 when a vector is empty', () => {
  assert.equal(cosineSimilarity({}, { web: 1 }), 0);
});

test('rankByTfIdf ranks the most topically similar document first', () => {
  const docs = [
    { id: 'a', content: 'mobile android ios flutter application development' },
    { id: 'b', content: 'website react frontend backend express database' },
    { id: 'c', content: 'logo branding design illustration typography' },
  ].map((d) => ({ ...d, tf: termFrequency(d.content) }));

  const ranked = rankByTfIdf('react website frontend build', docs, 3);
  assert.equal(ranked[0].id, 'b');
  assert.ok(ranked[0].score >= ranked[1].score);
});

test('rankByTfIdf handles an empty corpus', () => {
  assert.deepEqual(rankByTfIdf('anything', [], 3), []);
});

test('tfidf falls back to idf 1 for unseen query terms', () => {
  const weighted = tfidf({ unseenword: 2 }, {});
  assert.equal(weighted.unseenword, 2);
});
