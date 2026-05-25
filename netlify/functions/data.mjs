// Netlify Function (v2): get / save a user's {history, reviews, xp} blob.
import { getStore } from "@netlify/blobs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
function authEmail(req) {
  const h = req.headers.get("authorization") || "";
  const t = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!t) return null;
  try { return jwt.verify(t, JWT_SECRET).email; } catch { return null; }
}

export default async (req) => {
  const email = authEmail(req);
  if (!email) return json({ error: "Not signed in." }, 401);
  const store = getStore("userdata");

  if (req.method === "GET") {
    const d = await store.get(email, { type: "json" });
    return json(d || { history: [], reviews: [], xp: 0 });
  }
  if (req.method === "PUT") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
    if (JSON.stringify(body || {}).length > 4 * 1024 * 1024) return json({ error: "Too much data." }, 413);
    await store.setJSON(email, body || {});
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, 405);
};
