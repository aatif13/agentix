'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'

interface TaskRowProps {
  task: {
    _id: string
    taskName: string
    description: string
    agent: string
    agentEmoji: string
    status: 'queued' | 'running' | 'completed' | 'failed'
    result?: string
    startedAt?: string | Date
    completedAt?: string | Date
    createdAt: string | Date
  }
}

function formatDate(date: string | Date | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TaskRow({ task }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="task-row-wrapper">
      <div className="task-row" onClick={() => setExpanded(!expanded)}>
        <div className="task-row-main">
          <span className="task-agent-emoji">{task.agentEmoji}</span>
          <div>
            <p className="task-name">{task.taskName}</p>
            <p className="task-desc">{task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</p>
          </div>
        </div>
        <div className="task-row-meta">
          <span className="task-agent-label">{task.agent}</span>
          <StatusBadge status={task.status} />
          <span className="task-time">{formatDate(task.createdAt)}</span>
          <ChevronDown
            size={16}
            style={{
              color: 'var(--text-muted)',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </div>
      {expanded && (
        <div className="task-expanded">
          <div className="task-times">
            <span>Started: {formatDate(task.startedAt)}</span>
            <span>Completed: {formatDate(task.completedAt)}</span>
          </div>
          {task.result ? (
            <div className="task-result">
              <p className="task-result-label">Result</p>
              <p className="task-result-text">{task.result}</p>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              {task.status === 'queued' ? 'Task is queued, waiting for agent...' :
               task.status === 'running' ? 'Agent is processing your task...' :
               'No result available.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
