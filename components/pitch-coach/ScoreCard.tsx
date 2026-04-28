"use client";

import React from "react";
import type { ScoreData } from "@/lib/usePitchCoach";

const DIM_LABELS: Record<string, string> = {
    problem_clarity: "Problem Clarity",
    solution_uniqueness: "Uniqueness",
    market_size: "Market Size",
    business_model: "Business Model",
    team_signal: "Team Signal",
    traction: "Traction",
};

function ScoreBar({ score }: { score: number }) {
    const color =
        score >= 75 ? "#00F5A0" : score >= 50 ? "#FFB800" : "#FF6B35";
    return (
        <div className="pitch-score-bar-track">
            <div
                className="pitch-score-bar-fill"
                style={{ width: `${score}%`, background: color }}
            />
        </div>
    );
}

export default function ScoreCard({ data }: { data: ScoreData }) {
    return (
        <div className="pitch-scorecard">
            <div className="pitch-scorecard-header">
                <div className="pitch-overall-ring">
                    <svg viewBox="0 0 100 100" className="pitch-ring-svg">
                        <circle cx="50" cy="50" r="42" className="pitch-ring-bg" />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            className="pitch-ring-progress"
                            strokeDasharray={`${(data.overall / 100) * 264} 264`}
                            style={{
                                stroke: data.overall >= 70 ? "#00F5A0" : data.overall >= 50 ? "#FFB800" : "#FF6B35",
                            }}
                        />
                    </svg>
                    <span className="pitch-ring-number">{data.overall}</span>
                </div>
                <div className="pitch-scorecard-meta">
                    <p className="pitch-verdict">{data.verdict}</p>
                    <div className="pitch-highlights">
                        <span className="pitch-highlight strength">✅ {data.top_strength}</span>
                        <span className="pitch-highlight risk">⚠️ {data.top_risk}</span>
                    </div>
                </div>
            </div>

            <div className="pitch-dimensions">
                {Object.entries(data.dimensions).map(([key, val]) => (
                    <div key={key} className="pitch-dimension-row">
                        <div className="pitch-dim-header">
                            <span className="pitch-dim-label">{DIM_LABELS[key] ?? key}</span>
                            <span className="pitch-dim-score">{val.score}</span>
                        </div>
                        <ScoreBar score={val.score} />
                        <p className="pitch-dim-comment">{val.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}