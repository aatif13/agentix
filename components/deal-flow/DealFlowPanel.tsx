"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  FileText,
  Target,
  HelpCircle,
  Copy,
  X,
  Square,
  RotateCcw,
  Sparkles,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useDealFlow, type DealFlowMode } from "@/lib/useDealFlow";

interface DealFlowPanelProps {
  startupData: any;
  investorProfile: any;
  onClose?: () => void;
  secondStartup?: any;
}

const MODES: { id: DealFlowMode; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: "memo",
    label: "Deal Memo",
    icon: <FileText size={15} />,
    desc: "Generate a structured 1-page investment memo",
  },
  {
    id: "fit",
    label: "Founder Fit",
    icon: <Target size={15} />,
    desc: "Score alignment with your investment thesis",
  },
  {
    id: "dd",
    label: "DD Questions",
    icon: <HelpCircle size={15} />,
    desc: "10 hardest questions to ask this founder",
  },
  {
    id: "compare",
    label: "Compare",
    icon: <Copy size={15} />,
    desc: "Side-by-side comparison with another startup",
  },
];

const COLORS = {
  bg: "#060A0F",
  card: "#0C1018",
  border: "rgba(255, 255, 255, 0.07)",
  primary: "#7B5CFF",
  secondary: "#00D9E8",
  text: "#E8EDF5",
  muted: "#6B7A91",
};

function boldify(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="coach-markdown">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={i} className="coach-md-h2" style={{ color: COLORS.secondary, marginTop: 16 }}>
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={i} className="coach-md-h1" style={{ color: COLORS.primary }}>
              {line.slice(2)}
            </h2>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <div key={i} className="coach-md-li" style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span className="coach-md-bullet" style={{ color: COLORS.primary }}>▸</span>
              <span 
                style={{ color: COLORS.text, fontSize: 13 }}
                dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} 
              />
            </div>
          );
        }
        if (line.trim() === "") return <div key={i} className="coach-md-gap" style={{ height: 12 }} />;
        return (
          <p 
            key={i} 
            className="coach-md-p" 
            style={{ color: COLORS.text, fontSize: 13, marginBottom: 8, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: boldify(line) }} 
          />
        );
      })}
    </div>
  );
}

export default function DealFlowPanel({
  startupData,
  investorProfile,
  onClose,
  secondStartup,
}: DealFlowPanelProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const {
    mode,
    setMode,
    isStreaming,
    streamedText,
    error,
    runAgent,
    stop,
    reset,
  } = useDealFlow();

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTo({ top: outputRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [streamedText]);

  const handleModeSelect = (m: DealFlowMode) => {
    reset();
    setMode(m);
    if (m === 'compare' && !secondStartup) return;
    if (m !== 'compare') runAgent(m, startupData, investorProfile);
    if (m === 'compare' && secondStartup) {
      runAgent('compare', startupData, investorProfile, secondStartup);
    }
  };

  const isEmpty = !streamedText && !isStreaming;

  return (
    <div 
      style={{ 
        width: 580, 
        height: '100%', 
        background: COLORS.bg, 
        borderLeft: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif"
      }}
    >
      {/* ── Header ── */}
      <div 
        style={{ 
          padding: '24px', 
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div 
            style={{ 
              width: 40, height: 40, borderRadius: 10, 
              background: 'rgba(123, 92, 255, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid rgba(123, 92, 255, 0.2)`,
              color: COLORS.primary
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: "'Syne', sans-serif" }}>Deal Flow AI</h2>
            <p style={{ fontSize: 12, color: COLORS.muted, margin: 0 }}>Powered by Groq · Llama 3.3 70B</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', border: 'none', color: COLORS.muted, 
              cursor: 'pointer', padding: 8, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Mode Tabs ── */}
      <div 
        style={{ 
          padding: '12px 16px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 8,
          background: 'rgba(0,0,0,0.2)'
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                padding: '10px 4px',
                borderRadius: 8,
                border: `1px solid ${isActive ? COLORS.primary : 'transparent'}`,
                background: isActive ? 'rgba(123, 92, 255, 0.08)' : 'transparent',
                color: isActive ? COLORS.primary : COLORS.muted,
                cursor: isStreaming ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
              title={m.desc}
            >
              {m.icon}
              <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "'Space Mono', monospace" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Mode description ── */}
      <div 
        style={{ 
          padding: '8px 24px', 
          fontSize: 11, 
          color: COLORS.muted, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          background: 'rgba(255,255,255,0.02)',
          borderBottom: `1px solid ${COLORS.border}`
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
          padding: '24px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Empty state */}
        {isEmpty && !error && (
          <div 
            style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Brain size={48} style={{ marginBottom: 16, color: COLORS.primary, opacity: 0.4 }} />
            {mode === 'compare' && !secondStartup ? (
              <div style={{ maxWidth: 340 }}>
                <p style={{ 
                  fontSize: 14, fontWeight: 600, color: '#E8EDF5', 
                  marginBottom: 10 
                }}>
                  No startup selected for comparison
                </p>
                <p style={{ fontSize: 13, color: '#6B7A91', lineHeight: 1.7, marginBottom: 20 }}>
                  Go back to the deal flow feed and click the{' '}
                  <span style={{ 
                    color: '#00D9E8', fontFamily: "'Space Mono', monospace", 
                    fontSize: 11, padding: '2px 8px', borderRadius: 4,
                    background: 'rgba(0,217,232,0.08)', 
                    border: '1px solid rgba(0,217,232,0.2)' 
                  }}>
                    + Compare
                  </span>
                  {' '}button on any startup card to select it, then reopen 
                  AI Analysis and click Compare.
                </p>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(0,217,232,0.05)',
                  border: '1px solid rgba(0,217,232,0.15)',
                  fontSize: 12,
                  color: '#00D9E8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <span>💡</span>
                  <span>
                    You can compare{' '}
                    <strong>{startupData?.startupName}</strong>{' '}
                    with any other startup in your feed
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.5 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 8px 0' }}>
                  Select a mode to begin analysis
                </p>
                <p style={{ fontSize: 12, maxWidth: 300, color: '#6B7A91' }}>
                  The AI will analyze {startupData?.startupName}&apos;s pitch 
                  against your investment thesis.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {(streamedText || isStreaming) && (
          <div style={{ position: 'relative' }}>
            <RenderMarkdown text={streamedText} />
            {isStreaming && (
              <span 
                className="coach-cursor"
                style={{ 
                  display: 'inline-block', 
                  width: 6, 
                  height: 15, 
                  background: COLORS.primary, 
                  marginLeft: 4,
                  verticalAlign: 'middle',
                  animation: 'blink 1s step-end infinite'
                }} 
              />
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div 
            style={{ 
              padding: '16px', 
              borderRadius: 8, 
              background: 'rgba(255, 107, 53, 0.1)', 
              border: '1px solid rgba(255, 107, 53, 0.2)',
              color: '#FF6B35',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div 
        style={{ 
          padding: '16px 24px', 
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {isStreaming ? (
            <button 
              onClick={stop}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 6,
                background: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.2)',
                color: '#FF6B35', fontSize: 12, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Square size={14} /> Stop
            </button>
          ) : (
            streamedText && (
              <button 
                onClick={() => handleModeSelect(mode)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 6,
                  background: 'rgba(255, 255, 255, 0.05)', border: `1px solid ${COLORS.border}`,
                  color: COLORS.text, fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> Re-run
              </button>
            )
          )}
        </div>
        <span 
          style={{ 
            fontSize: 10, 
            color: COLORS.muted, 
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '0.05em'
          }}
        >
          llama-3.3-70b-versatile
        </span>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
