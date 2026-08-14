// backend/utils/signatureVerify.js
// Independent verification of a signed contract's integrity.
//
// When a contract is signed we store a SHA-256 hash of its exact content.
// Re-hashing the stored content and comparing against that recorded hash
// proves whether the document has been altered since signing. Kept as a pure
// function so it can be unit-tested without a database.
const crypto = require('crypto');

const hashContent = (content) =>
  crypto.createHash('sha256').update(String(content ?? '')).digest('hex');

// Returns a verification report for a contract document.
//   status: 'valid'    — content matches the hash recorded at signing
//           'tampered' — content no longer matches the recorded hash
//           'unsigned' — the contract has not been signed yet
const verifyContractIntegrity = (contract) => {
  if (!contract) return { status: 'not_found', verified: false };

  const sig = contract.signature;
  if (!sig?.contentHash || !sig?.signedAt) {
    return { status: 'unsigned', verified: false, message: 'This contract has not been signed yet.' };
  }

  const currentHash = hashContent(contract.content);
  const verified = currentHash === sig.contentHash;

  return {
    status: verified ? 'valid' : 'tampered',
    verified,
    message: verified
      ? 'The document is unchanged since it was signed.'
      : 'WARNING: this document does not match the version that was signed.',
    recordedHash: sig.contentHash,
    currentHash,
    signedAt: sig.signedAt,
    signerName: sig.signerName || 'Client',
    signerEmail: sig.signerEmail || '',
    ip: sig.ip || '',
  };
};

module.exports = { hashContent, verifyContractIntegrity };
