interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  agentEmoji?: string
  timestamp?: string | Date
  userName?: string
}

export default function ChatMessage({ role, content, agentName, agentEmoji, timestamp, userName }: ChatMessageProps) {
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

  // Format code blocks
  const formatContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const lang = part.match(/```(\w*)/)?.[1] || 'code'
        const code = part.replace(/```\w*\n?/, '').replace(/```$/, '')
        return (
          <div key={i} className="code-block">
            <div className="code-header">
              <span>{lang}</span>
              <button
                className="code-copy"
                onClick={() => navigator.clipboard.writeText(code)}
              >
                Copy
              </button>
            </div>
            <pre><code>{code}</code></pre>
          </div>
        )
      }
      // Format bold text
      const formatted = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <span key={i} dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br/>') }} />
    })
  }

  if (role === 'user') {
    return (
      <div className="msg msg-user">
        <div className="msg-bubble msg-bubble-user">
          <p>{content}</p>
          {time && <span className="msg-time">{time}</span>}
        </div>
        <div className="msg-avatar user-msg-avatar">
          {(userName || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    )
  }

  return (
    <div className="msg msg-assistant">
      <div className="msg-avatar agent-avatar">
        {agentEmoji || '🤖'}
      </div>
      <div>
        {agentName && <p className="msg-agent-name">{agentName}</p>}
        <div className="msg-bubble msg-bubble-assistant">
          {formatContent(content)}
          {time && <span className="msg-time">{time}</span>}
        </div>
      </div>
    </div>
  )
}
