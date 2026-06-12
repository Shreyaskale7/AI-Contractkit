import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { getContractById, resolveCommentWithAI, revertContract, markContractSent, downloadContractPdf } from '../services/api';
import { sanitizeHtml, highlightRisks } from '../utils/sanitize';
import toast from 'react-hot-toast';

const ContractView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [reverting, setReverting] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await getContractById(id);
        setContract(res.data);
      } catch (error) {
        toast.error('Failed to load contract');
        navigate('/contracts');
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [id, navigate]);

  const handleResolve = async (commentId) => {
    setResolvingId(commentId);
    try {
      const res = await resolveCommentWithAI(id, commentId);
      setContract({ ...contract, content: res.data.content, comments: res.data.comments });
      toast.success('Clause rewritten successfully! ✨');
    } catch (error) {
      toast.error('Failed to resolve comment');
    } finally {
      setResolvingId(null);
    }
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/contract/public/${contract.publicToken}`);
    toast.success('Public link copied!');
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadContractPdf(id, `${contract.title || 'contract'}.pdf`);
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await markContractSent(id);
      setContract({ ...contract, status: res.data.status });
      copyPublicLink();
      toast.success('Marked as sent — link copied to clipboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as sent');
    } finally {
      setSending(false);
    }
  };

  const handleRevert = async () => {
    setReverting(true);
    try {
      const res = await revertContract(id);
      setContract({ ...contract, content: res.data.content, versions: res.data.versions });
      toast.success('Restored previous version');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revert');
    } finally {
      setReverting(false);
    }
  };

  if (loading) return <PageShell title="Contract"><div className="table-empty">Loading contract...</div></PageShell>;
  if (!contract) return null;

  const openComments = contract.comments?.filter(c => c.status === 'open') || [];
  const resolvedComments = contract.comments?.filter(c => c.status === 'resolved') || [];

  return (
    <PageShell
      title={contract.title}
      subtitle={`Client: ${contract.clientId?.name} | Status: ${contract.status.toUpperCase()}`}
      actions={
        <>
          {contract.versions?.length > 0 && contract.status !== 'signed' && (
            <button onClick={handleRevert} disabled={reverting} className="btn btn-secondary">
              {reverting ? 'Restoring…' : '↩ Undo last AI edit'}
            </button>
          )}
          <button onClick={handleDownloadPdf} disabled={downloading} className="btn btn-secondary">
            {downloading ? 'Preparing…' : '⬇ PDF'}
          </button>
          <button onClick={copyPublicLink} className="btn btn-secondary">🔗 Copy Public Link</button>
          {contract.status === 'draft' && (
            <button onClick={handleSend} disabled={sending} className="btn btn-primary">
              {sending ? 'Sending…' : '📤 Send to Client'}
            </button>
          )}
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
        
        {/* Document Viewer */}
        <div className="card" style={{ background: 'white', borderRadius: 16, padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div style={{ paddingBottom: 20, borderBottom: '2px solid #f1f5f9', marginBottom: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Contract Document</h2>
            <span className={`status-badge badge-${contract.status}`}>{contract.status}</span>
          </div>

          {contract.riskAnalysis?.length > 0 && (
            <div style={{ marginBottom: 24, padding: 16, background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ea580c', marginBottom: 12 }}>
                ⚠️ Dynamic Risk Heatmap
              </h3>
              <div style={{ display: 'grid', gap: 10 }}>
                {contract.riskAnalysis.map((risk, idx) => (
                  <div key={idx} style={{ background: 'white', padding: 12, borderRadius: 6, borderLeft: `4px solid ${risk.riskLevel === 'high' ? '#ef4444' : risk.riskLevel === 'medium' ? '#f59e0b' : '#3b82f6'}` }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4, textTransform: 'uppercase' }}>
                      {risk.riskLevel} RISK
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{risk.reasoning}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>"{risk.originalText}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contract.status === 'signed' && (
            <div style={{ marginBottom: 20, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, fontSize: 13, color: '#15803d' }}>
              🔒 This contract is signed and locked — its content can no longer be edited (the signature is bound to a hash of this exact text).
            </div>
          )}

          <div
            style={{ fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.8, color: '#1e293b' }}
            dangerouslySetInnerHTML={{ __html: highlightRisks(sanitizeHtml(contract.content), contract.riskAnalysis) }}
          />
        </div>

        {/* Negotiation Sidebar */}
        <div className="card" style={{ padding: 24, background: '#f8fafc', borderRadius: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            💬 Negotiation Table
            {openComments.length > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: 11, padding: '2px 8px', borderRadius: 12 }}>{openComments.length} Open</span>}
          </h3>

          {openComments.length === 0 && resolvedComments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: 13 }}>
              No comments yet. Send the public link to your client to begin review.
            </div>
          )}

          {openComments.length > 0 && (
            <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>Pending Requests</h4>
              {openComments.map(c => (
                <div key={c.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', marginBottom: 8 }}>"{c.note}"</div>
                  <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', background: '#f1f5f9', padding: 8, borderRadius: 4, marginBottom: 12, maxHeight: 60, overflow: 'hidden' }}>
                    Clause: {c.text}
                  </div>
                  <button 
                    onClick={() => handleResolve(c.id)}
                    disabled={resolvingId === c.id || contract.status === 'signed'}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', border: 'none', borderRadius: 6, padding: '8px 0', fontSize: 13, fontWeight: 600, cursor: resolvingId === c.id ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}
                  >
                    {resolvingId === c.id ? '✨ Rewriting with AI...' : '✨ AI Resolve'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {contract.versions?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0', paddingBottom: 8, marginBottom: 12 }}>
                Edit History ({contract.versions.length})
              </h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {[...contract.versions].reverse().map((v, i) => (
                  <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, fontSize: 12, color: '#475569' }}>
                    <div style={{ fontWeight: 500 }}>{v.changedBy === 'comment-resolve' ? '💬 Client request' : '✨ AI refine'}</div>
                    {v.instruction && <div style={{ fontStyle: 'italic', marginTop: 2 }}>"{v.instruction.slice(0, 100)}{v.instruction.length > 100 ? '…' : ''}"</div>}
                    <div style={{ color: '#94a3b8', marginTop: 4 }}>{new Date(v.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resolvedComments.length > 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>Resolved</h4>
              {resolvedComments.map(c => (
                <div key={c.id} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 12, opacity: 0.8 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#16a34a', marginBottom: 4 }}>"{c.note}"</div>
                  <div style={{ fontSize: 11, color: '#15803d' }}>✅ Automatically rewritten by AI</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
};

export default ContractView;
