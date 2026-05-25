import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIMO_ENDPOINT =
  "https://token-plan-sgp.xiaomimimo.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are a reasoning forensic analyst. Given a prompt and an LLM response, decompose the response's reasoning into a strict hierarchical tree.

Output EXACTLY one JSON object, no prose, no markdown fences:
{
  "root": {
    "id": "n0",
    "label": "<3-7 word claim>",
    "type": "premise" | "inference" | "evidence" | "assumption" | "conclusion" | "fallacy",
    "confidence": 0.0-1.0,
    "fallacy": null | "<name of fallacy if type=fallacy>",
    "rationale": "<one sentence justification>",
    "children": [ { ...same shape... } ]
  }
}

Rules:
- Tree must have 6-14 nodes total, depth 3-5.
- Mark logical fallacies (circular reasoning, false dichotomy, hasty generalization, post hoc, straw man, appeal to authority, equivocation) with type="fallacy" and fill the fallacy field.
- "confidence" reflects how well the node is supported by the response text.
- Leaves are conclusions, evidence, or fallacies. Internal nodes are premises/inferences/assumptions.
- IDs are "n0", "n1", "n2", ... in pre-order traversal.
- Output ONLY the JSON. No explanation, no \`\`\`json fences.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.MIMO_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server missing MIMO_API_KEY" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  let body: { prompt?: string; response?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const prompt = (body.prompt || "").trim();
  const response = (body.response || "").trim();

  if (!prompt || !response) {
    return new Response(
      JSON.stringify({ error: "Both 'prompt' and 'response' are required" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  if (prompt.length + response.length > 8000) {
    return new Response(
      JSON.stringify({ error: "Combined input too long (max 8000 chars)" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const userMessage = `PROMPT:\n${prompt}\n\nRESPONSE:\n${response}\n\nDecompose the reasoning tree. Output JSON only.`;

  try {
    const upstream = await fetch(MIMO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "mimo-v2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 4096,
        stream: false,
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return new Response(
        JSON.stringify({
          error: "Upstream model error",
          status: upstream.status,
          detail: text.slice(0, 500),
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const data = await upstream.json();
    const choice = data?.choices?.[0]?.message;
    const raw =
      (typeof choice?.content === "string" && choice.content.trim()) ||
      (typeof choice?.reasoning_content === "string" &&
        choice.reasoning_content.trim()) ||
      "";

    if (!raw) {
      return new Response(
        JSON.stringify({ error: "Empty model response" }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    // Strip optional code fences and extract first JSON object
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return new Response(
        JSON.stringify({
          error: "Model did not return JSON",
          sample: cleaned.slice(0, 300),
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    const jsonText = cleaned.slice(firstBrace, lastBrace + 1);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Failed to parse model JSON",
          detail: String(e),
          sample: jsonText.slice(0, 300),
        }),
        { status: 502, headers: { "content-type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Network error",
        detail: err instanceof Error ? err.message : String(err),
      }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}
