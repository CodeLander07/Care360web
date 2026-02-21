import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are Care360, a health support assistant. Your role is to:
1. Analyze the user's input for any potential health risks (severe symptoms, emergency signs, suicidal ideation, chest pain, stroke signs, severe allergic reaction, etc.)
2. If you detect a potential emergency or serious risk, you MUST include exactly this tag at the end of your response: [SOS_TRIGGERED:reason] where reason is a brief explanation.
3. Consider the user's chronic conditions and past health data when provided - tailor your advice accordingly.
4. Suggest relevant follow-ups based on patterns (e.g. if they mention headaches often, ask about frequency or triggers).
5. If chronic disease context is missing but relevant, ask: "Do you have any chronic conditions I should know about?"
6. Be supportive, non-diagnostic, and always recommend professional care for serious concerns.
7. Keep responses concise (2-4 paragraphs) unless the user asks for more detail.`;

function buildPrompt(
  userMessage: string,
  history: { role: string; content: string }[],
  chronicContext: string
): string {
  let prompt = `${SYSTEM_PROMPT}\n\n`;
  if (chronicContext) {
    prompt += `User's known health context: ${chronicContext}\n\n`;
  }
  prompt += "Conversation history:\n";
  for (const m of history) {
    prompt += `${m.role === "user" ? "User" : "Assistant"}: ${m.content}\n`;
  }
  prompt += `\nUser: ${userMessage}\n\nAssistant:`;
  return prompt;
}

function parseSosFlag(text: string): { cleaned: string; sosTriggered: boolean; reason?: string } {
  const match = text.match(/\[SOS_TRIGGERED:(.+?)\]\s*$/);
  if (!match) return { cleaned: text.trim(), sosTriggered: false };
  return {
    cleaned: text.replace(/\[SOS_TRIGGERED:.+?\]\s*$/g, "").trim(),
    sosTriggered: true,
    reason: match[1],
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({
        error: "GEMINI_API_KEY is not set. Add it to .env and restart the dev server.",
      }, { status: 500 });
    }

    const body = await request.json();
    const { message, sessionId, history = [] } = body as {
      message: string;
      sessionId?: string;
      history?: { role: string; content: string }[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // Fetch chronic/health context from user data
    let chronicContext = "";
    const [drugsRes, rppgRes, consultationsRes] = await Promise.allSettled([
      supabase.from("drug_recommendations").select("drug_name").eq("user_id", user.id).limit(5),
      supabase.from("rppg_sessions").select("avg_heart_rate").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("consultations").select("summary").eq("user_id", user.id).limit(3),
    ]);
    const drugs = drugsRes.status === "fulfilled" ? drugsRes.value.data : null;
    const rppg = rppgRes.status === "fulfilled" ? rppgRes.value.data : null;
    const consultations = consultationsRes.status === "fulfilled" ? consultationsRes.value.data : null;
    if (drugs?.length) {
      chronicContext += `Medications: ${drugs.map((d: { drug_name: string }) => d.drug_name).join(", ")}. `;
    }
    if (rppg?.length) {
      const hrs = rppg.map((r: { avg_heart_rate: number }) => r.avg_heart_rate).join(", ");
      chronicContext += `Recent heart rate readings: ${hrs} BPM. `;
    }
    if (consultations?.length) {
      const summaries = consultations.filter((c: { summary?: string }) => c.summary).map((c: { summary: string }) => c.summary).slice(0, 2);
      if (summaries.length) chronicContext += `Past consultation notes: ${summaries.join("; ")}. `;
    }

    const prompt = buildPrompt(message, history, chronicContext);

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let userMessage = "Gemini API error";
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message?.includes("API key not valid")) {
          userMessage = "Invalid Gemini API key. Get a valid key at https://aistudio.google.com/apikey and add GEMINI_API_KEY=your_key to .env (no quotes, no spaces). Restart the dev server.";
        } else {
          userMessage = errJson?.error?.message ?? errText;
        }
      } catch {
        userMessage = errText;
      }
      return NextResponse.json({ error: userMessage }, { status: 502 });
    }

    const data = await res.json();
    const rawText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    const { cleaned, sosTriggered, reason } = parseSosFlag(rawText);

    return NextResponse.json({
      message: cleaned,
      sosTriggered,
      sosReason: reason,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chat failed" },
      { status: 500 }
    );
  }
}
