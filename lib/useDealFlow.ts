import { useState, useCallback, useRef } from "react";

export type DealFlowMode = "memo" | "fit" | "dd" | "compare";

interface UseDealFlowOptions {
  startupData: any;
  investorProfile: any;
  secondStartup?: any;
}

export function useDealFlow() {
  const [mode, setMode] = useState<DealFlowMode>("memo");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setStreamedText("");
    setError(null);
  }, []);

  const runAgent = useCallback(
    async (
      selectedMode: DealFlowMode,
      startupData: any,
      investorProfile: any,
      secondStartup?: any
    ) => {
      setMode(selectedMode);
      setError(null);
      setIsStreaming(true);
      setStreamedText("");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/agent/deal-flow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            startupData,
            investorProfile,
            mode: selectedMode,
            secondStartup,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server error ${res.status}`);
        }
        
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") break;
              try {
                const parsed = JSON.parse(raw);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setStreamedText(accumulated);
                }
              } catch {
                // skip malformed
              }
            }
          }
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message ?? "Something went wrong");
        }
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return {
    mode,
    setMode,
    isStreaming,
    streamedText,
    error,
    runAgent,
    stop,
    reset,
  };
}
