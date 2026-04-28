"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  CheckCircle,
  Lightbulb,
  X,
  Square,
  RotateCcw,
  Sparkles,
  Loader2,
  ChevronRight,
  Brain,
} from "lucide-react";
import { useProblemResearcher, type ProblemResearchMode } from "@/lib/useProblemResearcher";

interface ProblemResearcherPanelProps {
  problem: any;
  location: { country: string; state: string; district: string; region?: string };
  domain: string;
  subDomain: string;
  onClose?: () => void;
}

const COLORS = {
  bg: "#060A0F",
  card: "#0C1018",
  green: "#00F5A0",
  purple: "#7B5CFF",
  text: "#E8EDF5",
  muted: "#6B7A91",
  border: "rgba(255, 255, 255, 0.07)",
  orange: "#FF6B35",
  yellow: "#FFB800",
};

function boldify(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="researcher-markdown">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} style={{ color: COLORS.green, fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 12, fontFamily: 'Syne' }}>
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={i} style={{ color: COLORS.purple, fontSize: 18, fontWeight: 800, marginTop: 28, marginBottom: 16, fontFamily: 'Syne' }}>
              {line.slice(2)}
            </h2>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, paddingLeft: 4 }}>
              <span style={{ color: COLORS.green, fontSize: 14 }}>▸</span>
              <span 
                style={{ color: COLORS.text, fontSize: 13, lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} 
              />
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height: 12 }} />;
        return (
          <p 
            key={i} 
            style={{ color: COLORS.text, fontSize: 13, marginBottom: 12, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: boldify(line) }} 
          />
        );
      })}
    </div>
  );
}

const MODES: { id: ProblemResearchMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "market", label: "Market", icon: <TrendingUp size={14} />, desc: "Deep market research and competitive landscape" },
  { id: "validate", label: "Validate", icon: <CheckCircle size={14} />, desc: "Validate if this problem is worth building on" },
  { id: "ideas", label: "Ideas", icon: <Lightbulb size={14} />, desc: "5 specific startup ideas for this exact problem" },
];

export default function ProblemResearcherPanel({
  problem,
  location,
  domain,
  subDomain,
  onClose,
}: ProblemResearcherPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const { mode, setMode, isStreaming, streamedText, error, runAgent, stop, reset } = useProblemResearcher({
    problem,
    location,
    domain,
    subDomain,
  });

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [streamedText]);

  const handleModeSelect = (m: ProblemResearchMode) => {
    reset();
    setMode(m);
    runAgent(m);
  };

  const severityColor = problem.severity === 'High' ? COLORS.orange : problem.severity === 'Medium' ? COLORS.yellow : COLORS.green;

  return (
    <div
      style={{
        width: 520,
        height: "100%",
        background: COLORS.bg,
        borderLeft: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "20px 24px",
          background: COLORS.card,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(0,245,160,0.1)",
              border: "1px solid rgba(0,245,160,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.green,
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "Syne", color: COLORS.text }}>
              Problem Researcher
            </h2>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: 0, fontFamily: "Space Mono", letterSpacing: "0.02em" }}>
              Powered by Groq · Llama 3.3 70B
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: COLORS.muted,
              cursor: "pointer",
              padding: 8,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseOut={(e) => (e.currentTarget.style.background = "none")}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Problem Context Strip ── */}
      <div
        style={{
          background: "rgba(0,245,160,0.03)",
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
          padding: "12px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: COLORS.text, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 320 }}>
            {problem.title.length > 60 ? problem.title.slice(0, 60) + "..." : problem.title}
          </span>
          <span style={{ 
            fontSize: 9, fontFamily: "Space Mono", fontWeight: 700, padding: "2px 8px", borderRadius: 4, 
            background: `${severityColor}15`, border: `1px solid ${severityColor}30`, color: severityColor, textTransform: 'uppercase'
          }}>
            {problem.severity}
          </span>
        </div>
        <div style={{ fontSize: 10, fontFamily: "Space Mono", color: COLORS.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>📍</span> {location.district}, {location.state}
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div
        style={{
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
          background: "rgba(0,0,0,0.2)",
        }}
      >
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m.id)}
              disabled={isStreaming}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "10px 4px",
                borderRadius: 8,
                border: `1px solid ${isActive ? COLORS.green : "transparent"}`,
                background: isActive ? "rgba(0,245,160,0.08)" : "transparent",
                color: isActive ? COLORS.green : COLORS.muted,
                cursor: isStreaming ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isStreaming && !isActive ? 0.5 : 1,
              }}
            >
              {m.icon}
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "Space Mono" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Mode description ── */}
      <div
        style={{
          padding: "8px 24px",
          fontSize: 11,
          color: COLORS.muted,
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(255,255,255,0.02)",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <ChevronRight size={12} />
        <span>{MODES.find((m) => m.id === mode)?.desc}</span>
      </div>

      {/* ── Output Area ── */}
      <div
        ref={outputRef}
        style={{
          flex: 1,
          padding: "24px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!streamedText && !isStreaming && !error ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Brain size={40} style={{ marginBottom: 16, color: COLORS.green, opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px 0", color: COLORS.muted }}>
              Select a mode above to research this problem
            </p>
            <p style={{ fontSize: 11, maxWidth: 260, color: "rgba(107, 122, 145, 0.6)", fontFamily: "Space Mono" }}>
              {problem.title.length > 50 ? problem.title.slice(0, 50) + "..." : problem.title}
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              background: "rgba(255,107,53,0.08)",
              border: "1px solid rgba(255,107,53,0.2)",
              color: "#FF6B35",
              borderRadius: 4,
              padding: "12px 16px",
              fontSize: 13,
              display: 'flex',
              gap: 10
            }}
          >
            <span>⚠️</span> {error}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <RenderMarkdown text={streamedText} />
            {isStreaming && (
              <span 
                style={{ 
                  display: 'inline-block', 
                  width: 2, 
                  height: 14, 
                  background: COLORS.green, 
                  marginLeft: 4,
                  verticalAlign: 'middle',
                  animation: 'blink 0.9s step-end infinite'
                }} 
              />
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <div>
          {isStreaming ? (
            <button
              onClick={stop}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 6,
                background: "rgba(255,107,53,0.1)",
                border: "1px solid rgba(255,107,53,0.2)",
                color: "#FF6B35",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,107,53,0.15)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,107,53,0.1)")}
            >
              <Square size={14} /> Stop
            </button>
          ) : (
            streamedText && (
              <button
                onClick={() => handleModeSelect(mode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              >
                <RotateCcw size={14} /> Re-run
              </button>
            )
          )}
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "Space Mono" }}>
          llama-3.3-70b-versatile
        </span>
      </div>

      <style>{`
        @keyframes blink { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0; } 
        }
      `}</style>
    </div>
  );
}
