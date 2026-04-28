"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Radio,
  Type,
  FlaskConical,
  RefreshCcw,
  X,
  Square,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Brain,
} from "lucide-react";
import { useGrowthAdvisor, type GrowthAdvisorMode } from "@/lib/useGrowthAdvisor";

interface GrowthAdvisorPanelProps {
  planMeta: { productName: string; growthGoal: string; channels: string[] };
  problem: any;
  onClose?: () => void;
}

const COLORS = {
  bg: "#060A0F",
  card: "#0C1018",
  green: "#00F5A0",
  cyan: "#00D9E8",
  purple: "#818CF8",
  text: "#E8EDF5",
  muted: "#6B7A91",
  border: "rgba(255, 255, 255, 0.07)",
  danger: "#FF6B35",
};

function boldify(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="advisor-markdown">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} style={{ color: COLORS.green, fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 12, fontFamily: 'Syne' }}>
              {line.slice(3)}
            </h3>
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

const MODES: { id: GrowthAdvisorMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "channels", label: "Channels", icon: <Radio size={13} />, desc: "Deep tactical advice for your selected channels" },
  { id: "copy", label: "Copy", icon: <Type size={13} />, desc: "High-converting copy assets for every platform" },
  { id: "experiments", label: "Experiments", icon: <FlaskConical size={13} />, desc: "5 prioritized growth experiments to run now" },
  { id: "retention", label: "Retention", icon: <RefreshCcw size={13} />, desc: "Strategy to keep users engaged and reduce churn" },
];

export default function GrowthAdvisorPanel({
  planMeta,
  problem,
  onClose,
}: GrowthAdvisorPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const { mode, setMode, isStreaming, streamedText, error, runAgent, stop, reset } = useGrowthAdvisor();

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [streamedText]);

  const handleModeSelect = (m: GrowthAdvisorMode) => {
    reset();
    setMode(m);
    runAgent(planMeta, problem, m);
  };

  return (
    <div
      style={{
        width: 560,
        height: "100%",
        background: COLORS.bg,
        borderLeft: `1px solid ${COLORS.border}`,
        display: "flex",
        flexDirection: "column",
        color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "-10px 0 40px rgba(0,0,0,0.6)",
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
              Growth Advisor
            </h2>
            <p style={{ fontSize: 11, color: COLORS.muted, margin: 0, fontFamily: "Space Mono" }}>
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

      {/* ── Plan Context Strip ── */}
      <div
        style={{
          background: "rgba(0,245,160,0.03)",
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
          padding: "12px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{planMeta.productName}</span>
          <span style={{ 
            fontSize: 9, fontFamily: "Space Mono", fontWeight: 700, padding: "2px 8px", borderRadius: 3, 
            background: "rgba(0,245,160,0.08)", border: "1px solid rgba(0,245,160,0.15)", color: COLORS.green 
          }}>
            {planMeta.growthGoal}
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
          {planMeta.channels.map((ch, i) => (
            <span key={i} style={{ 
              fontSize: 9, fontFamily: "Space Mono", padding: "2px 6px", borderRadius: 3, 
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: COLORS.muted 
            }}>
              #{ch}
            </span>
          ))}
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div
        style={{
          padding: "12px 16px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
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
                gap: 4,
                padding: "8px 4px",
                borderRadius: 4,
                border: `1px solid ${isActive ? "rgba(0, 245, 160, 0.4)" : "rgba(255, 255, 255, 0.07)"}`,
                background: isActive ? "rgba(0, 245, 160, 0.08)" : "rgba(255, 255, 255, 0.03)",
                color: isActive ? COLORS.green : COLORS.muted,
                cursor: isStreaming ? "not-allowed" : "pointer",
                transition: "all 0.2s",
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
              padding: "40px 0",
            }}
          >
            <Brain size={40} style={{ marginBottom: 16, color: COLORS.green, opacity: 0.3 }} />
            <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 8px 0", color: COLORS.muted }}>
              Select a mode to get AI growth advice
            </p>
            <p style={{ fontSize: 11, maxWidth: 260, color: "rgba(107, 122, 145, 0.6)", fontFamily: "Space Mono" }}>
              {planMeta.productName}
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              background: "rgba(255,107,53,0.08)",
              border: "1px solid rgba(255,107,53,0.2)",
              color: COLORS.danger,
              borderRadius: 4,
              padding: "12px 16px",
              fontSize: 13,
            }}
          >
            {error}
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
                color: COLORS.danger,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
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
                  color: COLORS.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
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
