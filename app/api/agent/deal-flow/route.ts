import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Types ────────────────────────────────────────────────────────────────────
interface DealFlowRequest {
  startupData: any;
  investorProfile: any;
  mode: "memo" | "fit" | "dd" | "compare";
  secondStartup?: any;
}

// ─── System prompts per mode ──────────────────────────────────────────────────
const SYSTEM_PROMPTS: Record<DealFlowRequest["mode"], string> = {
  memo: `You are an elite Venture Capital Investment Associate at a top-tier firm like Sequoia or Benchmark.
Your task is to generate a structured 1-page investment memo for a startup based on their pitch data.
Be analytical, objective, and sharp.

Output format must use these EXACT headers:
## 🏢 Company Snapshot
## 🎯 Investment Thesis Fit
## 📈 Opportunity
## ⚠️ Key Risks
## 🔍 What We Like
## ❌ Red Flags
## 💡 Verdict
## 📊 Investment Score: X/10`,

  fit: `You are a VC Thesis Alignment Specialist.
Score how well this startup matches the investor's thesis, sector focus, stage preference, and check size.
Be critical. If the startup is outside the investor's sweet spot, point it out clearly.

Output format must use these EXACT headers:
## 🎯 Thesis Alignment Score: X/10
## ✅ Matches Your Thesis
## ❌ Misaligns With Your Thesis
## 🤔 Questions Before Deciding
## 📌 Recommendation`,

  dd: `You are a Senior Due Diligence Analyst at a lead VC firm.
Generate the 10 hardest, most specific due diligence questions this investor should ask this specific founder based on their pitch gaps, claims, and risks.
Number each question 1-10.

Group them EXACTLY under:
## 🏗️ Product & Tech
## 📊 Market & Traction
## 💰 Financials & Model
## 👥 Team & Execution`,

  compare: `You are a General Partner at a VC firm deciding between two high-potential startups for the final slot in your fund.
Conduct a side-by-side comparison of the 2 startups.
Be decisive. Pick a winner based on traction, team, market, and defensibility.

Output format must use these EXACT headers:
## ⚡ Head to Head
## 🏆 Winner: [Startup Name]
## 📊 Dimension Scores (table format showing both)
## 💡 Final Recommendation`,
};

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: DealFlowRequest = await req.json();
    const { startupData, investorProfile, mode, secondStartup } = body;

    if (!startupData || !investorProfile || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (mode === "compare" && !secondStartup) {
      return NextResponse.json({ error: "Second startup required for comparison" }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode];

    // Build the user message with context
    let userMessage = "";
    if (mode === "compare") {
      userMessage = `INVESTOR PROFILE:
${JSON.stringify(investorProfile, null, 2)}

STARTUP 1:
${JSON.stringify(startupData, null, 2)}

STARTUP 2:
${JSON.stringify(secondStartup, null, 2)}

Compare these two startups for the investor.`;
    } else {
      userMessage = `INVESTOR PROFILE:
${JSON.stringify(investorProfile, null, 2)}

STARTUP DATA:
${JSON.stringify(startupData, null, 2)}

Perform the "${mode}" analysis based on the provided data.`;
    }

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.5,
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
  } catch (err: any) {
    console.error("[deal-flow-agent] error:", err);
    return NextResponse.json({ error: "Agent failed. Check GROQ_API_KEY and model availability." }, { status: 500 });
  }
}
