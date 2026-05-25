// Netlify Function (v2): handles signup + login.
// Storage is Netlify Blobs (built in — no external database needed).
import { getStore } from "@netlify/blobs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });
const sign = (email) => jwt.sign({ email }, JWT_SECRET, { expiresIn: "30d" });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }

  const action = body.action;
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");
  const users = getStore("users");

  if (action === "signup") {
    if (!email || password.length < 6) return json({ error: "Enter an email and a password of at least 6 characters." }, 400);
    const existing = await users.get(email, { type: "json" });
    if (existing) return json({ error: "That email is already registered." }, 409);
    await users.setJSON(email, { email, passwordHash: bcrypt.hashSync(password, 10), createdAt: Date.now() });
    await getStore("userdata").setJSON(email, { history: [], reviews: [], xp: 0 });
    return json({ token: sign(email) });
  }

  if (action === "login") {
    if (!email || !password) return json({ error: "Email and password required." }, 400);
    const user = await users.get(email, { type: "json" });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) return json({ error: "Wrong email or password." }, 401);
    return json({ token: sign(email) });
  }

  return json({ error: "Unknown action" }, 400);
};
