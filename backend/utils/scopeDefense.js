// backend/utils/scopeDefense.js
// Pure aggregation for "revenue protected" by the Scope Creep Defender.
// Kept separate from the DB layer so it can be unit-tested directly.

// Summarize a list of logged scope defenses.
//   totalIdentified — value of all out-of-scope work the user flagged
//   totalBilled     — value they actually converted into a paid add-on
//   byStatus        — counts per status (logged / billed / waived)
const summarizeDefenses = (defenses = []) => {
  const summary = {
    count: defenses.length,
    totalIdentified: 0,
    totalBilled: 0,
    byStatus: { logged: 0, billed: 0, waived: 0 },
  };
  for (const d of defenses) {
    const value = Number(d.estimatedValue) || 0;
    summary.totalIdentified += value;
    if (d.status === 'billed') summary.totalBilled += value;
    if (summary.byStatus[d.status] != null) summary.byStatus[d.status] += 1;
    else summary.byStatus[d.status] = 1;
  }
  return summary;
};

module.exports = { summarizeDefenses };
