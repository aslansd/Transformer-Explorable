import express from "express";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Cloud Run injects PORT (usually 8080). Hard-coding 3000 makes the container
// fail its health check, so always read the environment first.
const PORT = Number(process.env.PORT) || 3000;
const IS_DEV = process.env.NODE_ENV === "development";

// Model id is configurable so a future rename never breaks the deployed app.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";

const hasApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== "MY_GEMINI_API_KEY");
};

function makeClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

/** Generate with the primary model, transparently retrying on the fallback. */
async function generate(prompt: string): Promise<string> {
  const ai = makeClient();
  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = response.text;
      if (text && text.trim()) return text;
    } catch (err) {
      console.warn(`[gemini] model "${model}" failed:`, (err as Error)?.message);
      if (model === FALLBACK_MODEL) throw err;
    }
  }
  throw new Error("No text returned by the model.");
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, aiEnabled: hasApiKey(), model: PRIMARY_MODEL });
  });

  // API Route: explanation of attention weights
  app.post("/api/inspect-attention", async (req, res) => {
    const { sentence, selectedWord, targetWord, attentionScore } = req.body ?? {};

    if (typeof selectedWord !== "string" || typeof targetWord !== "string") {
      return res.status(400).json({ error: "selectedWord and targetWord are required." });
    }
    // The old code called attentionScore.toFixed() unguarded, which threw a 500
    // whenever the field was missing.
    const score = Number.isFinite(Number(attentionScore)) ? Number(attentionScore) : 0;

    if (!hasApiKey()) {
      return res.json({
        explanation: `**Offline mode.** You're looking at the link from "${selectedWord}" to "${targetWord}" (weight ${score.toFixed(2)}).\n\nIn this sandbox the weights come from a small hand-written heuristic, not a trained model - it rewards words that are close together and words that belong to the same topic.\n\n*Add a **GEMINI_API_KEY** in Settings › Secrets to get live explanations here.*`,
      });
    }

    try {
      const explanation = await generate(
        `You are the "Transformer Attention Inspector," a witty, friendly, visual guide who explains deep learning in the style of Nicky Case (https://ncase.me/).

The user has typed this sentence: "${sentence}"
They are inspecting how the word "${selectedWord}" attends to the word "${targetWord}" (heuristic weight ${score.toFixed(2)}).

Explain why these two words are related in this sentence's structure or meaning. Speak directly, 2-3 sentences max, use a clear grammatical reason (pronoun reference, verb-subject, adjective modifying a noun, etc.). Avoid jargon; if you must mention queries/keys/values, explain what they represent. Use markdown.

If the two words are not actually related, say so plainly - it is fine and useful for the learner to see a weak link.`,
      );
      res.json({ explanation });
    } catch (e) {
      console.error(e);
      res.status(502).json({ error: "Failed to generate the attention explanation." });
    }
  });

  // API Route: Ask any question about Transformers
  app.post("/api/ask", async (req, res) => {
    const { question, topic } = req.body ?? {};

    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "question is required." });
    }

    if (!hasApiKey()) {
      return res.json({
        answer: `Hi! I'm running in **offline mode**, so here's a canned explanation:\n\nWords swap context by matchmaking. Each word emits a **Query** (what am I looking for?), a **Key** (what do I offer?) and a **Value** (what do I actually contribute?). Query·Key gives a score, softmax turns those scores into percentages, and the word's new representation is that weighted blend of everyone's Values.\n\n*Add a **GEMINI_API_KEY** in the Secrets panel to chat with me for real.*`,
      });
    }

    try {
      const answer = await generate(
        `You are the "Transformer Guide", an interactive learning companion explaining transformers. Your teaching style is inspired by Nicky Case (Explorable Explanations).

- Use clear, simple, concrete analogies.
- Lively and conversational, split into tiny readable paragraphs or bullets.
- Encourage play and hands-on testing.
- Favour conceptual intuition over formulas - but never say something that is technically false in order to simplify. If a simplification has an important caveat, add one short line flagging it.
${topic ? `\nThe user is currently on the chapter: "${topic}".` : ""}

The user asks: "${question}"

Answer in under 150 words. Use markdown.`,
      );
      res.json({ answer });
    } catch (e) {
      console.error(e);
      res.status(502).json({ error: "Failed to contact the Transformer Guide." });
    }
  });

  if (IS_DEV) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexFile = path.join(distPath, "index.html");
    if (!fs.existsSync(indexFile)) {
      console.error(`No build found at ${indexFile}. Run "npm run build" first.`);
    }
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(indexFile));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Transformer Explorable listening on ${PORT} (${IS_DEV ? "dev" : "production"}, AI ${hasApiKey() ? "enabled" : "offline"})`,
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
