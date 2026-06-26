// backend/eval/metrics.js
// Pure classification metrics for the Scope Creep Defender evaluation.
// Positive class = "out of scope" (isOutOfScope === true).

// Build a confusion matrix from arrays of booleans (predicted vs. expected).
const confusionMatrix = (predicted, expected) => {
  if (predicted.length !== expected.length) {
    throw new Error('predicted and expected must be the same length');
  }
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (let i = 0; i < predicted.length; i++) {
    const p = Boolean(predicted[i]);
    const e = Boolean(expected[i]);
    if (p && e) tp++;
    else if (p && !e) fp++;
    else if (!p && e) fn++;
    else tn++;
  }
  return { tp, fp, fn, tn };
};

const safeDiv = (a, b) => (b === 0 ? 0 : a / b);

// Compute accuracy / precision / recall / F1 from a confusion matrix.
const scores = ({ tp, fp, fn, tn }) => {
  const precision = safeDiv(tp, tp + fp);
  const recall = safeDiv(tp, tp + fn);
  const f1 = safeDiv(2 * precision * recall, precision + recall);
  const accuracy = safeDiv(tp + tn, tp + fp + fn + tn);
  return {
    accuracy: Number(accuracy.toFixed(4)),
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4)),
  };
};

// Convenience: go straight from boolean arrays to scores.
const evaluate = (predicted, expected) => scores(confusionMatrix(predicted, expected));

module.exports = { confusionMatrix, scores, evaluate, safeDiv };
