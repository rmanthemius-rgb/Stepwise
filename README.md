# Stepwise on Netlify — beginner guide

This folder is a complete website you can put online with Netlify for free. It includes accounts
(so testers' history and mistakes are saved) and keeps your Anthropic API key hidden on the server.

You do **not** need to understand the code. Just follow the steps.

---

## What you need (all free)
1. A **GitHub** account — github.com
2. A **Netlify** account — netlify.com (sign up with your GitHub account; easiest)
3. An **Anthropic API key** — console.anthropic.com → **API Keys** → **Create Key** → copy it.
   New accounts get free credits (~$5). That credit pays for everyone who tests your site.

---

## Step 1 — Put this folder on GitHub
The simplest way, no tools:
1. Go to github.com → **New repository** → name it `stepwise` → **Create**.
2. On the new repo page click **“uploading an existing file”**.
3. Drag in **everything inside this folder** (the `public` folder, the `netlify` folder,
   `netlify.toml`, and `package.json`). Keep the folder structure.
4. Click **Commit changes**.

## Step 2 — Connect it to Netlify
1. In Netlify: **Add new site → Import an existing project → GitHub** → pick your `stepwise` repo.
2. Leave the build settings as detected (publish directory `public`). Click **Deploy**.

## Step 3 — Add your secret keys
In Netlify: **Site configuration → Environment variables → Add a variable**, add these two:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | the key you copied from Anthropic |
| `JWT_SECRET` | any long random string you make up (e.g. mash the keyboard for 40+ characters) |

Then go to **Deploys → Trigger deploy → Deploy site** so the keys take effect.

## Step 4 — Share it
Open your Netlify URL (something like `your-site.netlify.app`), create an account, upload a past
paper, and try it. Send the link to friends to test — each person makes their own account and
their progress is saved to it.

---

## About the $5 credits and testers
- Everyone who uses your site draws from **your** Anthropic credit pool.
- Each question worked is roughly **1–2 cents** (it uses the cheaper Haiku model for most steps and
  Sonnet only for the “ask the tutor” chat). So ~$5 ≈ a few hundred questions of testing.
- Watch your usage at **console.anthropic.com → Usage**. When the free credit runs out, the app
  simply stops working — you won't be charged unless you've separately added a payment method.
- To pause everything instantly, delete the API key in the Anthropic console (or remove the
  `ANTHROPIC_API_KEY` variable in Netlify and redeploy).

## Charging subscribers later
Netlify itself doesn't take payments. When you're ready to charge, the usual route is to add
**Stripe** (a payment provider) and only unlock the app for users who've paid. That's a later step —
for now this lets you gauge interest and gather testers.

---

## Notes / limits
- Free tiers: Netlify includes generous free Functions and Blobs usage — fine for testing.
- `@netlify/blobs` is Netlify's built-in storage; no separate database to set up. If the deploy
  log ever complains it can't find it, it's because Netlify installs `package.json` deps during the
  build — make sure `package.json` was uploaded.
- Works best with text-based PDFs (most exam-board / PMT papers). Scanned PDFs fall back to a slower
  image read.
- This is a solid test setup, not a hardened product. Before going big, add email verification,
  password reset, stricter limits, and consider a managed database.

## Run it on your own computer first (optional)
Install Node 18+, then:
```bash
npm install -g netlify-cli
npm install
netlify dev
```
This serves the site + functions + a local Blobs sandbox at http://localhost:8888 .
(You'll still need `ANTHROPIC_API_KEY` and `JWT_SECRET` set — `netlify env:set NAME value`, or a local `.env`.)
