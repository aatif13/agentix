import { useState, useRef, useCallback } from 'react'

export type GrowthAdvisorMode = "channels" | "copy" | "experiments" | "retention"

export function useGrowthAdvisor() {
  const [mode, setMode] = useState<GrowthAdvisorMode>("channels")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  const reset = useCallback(() => {
    setStreamedText("")
    setError(null)
  }, [])

  const runAgent = useCallback(async (planMeta: any, problem: any, overrideMode?: GrowthAdvisorMode) => {
    setIsStreaming(true)
    setStreamedText("")
    setError(null)

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/agent/growth-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          planMeta,
          problem,
          mode: overrideMode ?? mode
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Error: ${response.status}`)
      }

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim()
            if (raw === "[DONE]") break
            
            try {
              const parsed = JSON.parse(raw)
              if (parsed.text) {
                accumulated += parsed.text
                setStreamedText(accumulated)
              }
            } catch (e) {
              // skip malformed
            }
          }
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        // Silently ignore
      } else {
        console.error('Growth Advisor Hook Error:', e)
        setError(e.message || "Failed to fetch advice")
      }
    } finally {
      setIsStreaming(false)
    }
  }, [mode])

  return {
    mode,
    setMode,
    isStreaming,
    streamedText,
    error,
    runAgent,
    stop,
    reset
  }
}
