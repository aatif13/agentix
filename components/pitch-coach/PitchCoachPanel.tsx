"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Brain,
    MessageSquare,
    BarChart3,
    Wand2,
    X,
    Send,
    Square,
    RotateCcw,
    ChevronRight,
    Sparkles,
    Loader2,
} from "lucide-react";
import { usePitchCoach, type CoachMode } from "@/lib/usePitchCoach";
import ScoreCard from "./ScoreCard";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PitchCoachPanelProps {
    pitchContent: string;        // pass your existing pitch text/notes here
    startupName?: string;
    stage?: string;
    industry?: string;
    onClose?: () => void;
}

// ─── Mode config ──────────────────────────────────────────────────────────────
const MODES: { id: CoachMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
        id: "critique",
        label: "VC Critique",
        icon: <Brain size={15} />,
        desc: "Brutal honest feedback like a top-tier investor",
    },
    {
        id: "qa",
        label: "Q&A Sim",
        icon: <MessageSquare size={15} />,
        desc: "Live investor Q&A simulation",
    },
    {
        id: "score",
        label: "Score",
        icon: <BarChart3 size={15} />,
        desc: "6-dimension fundability scorecard",
    },
    {
        id: "rewrite",
        label: "Rewrite",
        icon: <Wand2 size={15} />,
        desc: "Investor-ready pitch rewrite",
    },
];

// ─── Markdown-lite renderer (bold, headers, lists) ────────────────────────────
function RenderMarkdown({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <div className="coach-markdown">
            {lines.map((line, i) => {
                if (line.startsWith("## ")) {
                    return <h3 key={i} className="coach-md-h2">{line.slice(3)}</h3>;
                }
                if (line.startsWith("# ")) {
                    return <h2 key={i} className="coach-md-h1">{line.slice(2)}</h2>;
                }
                if (line.startsWith("- ") || line.startsWith("• ")) {
                    return (
                        <div key={i} className="coach-md-li">
                            <span className="coach-md-bullet">▸</span>
                            <span dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} />
                        </div>
                    );
                }
                if (line.trim() === "") return <div key={i} className="coach-md-gap" />;
                return (
                    <p key={i} className="coach-md-p" dangerouslySetInnerHTML={{ __html: boldify(line) }} />
                );
            })}
        </div>
    );
}

