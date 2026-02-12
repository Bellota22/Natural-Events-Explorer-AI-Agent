import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ExplainBody = {
  eventId: string;
  question?: string;
  lang?: "es" | "en";
};

function safeStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

// Tries to extract JSON even if wrapped in ```json ... ```
function extractJson(text: string): any | null {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;

  // ```json ... ```
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch {
      return null;
    }
  }

  // Raw JSON
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let body: ExplainBody;
  try {
    body = (await req.json()) as ExplainBody;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const eventId = safeStr(body.eventId).trim();
  const lang: "es" | "en" = body.lang === "en" ? "en" : "es";
  const userQuestion = safeStr(body.question).trim();

  if (!eventId) {
    return NextResponse.json({ message: "Missing eventId" }, { status: 400 });
  }

  const AGENT_ENDPOINT = process.env.DO_AGENT_ENDPOINT;
  const AGENT_ACCESS_KEY = process.env.DO_AGENT_ACCESS_KEY;

  if (!AGENT_ENDPOINT || !AGENT_ACCESS_KEY) {
    return NextResponse.json({ message: "Missing agent env vars" }, { status: 500 });
  }

  // Fetch event details from EONET
  const eventRes = await fetch(`https://eonet.gsfc.nasa.gov/api/v3/events/${eventId}`, {
    cache: "no-store",
  });

  if (!eventRes.ok) {
    const detail = await eventRes.text().catch(() => "");
    return NextResponse.json(
      { message: "EONET event fetch error", detail },
      { status: 502 }
    );
  }

  const event = await eventRes.json();

  const defaultQuestion =
    lang === "en"
      ? "Explain this event in a simple way for a non-technical user. Focus on what it is, why it appears in EONET, and how to interpret sources and geometry."
      : "Explica este evento de forma simple para un usuario no técnico. Enfócate en qué es, por qué aparece en EONET y cómo interpretar sources y geometry.";

  const question = userQuestion || defaultQuestion;

  const languageRule = lang === "en" ? "Return content in English." : "Devuelve el contenido en español.";

  const prompt = [
    "You are an educational assistant.",
    "You MUST answer with valid JSON only (no markdown, no extra text).",
    "If you can't support a claim with the provided Event JSON or the attached Knowledge Base, say so in limitations.",
    "",
    languageRule,
    "",
    "JSON schema (exact keys):",
    "{",
    '  "summary": "string (1-3 lines)",',
    '  "meaning": ["bullet", "bullet"],',
    '  "how_to_read": ["bullet", "bullet"],',
    '  "sources": [{"label":"string","url":"string"}],',
    '  "limitations": ["bullet"],',
    '  "next_steps": ["bullet"]',
    "}",
    "",
    "Guidance:",
    "- Keep it friendly and non-technical.",
    "- Explain: status/open/closed, geometry type, what sources mean.",
    "- Add sources URLs from Event JSON (and KB docs if relevant).",
    "- Don't invent precise causes/impacts. Provide general safety guidance only.",
    "",
    "User question:",
    question,
    "",
    "Event JSON:",
    JSON.stringify(event, null, 2),
  ].join("\n");

  const url = `${AGENT_ENDPOINT.replace(/\/$/, "")}/api/v1/chat/completions`;

  const agentRes = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AGENT_ACCESS_KEY}`,
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      stream: false,
      include_retrieval_info: true,
      include_guardrails_info: true,

      // If your endpoint supports OpenAI-style JSON enforcement, this helps a lot:
      // response_format: { type: "json_object" },

      // temperature: 0.2,
    }),
  });

  if (!agentRes.ok) {
    const detail = await agentRes.text().catch(() => "");
    return NextResponse.json({ message: "Agent request failed", detail }, { status: 502 });
  }

  const data = await agentRes.json();
  const raw: string = data?.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson(raw);

  const retrieval = data?.retrieval ?? data?.retrieval_info ?? null;

  return NextResponse.json({
    answer_raw: raw,
    answer_json: parsed,
    retrieval,
  });
}
