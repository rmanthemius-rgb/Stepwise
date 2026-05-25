// Netlify Function (v2): authenticated proxy to the Anthropic API.
// Your ANTHROPIC_API_KEY lives only here (a Netlify environment variable),
// never in the browser. Only logged-in users can call it.
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const ALLOWED = new Set(["claude-sonnet-4-6", "claude-haiku-4-5-20251001"]);
const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS_CAP = 8000;

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
function authEmail(req) {
  const h = req.headers.get("authorization") || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;
  try { return jwt.verify(t, JWT_SECRET).email; } catch { return null; }
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!authEmail(req)) return json({ error: "Not signed in." }, 401);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "Server is missing ANTHROPIC_API_KEY." }, 500);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  if (!Array.isArray(body.messages)) return json({ error: "messages array required" }, 400);

  const payload = {
    model: ALLOWED.has(body.model) ? body.model : DEFAULT_MODEL,
    max_tokens: Math.min(Number(body.max_tokens) || 1024, MAX_TOKENS_CAP),
    messages: body.messages,
  };
  if (body.system) payload.system = body.system;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), { status: r.status, headers: { "content-type": "application/json" } });
  } catch (e) {
    return json({ error: "Upstream error: " + (e.message || String(e)) }, 500);
  }
};
