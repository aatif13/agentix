import { useState, useCallback, useRef } from "react";

export type CoachMode = "critique" | "qa" | "score" | "rewrite";

export interface QAMessage {
    role: "user" | "assistant";
    content: string;
}

export interface ScoreData {
    overall: number;
    dimensions: Record<string, { score: number; comment: string }>;
    verdict: string;
    top_risk: string;
    top_strength: string;
}

interface UsePitchCoachOptions {
    pitchContent: string;
    startupName?: string;
    stage?: string;
    industry?: string;
}

export function usePitchCoach(opts: UsePitchCoachOptions) {
    const [mode, setMode] = useState<CoachMode>("critique");
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedText, setStreamedText] = useState("");
    const [scoreData, setScoreData] = useState<ScoreData | null>(null);
    const [qaHistory, setQaHistory] = useState<QAMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const stop = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
    }, []);

    const runAgent = useCallback(
        async (overrideMode?: CoachMode, userQuestion?: string) => {
            const activeMode = overrideMode ?? mode;
            setError(null);
            setIsStreaming(true);
            setStreamedText("");
            if (activeMode !== "score") setScoreData(null);

            abortRef.current = new AbortController();

            try {
                const res = await fetch("/api/agent/pitch-coach", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: abortRef.current.signal,
                    body: JSON.stringify({
                        pitchContent: opts.pitchContent,
                        startupName: opts.startupName,
                        stage: opts.stage,
                        industry: opts.industry,
                        mode: activeMode,
                        question: userQuestion,
                        conversationHistory:
                            activeMode === "qa"
                                ? qaHistory.map((m) => ({ role: m.role, content: m.content }))
                                : undefined,
                    }),
                });

                if (!res.ok) throw new Error(`Server error ${res.status}`);
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

                // Post-process score mode → parse JSON
                if (activeMode === "score") {
                    try {
                        const clean = accumulated.replace(/```json|```/g, "").trim();
                        const parsed: ScoreData = JSON.parse(clean);
                        setScoreData(parsed);
                    } catch {
                        setError("Could not parse score data. Raw response shown above.");
                    }
                }

                // Update QA history
                if (activeMode === "qa") {
                    setQaHistory((prev) => [
                        ...prev,
                        ...(userQuestion ? [{ role: "user" as const, content: userQuestion }] : []),
                        { role: "assistant" as const, content: accumulated },
                    ]);
                }
            } catch (e: unknown) {
                if ((e as Error).name !== "AbortError") {
                    setError((e as Error).message ?? "Something went wrong");
                }
            } finally {
                setIsStreaming(false);
            }
        },
        [mode, opts, qaHistory]
    );

    const resetQA = useCallback(() => {
        setQaHistory([]);
        setStreamedText("");
    }, []);

    return {
        mode,
        setMode,
        isStreaming,
        streamedText,
        scoreData,
        qaHistory,
        error,
        runAgent,
        stop,
        resetQA,
    };
}