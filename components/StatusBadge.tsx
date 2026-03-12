const statusConfig = {
  queued: { label: 'Queued', bg: 'rgba(107,122,145,0.15)', color: '#6B7A91', dot: '#6B7A91' },
  running: { label: 'Running', bg: 'rgba(255,195,0,0.1)', color: '#FFC300', dot: '#FFC300' },
  completed: { label: 'Completed', bg: 'rgba(0,245,160,0.08)', color: 'var(--color-green)', dot: 'var(--color-green)' },
  failed: { label: 'Failed', bg: 'rgba(255,107,53,0.1)', color: 'var(--color-orange)', dot: 'var(--color-orange)' },
  analyzing: { label: 'Analyzing', bg: 'rgba(123,92,255,0.1)', color: 'var(--color-purple)', dot: 'var(--color-purple)' },
  complete: { label: 'Complete', bg: 'rgba(0,245,160,0.08)', color: 'var(--color-green)', dot: 'var(--color-green)' },
}

type StatusKey = keyof typeof statusConfig

interface StatusBadgeProps {
  status: StatusKey
  pulse?: boolean
}

export default function StatusBadge({ status, pulse }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.queued
  return (
    <span
      className="status-badge"
      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}
    >
      <span
        className={`status-dot ${(status === 'running' || pulse) ? 'status-dot-pulse' : ''}`}
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  )
}
