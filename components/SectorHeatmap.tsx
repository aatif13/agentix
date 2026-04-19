'use client'

import React, { useMemo } from 'react'
import { LayoutGrid, Target, ArrowRight } from 'lucide-react'

interface Pitch {
  industry: string
  readinessScore: { score: number }
}

interface SectorHeatmapProps {
  pitches: Pitch[]
  currentIndustry: string
  onSectorClick: (industry: string) => void
}

export default function SectorHeatmap({ pitches, currentIndustry, onSectorClick }: SectorHeatmapProps) {
  const sectors = useMemo(() => {
    const groups: Record<string, { count: number; totalScore: number }> = {}
    
    pitches.forEach(p => {
      const ind = p.industry || 'Other'
      if (!groups[ind]) groups[ind] = { count: 0, totalScore: 0 }
      groups[ind].count++
      groups[ind].totalScore += p.readinessScore?.score || 0
    })

    const sorted = Object.entries(groups).map(([name, data]) => ({
      name,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count)
    })).sort((a, b) => b.count - a.count)

    return sorted
  }, [pitches])

  const maxCount = Math.max(...sectors.map(s => s.count), 1)

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <LayoutGrid size={18} style={{ color: 'var(--color-green)' }} />
        <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>SECTOR ACTIVITY</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {sectors.map(sector => {
          const intensity = sector.count / maxCount
          const isSelected = currentIndustry === sector.name
          
          return (
            <div
              key={sector.name}
              onClick={() => onSectorClick(isSelected ? 'all' : sector.name)}
              style={{
                padding: '20px',
                borderRadius: 12,
                background: isSelected ? 'rgba(0, 245, 160, 0.1)' : 'var(--surface)',
                border: `1px solid ${isSelected ? 'var(--color-green)' : 'var(--border)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Heatmap intensity glow */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(135deg, rgba(0, 245, 160, ${intensity * 0.15}) 0%, transparent 100%)`,
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Space Mono', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                  {sector.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{sector.count}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>startups</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Target size={12} style={{ color: 'var(--color-cyan)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg. Readiness: </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-green)' }}>{sector.avgScore}%</span>
                  </div>
                  <ArrowRight size={14} style={{ opacity: 0.3 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
