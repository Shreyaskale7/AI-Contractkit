import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyContract } from '../services/api';

// Public, no-login-required page that independently re-verifies a signed
// contract: the server re-hashes the stored content and compares it against
// the SHA-256 hash recorded at the moment of signing.
const VerifyContract = () => {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyContract(token)
      .then((res) => setResult(res.data))
      .catch((err) => setResult(err.response?.data || { status: 'error', verified: false, message: 'Could not verify this document.' }))
      .finally(() => setLoading(false));
  }, [token]);

  const theme = {
    valid:    { icon: '✓', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Verified — document intact' },
    tampered: { icon: '✕', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: 'Verification failed — content changed' },
    unsigned: { icon: '○', color: '#b45309', bg: '#fffbeb', border: '#fde68a', label: 'Not yet signed' },
    not_found:{ icon: '?', color: '#57534e', bg: '#fafaf9', border: '#e7e5e4', label: 'Document not found' },
    error:    { icon: '!', color: '#57534e', bg: '#fafaf9', border: '#e7e5e4', label: 'Verification unavailable' },
  }[result?.status] || { icon: '!', color: '#57534e', bg: '#fafaf9', border: '#e7e5e4', label: 'Verification unavailable' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--saas-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 620 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--saas-text-secondary)', fontWeight: 600 }}>
            AI ContractKit
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--saas-text)', marginTop: 6 }}>
            Document verification
          </h1>
        </div>

        {loading ? (
          <div className="card card-body" style={{ textAlign: 'center', color: 'var(--saas-text-secondary)' }}>
            Verifying document integrity…
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ background: theme.bg, borderBottom: `1px solid ${theme.border}`, padding: '22px 24px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: theme.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                {theme.icon}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: theme.color }}>{theme.label}</div>
                <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{result?.message}</div>
              </div>
            </div>

            <div style={{ padding: '20px 24px', display: 'grid', gap: 14 }}>
              {result?.title && <Row label="Document" value={result.title} />}
              {result?.provider && <Row label="Service provider" value={result.provider} />}
              {result?.client && <Row label="Client" value={result.client} />}
              {result?.signerName && <Row label="Signed by" value={result.signerName} />}
              {result?.signerEmail && <Row label="Signer email" value={result.signerEmail} />}
              {result?.signedAt && <Row label="Signed at" value={new Date(result.signedAt).toLocaleString('en-IN')} />}
              {result?.recordedHash && <Row label="Hash at signing" value={result.recordedHash} mono />}
              {result?.currentHash && <Row label="Hash now" value={result.currentHash} mono />}
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--saas-border)', fontSize: 12, color: 'var(--saas-text-secondary)', lineHeight: 1.6 }}>
              Verification re-computes a SHA-256 hash of the stored document and compares it to the hash
              recorded when the contract was signed. Matching hashes prove the content has not changed since signing.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Row = ({ label, value, mono }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, alignItems: 'start' }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--saas-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontSize: 13, color: 'var(--saas-text)', wordBreak: 'break-all', fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit' }}>{value}</div>
  </div>
);

export default VerifyContract;
