import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicContract, getELI5Contract, signContract, addClientComment, API_BASE } from '../services/api';
import { sanitizeHtml } from '../utils/sanitize';
import toast from 'react-hot-toast';

// Render a typed name as a signature image so both signature modes
// produce the same base64 PNG format for the audit trail.
const typedSignatureToImage = (name) => {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 150;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1e293b';
  ctx.font = 'italic 48px "Brush Script MT", "Segoe Script", cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL('image/png');
};

const PublicContract = () => {
  const { token }               = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [signing, setSigning]   = useState(false);
  const [signed, setSigned]     = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [isELI5, setIsELI5]     = useState(false);
  const [eli5Loading, setEli5Loading] = useState(false);
  const [signerName, setSignerName]   = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [isDrawing, setIsDrawing]     = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signMode, setSignMode]       = useState('draw'); // 'draw' | 'type'
  const [typedName, setTypedName]     = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [commentNote, setCommentNote] = useState('');
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [submittingComment, setSubmittingComment] = useState(false);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await getPublicContract(token);
        setContract(res.data);
        if (res.data.status === 'signed') setSigned(true);
      } catch {
        toast.error('Contract not found');
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [token]);

  const toggleELI5 = async () => {
    if (!isELI5 && !contract.eli5Content) {
      setEli5Loading(true);
      try {
        const res = await getELI5Contract(token);
        setContract({ ...contract, eli5Content: res.data.content });
        setIsELI5(true);
      } catch {
        toast.error('Failed to translate contract');
      } finally {
        setEli5Loading(false);
      }
    } else {
      setIsELI5(!isELI5);
    }
  };

  // Handle Text Selection for Comments
  const handleSelection = () => {
    if (signed) return; // Don't allow comments on signed contracts

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 5 && contentRef.current && contentRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      // Clamp the popover inside the viewport so it never renders off-screen
      const popoverWidth = 300;
      const left = Math.max(
        12,
        Math.min(
          rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2,
          window.scrollX + document.documentElement.clientWidth - popoverWidth - 12
        )
      );
      setPopoverPos({ top: rect.bottom + window.scrollY + 10, left });
      setShowCommentBox(true);
    } else if (!showCommentBox || text.length === 0) {
      setShowCommentBox(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentNote.trim()) return toast.error('Please enter a comment');
    setSubmittingComment(true);
    try {
      const res = await addClientComment(token, { text: selectedText, note: commentNote });
      setContract({ ...contract, comments: res.data.comments });
      toast.success('Comment added successfully');
      setShowCommentBox(false);
      setCommentNote('');
      window.getSelection().removeAllRanges();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Canvas drawing functions
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e, canvas);
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (signMode === 'draw' && !hasSignature) return toast.error('Please draw your signature first');
    if (signMode === 'type' && !typedName.trim()) return toast.error('Please type your signature');
    if (!signerName) return toast.error('Please enter your name');

    setSigning(true);
    try {
      const signatureData = signMode === 'type'
        ? typedSignatureToImage(typedName.trim())
        : canvasRef.current.toDataURL('image/png');

      await signContract(token, {
        signatureData,
        signerName,
        signerEmail,
      });

      setSigned(true);
      setShowSign(false);
      toast.success('Contract signed successfully! ✅');

      // Refresh contract
      const res = await getPublicContract(token);
      setContract(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign contract');
    } finally {
      setSigning(false);
    }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:8 }}>⚡</div>
        <p style={{ color:'#94a3b8' }}>Loading contract...</p>
      </div>
    </div>
  );

  if (!contract) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:8 }}>❌</div>
        <p style={{ color:'#94a3b8' }}>Contract not found</p>
      </div>
    </div>
  );

  return (
    <div style={{ background:'#f8fafc', minHeight:'100vh', padding:'40px 20px' }}>
      <div style={{ maxWidth:800, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:24, fontWeight:700, color:'#4f46e5', marginBottom:4 }}>⚡ AI ContractKit</div>
          <p style={{ color:'#94a3b8', fontSize:14 }}>You have been sent a contract to review and sign</p>
        </div>

        {/* Contract Card */}
        <div style={{ background:'white', borderRadius:16, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', overflow:'hidden', marginBottom:24 }}>

          {/* Contract Header */}
          <div style={{ background:'linear-gradient(135deg, #4f46e5, #7c3aed)', padding:'24px 32px', color:'white' }}>
            <h1 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>{contract.title}</h1>
            <div style={{ fontSize:13, opacity:0.85, display:'flex', gap:20, flexWrap:'wrap' }}>
              <span>👤 {contract.userId?.businessName || contract.userId?.name}</span>
              <span>📅 {new Date(contract.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</span>
              {contract.clientId && <span>🤝 {contract.clientId.name}</span>}
            </div>
          </div>

          {/* Status Banner */}
          {signed && (
            <div style={{ background:'#f0fdf4', border:'1px solid #86efac', padding:'14px 32px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20 }}>✅</span>
              <div>
                <div style={{ fontWeight:600, color:'#16a34a' }}>Contract Signed</div>
                <div style={{ fontSize:12, color:'#64748b' }}>
                  Signed by {contract.signature?.signerName} on {new Date(contract.signature?.signedAt).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          )}

          {/* Expired Banner */}
          {contract.status === 'expired' && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', padding:'14px 32px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20 }}>⏰</span>
              <div>
                <div style={{ fontWeight:600, color:'#dc2626' }}>This contract has expired</div>
                <div style={{ fontSize:12, color:'#64748b' }}>Please contact the sender to request a new version.</div>
              </div>
            </div>
          )}

          {/* ELI5 Toggle */}
          <div style={{ padding: '16px 32px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>🧠 Plain English Mode</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Translate dense legal jargon into simple terms</div>
            </div>
            <button
              onClick={toggleELI5}
              disabled={eli5Loading}
              style={{
                background: isELI5 ? '#4f46e5' : '#e2e8f0',
                color: isELI5 ? 'white' : '#64748b',
                border: 'none',
                borderRadius: 20,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: eli5Loading ? 'wait' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {eli5Loading ? 'Translating...' : isELI5 ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {/* Contract Content */}
          <div
            ref={contentRef}
            onMouseUp={handleSelection}
            style={{ padding:'32px', fontFamily:'Georgia, serif', fontSize:14, lineHeight:1.8, color:'#1e293b', position: 'relative' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(isELI5 ? contract.eli5Content : contract.content) }}
          />

          {/* Comment Popover */}
          {showCommentBox && (
            <div style={{
              position: 'absolute',
              top: popoverPos.top,
              left: popoverPos.left,
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              padding: 16,
              width: 300,
              zIndex: 100,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#4f46e5' }}>Request a Change</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, fontStyle: 'italic', background: '#f8fafc', padding: 8, borderRadius: 4, maxHeight: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{selectedText}"
              </div>
              <textarea
                value={commentNote}
                onChange={e => setCommentNote(e.target.value)}
                placeholder="What would you like to change about this clause?"
                style={{ width: '100%', height: 60, border: '1px solid #e2e8f0', borderRadius: 6, padding: 8, fontSize: 12, marginBottom: 12, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCommentBox(false)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddComment} disabled={submittingComment} style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: 4, padding: '6px 12px', fontSize: 12, cursor: submittingComment ? 'not-allowed' : 'pointer' }}>
                  {submittingComment ? 'Saving...' : 'Add Comment'}
                </button>
              </div>
            </div>
          )}

          {/* Existing Comments Inline Display (Optional: show at the end of the contract for public view) */}
          {contract.comments?.length > 0 && (
            <div style={{ padding: '0 32px 32px 32px' }}>
              <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Pending Negotiation Points ({contract.comments.filter(c => c.status === 'open').length})</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {contract.comments.map(c => (
                    <div key={c.id} style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, background: c.status === 'resolved' ? '#f0fdf4' : 'white', opacity: c.status === 'resolved' ? 0.7 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>{c.status === 'resolved' ? '✅ Resolved' : '📝 Open Request'}</span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#1e293b', marginBottom: 4 }}><strong>Request:</strong> {c.note}</div>
                      <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>Original: "{c.text.substring(0, 80)}{c.text.length > 80 ? '...' : ''}"</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Signature Section */}
          {signed ? (
            <div style={{ padding:'24px 32px', borderTop:'2px solid #f1f5f9' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:40 }}>
                <div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Freelancer Signature</div>
                  <div style={{ borderBottom:'1px solid #1e293b', paddingBottom:8, marginBottom:4, color:'#94a3b8', fontStyle:'italic' }}>
                    {contract.userId?.name}
                  </div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{contract.userId?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize:12, color:'#94a3b8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.5px' }}>Client Signature</div>
                  {contract.signature?.data && (
                    <img src={contract.signature.data} alt="Signature" style={{ height:50, borderBottom:'1px solid #1e293b', display:'block', marginBottom:4 }} />
                  )}
                  <div style={{ fontSize:11, color:'#94a3b8' }}>{contract.signature?.signerName}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>Signed: {new Date(contract.signature?.signedAt).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Audit Trail Section */}
              <div style={{ marginTop: '32px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔒</span> Cryptographic Audit Trail
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>Signer IP Address:</span>
                    <span style={{ fontFamily: 'monospace' }}>{contract.signature?.ip || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>Browser/Device:</span>
                    <span style={{ fontFamily: 'monospace', textAlign: 'right', maxWidth: '70%' }}>{contract.signature?.userAgent || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 500 }}>Content Hash (SHA-256):</span>
                    <span style={{ fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '70%', textAlign: 'right', color: '#4f46e5' }}>
                      {contract.signature?.contentHash || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <a
                  href={`${API_BASE}/contracts/public/${token}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display:'inline-block', background:'white', color:'#4f46e5', border:'1px solid #4f46e5', borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:600, cursor:'pointer', textDecoration:'none' }}>
                  ⬇️ Download PDF
                </a>
              </div>
            </div>
          ) : contract.status === 'expired' ? null : (
            <div style={{ padding:'24px 32px', borderTop:'2px solid #f1f5f9', textAlign:'center' }}>
              <p style={{ color:'#64748b', fontSize:14, marginBottom:16 }}>
                Please review the contract above carefully before signing.
                {contract.validUntil && (
                  <span style={{ display:'block', marginTop:6, fontSize:12, color:'#94a3b8' }}>
                    ⏰ Valid until {new Date(contract.validUntil).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                  </span>
                )}
              </p>
              <button
                onClick={() => setShowSign(true)}
                style={{ background:'#4f46e5', color:'white', border:'none', borderRadius:10, padding:'14px 40px', fontSize:15, fontWeight:600, cursor:'pointer' }}>
                ✍️ Sign This Contract
              </button>
            </div>
          )}
        </div>

        {/* Signature Modal */}
        {showSign && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
            <div style={{ background:'white', borderRadius:16, padding:28, width:'100%', maxWidth:520, boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
              <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>✍️ Sign Contract</h2>
              <p style={{ color:'#94a3b8', fontSize:13, marginBottom:20 }}>Draw your signature below using your mouse or finger.</p>

              {/* Name + Email */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, color:'#374151', marginBottom:4, fontWeight:500 }}>Your Full Name *</label>
                  <input
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    placeholder="John Smith"
                    style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, color:'#374151', marginBottom:4, fontWeight:500 }}>Email (optional)</label>
                  <input
                    value={signerEmail}
                    onChange={e => setSignerEmail(e.target.value)}
                    placeholder="john@example.com"
                    style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box', color:'#1e293b', background:'#fff' }}
                  />
                </div>
              </div>

              {/* Signature input — draw or type */}
              <div style={{ marginBottom:16 }}>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {['draw', 'type'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSignMode(m)}
                      style={{
                        flex:1, padding:'8px 0', fontSize:13, fontWeight:600, cursor:'pointer', borderRadius:8,
                        border: signMode === m ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                        background: signMode === m ? '#eef2ff' : 'white',
                        color: signMode === m ? '#4f46e5' : '#64748b',
                      }}>
                      {m === 'draw' ? '✍️ Draw' : '⌨️ Type'}
                    </button>
                  ))}
                </div>

                {signMode === 'draw' ? (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <label style={{ fontSize:12, color:'#374151', fontWeight:500 }}>Draw Signature *</label>
                      <button onClick={clearSignature} style={{ background:'none', border:'none', color:'#94a3b8', fontSize:12, cursor:'pointer' }}>Clear</button>
                    </div>
                    <canvas
                      ref={canvasRef}
                      width={460}
                      height={150}
                      style={{ border:'2px dashed #e2e8f0', borderRadius:8, cursor:'crosshair', touchAction:'none', width:'100%', background:'#fafafa' }}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    <p style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Sign above using your mouse or finger (on mobile)</p>
                  </>
                ) : (
                  <>
                    <label style={{ display:'block', fontSize:12, color:'#374151', marginBottom:6, fontWeight:500 }}>Type Your Signature *</label>
                    <input
                      value={typedName}
                      onChange={e => setTypedName(e.target.value)}
                      placeholder="Type your full name"
                      style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 12px', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:8, color:'#1e293b', background:'#fff' }}
                    />
                    <div style={{ border:'2px dashed #e2e8f0', borderRadius:8, background:'#fafafa', height:90, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'"Brush Script MT", "Segoe Script", cursive', fontStyle:'italic', fontSize:34, color:'#1e293b', overflow:'hidden', padding:'0 12px' }}>
                      {typedName || <span style={{ fontSize:13, fontFamily:'inherit', color:'#cbd5e1' }}>Signature preview</span>}
                    </div>
                  </>
                )}
              </div>

              {/* Legal text */}
              <div style={{ background:'#f8fafc', borderRadius:8, padding:10, marginBottom:16, fontSize:11, color:'#64748b', lineHeight:1.6 }}>
                By signing, you create an electronic record of your agreement to this document. Your signature is stored with a timestamp and a tamper-evidence hash of the exact contract content.
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:10 }}>
                <button
                  onClick={handleSign}
                  disabled={signing || (signMode === 'draw' ? !hasSignature : !typedName.trim())}
                  style={{ flex:1, background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'12px', fontSize:14, fontWeight:600, cursor:'pointer', opacity: (signing || (signMode === 'draw' ? !hasSignature : !typedName.trim())) ? 0.6 : 1 }}>
                  {signing ? 'Signing...' : '✅ Confirm Signature'}
                </button>
                <button
                  onClick={() => setShowSign(false)}
                  style={{ background:'white', border:'1px solid #e2e8f0', color:'#64748b', borderRadius:8, padding:'12px 20px', fontSize:14, cursor:'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign:'center', color:'#94a3b8', fontSize:12, marginTop:16 }}>
          Powered by ⚡ AI ContractKit · Secure & Legally Binding
        </div>
      </div>
    </div>
  );
};

export default PublicContract;