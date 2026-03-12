import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  color?: string
  loading?: boolean
}

export default function KPICard({ icon: Icon, label, value, trend, color = 'var(--color-green)', loading }: KPICardProps) {
  if (loading) {
    return (
      <div className="kpi-card">
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 4 }} />
        <div style={{ marginTop: 12 }}>
          <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 60, height: 28 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="kpi-body">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        {trend !== undefined && (
          <div className="kpi-trend" style={{ color: trend >= 0 ? 'var(--color-green)' : 'var(--color-orange)' }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}% this week</span>
          </div>
        )}
      </div>
    </div>
  )
}
