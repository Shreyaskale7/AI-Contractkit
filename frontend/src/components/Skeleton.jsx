const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, style = {} }) => (
  <div
    className="skeleton-block"
    style={{ width, height, borderRadius, ...style }}
  />
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div>
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="skeleton-row">
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
  <div className="card card-body">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <Skeleton width="50%" height={13} />
      <Skeleton width={36} height={36} borderRadius={10} />
    </div>
    <Skeleton width="60%" height={28} style={{ marginBottom: 6 }} />
    <Skeleton width="40%" height={12} />
  </div>
);

export default Skeleton;
