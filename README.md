# Transformer Explorable

An interactive, step-by-step explorable explanation of the Transformer architecture —
tokens, embeddings, positional encoding, self-attention and multi-head attention —
in the spirit of Nicky Case's [explorable explanations](https://ncase.me/).

Six chapters, each with something to poke at, plus an optional Gemini-powered guide
in the sidebar.

## Run locally

**Prerequisites:** Node.js 20+

```bash
npm install
cp .env.example .env      # optional: add your Gemini key
npm run dev               # http://localhost:3000
```

Without a `GEMINI_API_KEY` the app runs fine — the two AI endpoints return canned
offline responses instead of erroring.

## Scripts

| command | what it does |
| --- | --- |
| `npm run dev` | Vite dev server behind Express (`NODE_ENV=development`) |
| `npm run build` | builds the client into `dist/` and bundles the server to `dist/server.cjs` |
| `npm start` | serves the built app (`NODE_ENV=production`) |
| `npm run lint` | `tsc --noEmit` — strict typecheck |

## Environment variables

| variable | default | notes |
| --- | --- | --- |
| `PORT` | `3000` | **Cloud Run sets this** (usually 8080); the server must honour it |
| `NODE_ENV` | `production` | `development` boots Vite middleware instead of serving `dist/` |
| `GEMINI_API_KEY` | — | omit to run in offline mode |
| `GEMINI_MODEL` | `gemini-3.6-flash` | primary model id |
| `GEMINI_FALLBACK_MODEL` | `gemini-2.5-flash` | retried automatically if the primary fails |

## Deploying to Cloud Run

The Node buildpack runs `npm run build` then `npm start`. Two things matter:

1. The server reads `process.env.PORT`. Do not hard-code a port.
2. `npm start` sets `NODE_ENV=production` so Express serves `dist/` rather than
   trying to spin up a dev server.

Set `GEMINI_API_KEY` as a Cloud Run secret/env var to enable the AI guide.
`GET /api/health` returns `{ ok, aiEnabled, model }` and is a good health check target.

## What the app does and doesn't simulate

The chapters use small, honest implementations of the real maths — softmax, scaled
dot-product attention weights, and the sinusoidal positional encoding formula — so
the numbers on screen always agree with the formulas printed beside them
(see `src/lib/nn.ts`).

The Sandbox heatmap is **not** a trained model. Its scores come from a hand-written
heuristic (proximity + a topic list) pushed through a real softmax. It shows the
*shape* of an attention matrix, not what a real model computes. The app says so
in-page too.

## Credits

Architecture: Vaswani et al., *Attention Is All You Need* (2017).
Design philosophy: Nicky Case.
