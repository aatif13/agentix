interface LoadingSkeletonProps {
  type?: 'card' | 'row' | 'text' | 'chart'
  count?: number
}

export default function LoadingSkeleton({ type = 'card', count = 3 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count })

  if (type === 'row') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '40%', height: 12 }} />
            </div>
            <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'text') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((_, i) => (
          <div key={i} className="skeleton" style={{ width: i % 2 === 0 ? '100%' : '75%', height: 14 }} />
        ))}
      </div>
    )
  }

  if (type === 'chart') {
    return <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 4 }} />
  }

  return (
    <div className="skeleton-grid">
      {items.map((_, i) => (
        <div key={i} className="kpi-card">
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 4 }} />
          <div style={{ marginTop: 12 }}>
            <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: 60, height: 28 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
