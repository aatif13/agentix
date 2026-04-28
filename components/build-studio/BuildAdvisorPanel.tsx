"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FileText,
  ListChecks,
  Cpu,
  Square,
  RotateCcw,
  ChevronRight,
  Brain,
  Sparkles,
} from "lucide-react";
import { useBuildAdvisor, type BuildAdvisorMode } from "@/lib/useBuildAdvisor";

interface BuildAdvisorPanelProps {
  blueprint: any;
  problem: any;
}

const COLORS = {
  green: "#00F5A0",
  cyan: "#00D9E8",
  purple: "#7B5CFF",
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
    <div className="build-advisor-markdown">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} style={{ color: COLORS.green, fontSize: 14, fontWeight: 700, marginTop: 16, marginBottom: 8, fontFamily: 'Syne' }}>
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, paddingLeft: 4 }}>
              <span style={{ color: COLORS.green, fontSize: 12 }}>▸</span>
              <span 
                style={{ color: COLORS.text, fontSize: 12, lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} 
              />
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
        return (
          <p 
            key={i} 
            style={{ color: COLORS.text, fontSize: 12, marginBottom: 8, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: boldify(line) }} 
          />
        );
      })}
    </div>
  );
}

const MODES: { id: BuildAdvisorMode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "spec", label: "PRD Spec", icon: <FileText size={12} />, desc: "Full product requirements document" },
  { id: "tasks", label: "Task List", icon: <ListChecks size={12} />, desc: "Sprint-ready task breakdown" },
  { id: "stack", label: "Stack Advice", icon: <Cpu size={12} />, desc: "Deep tech stack analysis" },
];

export default function BuildAdvisorPanel({
  blueprint,
  problem,
}: BuildAdvisorPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const { mode, setMode, isStreaming, streamedText, error, runAgent, stop, reset } = useBuildAdvisor();

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [streamedText]);

  const handleModeSelect = (m: BuildAdvisorMode) => {
    reset();
    setMode(m);
    runAgent(blueprint, problem, m);
  };

  if (!blueprint) return null;

  return (
    <div style={{ width: "100%", borderTop: `1px solid ${COLORS.border}` }}>
      {/* ── Section Header ── */}
      <div style={{ padding: "20px 0 12px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles size={14} style={{ color: COLORS.green }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Syne", color: COLORS.text }}>
            Build Advisor
          </div>
          <div style={{ fontSize: 10, color: COLORS.muted, fontFamily: "Space Mono" }}>
            AI-powered build guidance
          </div>
        </div>
      </div>

      {/* ── Mode Tabs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
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

      {/* ── Mode Description ── */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.muted }}>
        <ChevronRight size={11} />
        <span>{MODES.find((m) => m.id === mode)?.desc}</span>
      </div>

      {/* ── Output Area ── */}
      <div
        ref={outputRef}
        className="build-output"
        style={{
          marginTop: 16,
          maxHeight: 400,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {!streamedText && !isStreaming && !error ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <Brain size={28} style={{ color: COLORS.muted, opacity: 0.4, margin: "0 auto" }} />
            <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>
              Click a mode above to get AI guidance
            </p>
          </div>
        ) : error ? (
          <div
            style={{
              background: "rgba(255, 107, 53, 0.08)",
              border: "1px solid rgba(255, 107, 53, 0.2)",
              color: COLORS.danger,
              borderRadius: 4,
              padding: "10px 14px",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <RenderMarkdown text={streamedText} />
            {isStreaming && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 12,
                  background: COLORS.green,
                  marginLeft: 4,
                  verticalAlign: "middle",
                  animation: "blink 0.9s step-end infinite",
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Footer Controls ── */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {isStreaming ? (
            <button
              onClick={stop}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 4,
                background: "rgba(255, 107, 53, 0.1)",
                border: "1px solid rgba(255, 107, 53, 0.2)",
                color: COLORS.danger,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Square size={12} /> Stop
            </button>
          ) : (
            streamedText && (
              <button
                onClick={() => handleModeSelect(mode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  color: COLORS.muted,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={12} /> Re-run
              </button>
            )
          )}
        </div>
        <span style={{ fontSize: 9, color: "rgba(255, 255, 255, 0.12)", fontFamily: "Space Mono" }}>
          llama-3.3-70b-versatile
        </span>
      </div>

      <style>{`
        @keyframes blink { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0; } 
        }
        .build-output::-webkit-scrollbar { width: 4px; }
        .build-output::-webkit-scrollbar-thumb { 
          background: rgba(0, 245, 160, 0.2); 
          border-radius: 2px; 
        }
      `}</style>
    </div>
  );
}
