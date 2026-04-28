import { useState, useRef, useCallback } from 'react'

export type ProblemResearchMode = "market" | "validate" | "ideas"

export interface ResearcherOptions {
  problem: any
  location: any
  domain: string
  subDomain: string
}

export function useProblemResearcher(opts: ResearcherOptions) {
  const [mode, setMode] = useState<ProblemResearchMode>("market")
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

  const runAgent = useCallback(async (overrideMode?: ProblemResearchMode) => {
    setIsStreaming(true)
    setStreamedText("")
    setError(null)

    console.log('Sending to API:', { 
      problem: opts.problem, 
      location: opts.location, 
      domain: opts.domain, 
      subDomain: opts.subDomain 
    })

    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/agent/problem-researcher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          problem: opts.problem,
          location: opts.location,
          domain: opts.domain,
          subDomain: opts.subDomain,
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
        // Silently ignore abort
      } else {
        console.error('Problem Researcher Hook Error:', e)
        setError(e.message || "Failed to fetch research")
      }
    } finally {
      setIsStreaming(false)
    }
  }, [opts, mode])

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
