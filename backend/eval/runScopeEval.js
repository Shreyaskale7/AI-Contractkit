// backend/eval/runScopeEval.js
// Offline evaluation of the Scope Creep Defender against a labeled dataset.
// Run with:  npm run eval:scope   (requires GROQ_API_KEY in the environment)
//
// Reports accuracy / precision / recall / F1 plus the clause-verification rate
// (how often the model cited a clause that actually exists in the contract).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { analyzeScopeCreep } = require('../services/scopeService');
const { evaluate } = require('./metrics');

const DATASET = path.join(__dirname, 'scope-dataset.json');

const run = async () => {
  if (!process.env.GROQ_API_KEY) {
    console.error('✗ GROQ_API_KEY is not set — cannot run the live evaluation.');
    process.exit(1);
  }

  const { cases } = JSON.parse(fs.readFileSync(DATASET, 'utf8'));
  console.log(`Evaluating Scope Creep Defender on ${cases.length} labeled cases...\n`);

  const predicted = [];
  const expected = [];
  let verifiedCount = 0;
  let confidenceSum = 0;

  for (const c of cases) {
    try {
      const result = await analyzeScopeCreep({
        contractContent: c.contract,
        clientRequest: c.request,
      });
      predicted.push(result.isOutOfScope);
      expected.push(c.expectedOutOfScope);
      if (result.clauseVerified) verifiedCount++;
      confidenceSum += result.confidence;

      const ok = result.isOutOfScope === c.expectedOutOfScope ? '✓' : '✗';
      console.log(
        `${ok} ${c.id.padEnd(28)} pred=${String(result.isOutOfScope).padEnd(5)} ` +
        `exp=${String(c.expectedOutOfScope).padEnd(5)} conf=${result.confidence} ` +
        `clause=${result.clauseVerified ? 'verified' : 'unverified'}`
      );
    } catch (err) {
      console.error(`! ${c.id}: ${err.message}`);
      predicted.push(false);
      expected.push(c.expectedOutOfScope);
    }
  }

  const m = evaluate(predicted, expected);
  console.log('\n──────── Results ────────');
  console.log(`Accuracy            ${m.accuracy}`);
  console.log(`Precision           ${m.precision}`);
  console.log(`Recall              ${m.recall}`);
  console.log(`F1                  ${m.f1}`);
  console.log(`Clause verified     ${(verifiedCount / cases.length).toFixed(2)} of cases`);
  console.log(`Mean confidence     ${(confidenceSum / cases.length).toFixed(2)}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
