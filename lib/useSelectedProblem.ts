import { useState, useEffect, useCallback } from 'react'

export interface SelectedProblem {
  title: string
  severity: 'High' | 'Medium' | 'Low'
  affectedGroup: string
  reason: string
  startupOpportunity: string
  monetization: string
  resultId: string
  index: number
  domain: string
  subDomain: string
  location: {
    country: string
    state: string
    district: string
    region?: string
  }
}

export function useSelectedProblem() {
  const [problem, setProblem] = useState<SelectedProblem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSelectedProblem = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/user/selected-problem')
      if (res.ok) {
        const data = await res.json()
        setProblem(data.problem)
      }
    } catch (err) {
      console.error('Failed to fetch selected problem:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSelectedProblem()
  }, [fetchSelectedProblem])

  return { problem, isLoading, refetch: fetchSelectedProblem }
}
