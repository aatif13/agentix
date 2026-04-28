import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────
interface PitchCoachRequest {
  pitchContent: string;      // the founder's pitch text / slide notes
  startupName?: string;
  stage?: string;            // idea | pre-seed | seed | series-a
  industry?: string;
  mode: "critique" | "qa" | "score" | "rewrite";
  question?: string;         // used when mode === "qa"
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
}

// ─── System prompts per mode ──────────────────────────────────────────────────
const SYSTEM_PROMPTS: Record<PitchCoachRequest["mode"], string> = {
  critique: `You are a sharp, experienced venture capitalist with 15+ years investing in early-stage startups.
Your job is to critique a founder's pitch BRUTALLY but constructively — like a top-tier VC in a real pitch meeting.

Structure your critique EXACTLY as follows (use these headers):

## 🎯 First Impression (2-3 sentences)
## ✅ What Works
## 🚨 Red Flags
## 🕳️ Missing Elements
## 💡 Top 3 Improvements
## 📊 Fundability Score: X/10

Be direct, specific, and actionable. No fluff. Reference specific parts of the pitch.`,

  qa: `You are a seasoned VC partner conducting a live pitch Q&A. The founder has submitted their pitch.
Ask hard, probing questions — the kind that expose weak assumptions, unclear business models, or founder blind spots.
When the founder answers, stress-test their answer. Push back if vague. Praise if strong.
Stay in character as a VC. Be concise but incisive. One question or response at a time.`,

  score: `You are an AI pitch analyst. Evaluate the pitch across 6 dimensions and return a structured JSON scorecard.
Return ONLY valid JSON (no markdown, no explanation outside JSON) in this exact format:
{
  "overall": 72,
  "dimensions": {
    "problem_clarity": { "score": 80, "comment": "..." },
    "solution_uniqueness": { "score": 65, "comment": "..." },
    "market_size": { "score": 70, "comment": "..." },
    "business_model": { "score": 60, "comment": "..." },
    "team_signal": { "score": 75, "comment": "..." },
    "traction": { "score": 55, "comment": "..." }
  },
  "verdict": "...",
  "top_risk": "...",
  "top_strength": "..."
}`,

  rewrite: `You are an elite pitch consultant who has helped 200+ startups raise funding.
Rewrite the founder's pitch to be investor-ready. Make it crisp, compelling, and structured.

Use this format:
## 🏷️ One-liner
## 🔥 The Problem
## 💡 The Solution
## 📈 Market Opportunity
## 🏆 Why Us / Unfair Advantage
## 💰 Business Model
## 📊 Traction / Milestones
## 🙏 The Ask

Write like YC Demo Day meets Sequoia pitch deck. Tight sentences. Strong verbs. Investor language.`,
};

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: PitchCoachRequest = await req.json();
    const { pitchContent, startupName, stage, industry, mode, question, conversationHistory } = body;

    if (!pitchContent || !mode) {
      return NextResponse.json({ error: "pitchContent and mode are required" }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode];

    // Build the user message
    let userMessage = "";
    const context = [
      startupName && `Startup: ${startupName}`,
      stage && `Stage: ${stage}`,
      industry && `Industry: ${industry}`,
    ]
      .filter(Boolean)
      .join(" | ");

    if (mode === "qa") {
      // Multi-turn Q&A mode
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is my pitch:\n\n${pitchContent}\n\n${context ? `Context: ${context}` : ""}`,
        },
        ...(conversationHistory ?? []),
        ...(question ? [{ role: "user" as const, content: question }] : []),
      ];

      const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        stream: true,
        max_tokens: 600,
        temperature: 0.7,
      });

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content ?? "";
              if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Single-shot modes: critique, score, rewrite
    userMessage = `${context ? `[${context}]\n\n` : ""}${pitchContent}`;

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
      max_tokens: mode === "score" ? 800 : 1200,
      temperature: mode === "score" ? 0.2 : 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    console.error("[pitch-coach] error:", err);
    return NextResponse.json({ error: "Agent failed. Check GROQ_API_KEY and model availability." }, { status: 500 });
  }
}
