const EmptyState = ({ icon, title, description, actionLabel, actionTo }) => (
  <div style={{ textAlign:'center', padding:'60px 40px', color:'#94a3b8' }}>
    <div style={{ fontSize:56, marginBottom:16, filter:'grayscale(0.3)' }}>{icon}</div>
    <div style={{ fontSize:16, fontWeight:600, color:'#1e293b', marginBottom:8 }}>{title}</div>
    <div style={{ fontSize:13, color:'#94a3b8', marginBottom:24, maxWidth:300, margin:'0 auto 24px' }}>{description}</div>
    {actionLabel && actionTo && (
      <a href={actionTo} style={{ background:'#6366f1', color:'white', padding:'10px 24px', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none', display:'inline-block' }}>
        {actionLabel}
      </a>
    )}
  </div>
);

export default EmptyState;