function boldify(text: string) {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function PitchCoachPanel({
    pitchContent,
    startupName,
    stage,
    industry,
    onClose,
}: PitchCoachPanelProps) {
    const [qaInput, setQaInput] = useState("");
    const qaBottomRef = useRef<HTMLDivElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    const {
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
    } = usePitchCoach({ pitchContent, startupName, stage, industry });

    // Auto-scroll output
    useEffect(() => {
        outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    }, [streamedText]);

    useEffect(() => {
        qaBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [qaHistory]);

    const handleModeSelect = (m: CoachMode) => {
        setMode(m);
        // Auto-run non-QA modes immediately on select
        if (m !== "qa") {
            runAgent(m);
        }
    };

    const handleQaSend = () => {
        if (!qaInput.trim() || isStreaming) return;
        const q = qaInput.trim();
        setQaInput("");
        runAgent("qa", q);
    };

    const isEmpty = !streamedText && !scoreData && qaHistory.length === 0;

    return (
        <div className="coach-panel">
            {/* ── Header ── */}
            <div className="coach-header">
                <div className="coach-header-left">
                    <div className="coach-avatar">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <h2 className="coach-title">AI Pitch Coach</h2>
                        <p className="coach-subtitle">Powered by Groq · Llama 3.3 70B</p>
                    </div>
                </div>
                {onClose && (
                    <button className="coach-close-btn" onClick={onClose} aria-label="Close">
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* ── Mode Tabs ── */}
            <div className="coach-modes">
                {MODES.map((m) => (
                    <button
                        key={m.id}
                        className={`coach-mode-btn ${mode === m.id ? "active" : ""}`}
                        onClick={() => handleModeSelect(m.id)}
                        disabled={isStreaming}
                        title={m.desc}
                    >
                        {m.icon}
                        <span>{m.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Mode description ── */}
            <div className="coach-mode-desc">
                <ChevronRight size={12} />
                <span>{MODES.find((m) => m.id === mode)?.desc}</span>
            </div>

            {/* ── Output Area ── */}
            <div className="coach-output" ref={outputRef}>
                {/* Empty state */}
                {isEmpty && !isStreaming && (
                    <div className="coach-empty">
                        <Brain size={40} className="coach-empty-icon" />
                        <p>Select a mode above to start your AI coaching session</p>
                        <p className="coach-empty-sub">
                            Your pitch content will be analyzed instantly
                        </p>
                    </div>
                )}

                {/* Streaming / text output for critique + rewrite */}
                {(mode === "critique" || mode === "rewrite") && (streamedText || isStreaming) && (
                    <div className="coach-result">
                        <RenderMarkdown text={streamedText} />
                        {isStreaming && <span className="coach-cursor" />}
                    </div>
                )}

                {/* Score card */}
                {mode === "score" && scoreData && <ScoreCard data={scoreData} />}
                {mode === "score" && !scoreData && streamedText && !isStreaming && (
                    <div className="coach-result">
                        <RenderMarkdown text={streamedText} />
                    </div>
                )}
                {mode === "score" && isStreaming && !scoreData && (
                    <div className="coach-loading">
                        <Loader2 size={20} className="coach-spin" />
                        <span>Analyzing your pitch across 6 dimensions…</span>
                    </div>
                )}

                {/* QA Chat */}
                {mode === "qa" && (
                    <div className="coach-qa-thread">
                        {qaHistory.length === 0 && !isStreaming && (
                            <div className="coach-qa-start">
                                <button
                                    className="coach-qa-start-btn"
                                    onClick={() => runAgent("qa")}
                                    disabled={isStreaming}
                                >
                                    <MessageSquare size={16} />
                                    Start Investor Q&amp;A
                                </button>
                                <p>The AI will ask the first tough question</p>
                            </div>
                        )}

                        {qaHistory.map((msg, i) => (
                            <div key={i} className={`coach-qa-msg ${msg.role}`}>
                                <span className="coach-qa-role">
                                    {msg.role === "assistant" ? "🎩 VC" : "🧑‍💻 You"}
                                </span>
                                <RenderMarkdown text={msg.content} />
                            </div>
                        ))}

                        {isStreaming && (
                            <div className="coach-qa-msg assistant">
                                <span className="coach-qa-role">🎩 VC</span>
                                <div className="coach-result">
                                    <RenderMarkdown text={streamedText} />
                                    <span className="coach-cursor" />
                                </div>
                            </div>
                        )}

                        <div ref={qaBottomRef} />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="coach-error">
                        <span>⚠️ {error}</span>
                    </div>
                )}
            </div>

            {/* ── QA Input ── */}
            {mode === "qa" && (
                <div className="coach-qa-input-area">
                    <input
                        className="coach-qa-input"
                        placeholder="Answer the VC's question…"
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleQaSend()}
                        disabled={isStreaming}
                    />
                    <button
                        className="coach-qa-send"
                        onClick={handleQaSend}
                        disabled={isStreaming || !qaInput.trim()}
                    >
                        <Send size={15} />
                    </button>
                    <button
                        className="coach-qa-reset"
                        onClick={resetQA}
                        disabled={isStreaming}
                        title="Reset conversation"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            )}

            {/* ── Stop / Re-run Controls ── */}
            <div className="coach-footer">
                {isStreaming ? (
                    <button className="coach-stop-btn" onClick={stop}>
                        <Square size={13} />
                        Stop
                    </button>
                ) : (
                    streamedText && mode !== "qa" && (
                        <button className="coach-rerun-btn" onClick={() => runAgent()}>
                            <RotateCcw size={13} />
                            Re-run
                        </button>
                    )
                )}
                <span className="coach-footer-model">llama-3.3-70b-versatile</span>
            </div>
        </div>
    );
}