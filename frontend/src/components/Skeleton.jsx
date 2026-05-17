const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, style = {} }) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style
  }} />
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div>
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 20px', borderBottom: '1px solid #f8fafc', alignItems: 'center' }}>
        <Skeleton width={32} height={32} borderRadius={50} />
        <div style={{ flex: 1 }}>
          <Skeleton width="40%" height={13} style={{ marginBottom: 6 }} />
          <Skeleton width="25%" height={11} />
        </div>
        <Skeleton width={60} height={22} borderRadius={20} />
        <Skeleton width={80} height={28} borderRadius={6} />
      </div>
    ))}
  </div>
);

export const StatCardSkeleton = () => (
  <div style={{ background: 'white', borderRadius: 12, padding: '20px 24px', border: '1px solid #f1f5f9' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <Skeleton width="50%" height={13} />
      <Skeleton width={36} height={36} borderRadius={10} />
    </div>
    <Skeleton width="60%" height={28} style={{ marginBottom: 6 }} />
    <Skeleton width="40%" height={12} />
  </div>
);

export default Skeleton;
