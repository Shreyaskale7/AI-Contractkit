// backend/utils/textSimilarity.js
// Pure, dependency-free text-similarity math used by the contract similarity
// index. Kept separate from the storage layer so it can be unit-tested in
// isolation (no DB, no network).
//
// We use TF-IDF weighted cosine similarity: term frequency captures how often
// a word appears in a document, while inverse document frequency down-weights
// words that are common across the whole corpus (e.g. "contract", "client",
// "payment"), so matches are driven by the genuinely distinguishing terms.

// Tokenize text into lowercase words >3 chars, stripping HTML and punctuation.
const tokenize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);

// { term: count } term-frequency map for a single document.
const termFrequency = (text) => {
  const freq = {};
  for (const w of tokenize(text)) freq[w] = (freq[w] || 0) + 1;
  return freq;
};

// Build an IDF map from a corpus of term-frequency maps.
// idf = ln((N + 1) / (df + 1)) + 1  (smoothed so unseen/global terms stay finite).
const buildIdf = (tfMaps) => {
  const N = tfMaps.length;
  const df = {};
  for (const tf of tfMaps) {
    for (const term of Object.keys(tf)) df[term] = (df[term] || 0) + 1;
  }
  const idf = {};
  for (const term of Object.keys(df)) {
    idf[term] = Math.log((N + 1) / (df[term] + 1)) + 1;
  }
  return idf;
};

// Weight a term-frequency map by IDF → { term: tf * idf }.
// Terms absent from idf (e.g. a query word never seen in the corpus) get idf 1.
const tfidf = (tf, idf) => {
  const out = {};
  for (const term of Object.keys(tf)) {
    out[term] = tf[term] * (idf[term] != null ? idf[term] : 1);
  }
  return out;
};

// Cosine similarity between two sparse weight vectors. Range [0, 1] for
// non-negative weights; 0 when either vector is empty.
const cosineSimilarity = (v1, v2) => {
  let dot = 0, mag1 = 0, mag2 = 0;
  for (const k of Object.keys(v1)) {
    mag1 += v1[k] * v1[k];
    if (v2[k]) dot += v1[k] * v2[k];
  }
  for (const k of Object.keys(v2)) mag2 += v2[k] * v2[k];
  return mag1 && mag2 ? dot / (Math.sqrt(mag1) * Math.sqrt(mag2)) : 0;
};

// Rank documents by TF-IDF cosine similarity to a query.
// `docs` is [{ id, content, tf }]; returns the same objects with a `score`,
// highest first. IDF is computed across the supplied docs.
const rankByTfIdf = (queryText, docs, limit = docs.length) => {
  if (!docs.length) return [];
  const idf = buildIdf(docs.map((d) => d.tf || termFrequency(d.content)));
  const queryVec = tfidf(termFrequency(queryText), idf);
  return docs
    .map((d) => ({
      ...d,
      score: cosineSimilarity(queryVec, tfidf(d.tf || termFrequency(d.content), idf)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

module.exports = { tokenize, termFrequency, buildIdf, tfidf, cosineSimilarity, rankByTfIdf };
