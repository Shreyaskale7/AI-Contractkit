import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicContract, signContract } from '../services/api';
import toast from 'react-hot-toast';

const PublicContract = () => {
  const { token }               = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [signing, setSigning]   = useState(false);
  const [signed, setSigned]     = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [signerName, setSignerName]   = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [isDrawing, setIsDrawing]     = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef(null);

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
    if (!hasSignature) return toast.error('Please draw your signature first');
    if (!signerName)   return toast.error('Please enter your name');

    setSigning(true);
    try {
      const canvas        = canvasRef.current;
      const signatureData = canvas.toDataURL('image/png');

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
    } catch {
      toast.error('Failed to sign contract');
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

          {/* Risk Flags */}
          {contract.riskFlags?.length > 0 && (
            <div style={{ background:'#fff7ed', borderBottom:'1px solid #fed7aa', padding:'14px 32px' }}>
              <div style={{ fontWeight:600, color:'#ea580c', marginBottom:6, fontSize:13 }}>
                ⚠️ {contract.riskFlags.length} Risk Flag{contract.riskFlags.length > 1 ? 's' : ''} Detected
              </div>
              {contract.riskFlags.map((flag, i) => (
                <div key={i} style={{ fontSize:12, color:'#9a3412', padding:'2px 0' }}>• {flag}</div>
              ))}
            </div>
          )}

          {/* Contract Content */}
          <div
            style={{ padding:'32px', fontFamily:'Georgia, serif', fontSize:14, lineHeight:1.8, color:'#1e293b' }}
            dangerouslySetInnerHTML={{ __html: contract.content }}
          />

          {/* Signature Section */}
          {signed ? (
            <div style={{ padding:'24px 32px', borderTop:'2px solid #f1f5f9' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>
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
            </div>
          ) : (
            <div style={{ padding:'24px 32px', borderTop:'2px solid #f1f5f9', textAlign:'center' }}>
              <p style={{ color:'#64748b', fontSize:14, marginBottom:16 }}>
                Please review the contract above carefully before signing.
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
                    style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, color:'#374151', marginBottom:4, fontWeight:500 }}>Email (optional)</label>
                  <input
                    value={signerEmail}
                    onChange={e => setSignerEmail(e.target.value)}
                    placeholder="john@example.com"
                    style={{ width:'100%', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', boxSizing:'border-box' }}
                  />
                </div>
              </div>

              {/* Canvas */}
              <div style={{ marginBottom:16 }}>
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
              </div>

              {/* Legal text */}
              <div style={{ background:'#f8fafc', borderRadius:8, padding:10, marginBottom:16, fontSize:11, color:'#64748b', lineHeight:1.6 }}>
                By signing, you agree that this electronic signature is legally binding and equivalent to your handwritten signature.
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:10 }}>
                <button
                  onClick={handleSign}
                  disabled={signing || !hasSignature}
                  style={{ flex:1, background:'#4f46e5', color:'white', border:'none', borderRadius:8, padding:'12px', fontSize:14, fontWeight:600, cursor:'pointer', opacity: (signing || !hasSignature) ? 0.6 : 1 }}>
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