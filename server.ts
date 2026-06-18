import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: explanation of attention weights
  app.post("/api/inspect-attention", async (req, res) => {
    try {
      const { sentence, selectedWord, targetWord, attentionScore } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({ 
          explanation: `Offline Mode: You are looking at the connection between "${selectedWord}" and "${targetWord}". Since they occur in the same context, they share semantic relations! (Configure your GEMINI_API_KEY in the Settings > Secrets menu on the top right to unlock actual live AI explanations from the Attention Inspector!)` 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the "Transformer Attention Inspector," a witty, friendly, and visual guide who explains deep learning concepts in the style of Nicky Case (https://ncase.me/).
        
        The user is interacting with an explorable explanation.
        The user has typed this sentence: "${sentence}"
        They are inspecting how the word "${selectedWord}" pays attention to the word "${targetWord}" (the attention connection score is estimated at ${attentionScore.toFixed(2)}).
        
        Explain why these two words have this relationship in the sentence structure or meaning. Speak directly, keep it short (2-3 sentences max), use clear analogies/reasons (like pronoun reference, verb subject, adjective modifying noun, etc.), and be extremely engaging and clear. Do not use advanced jargon (like queries/keys/values, explain what those represent instead if you must). Use markdown.`,
      });

      res.json({ explanation: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to generate AI attention explanation." });
    }
  });

  // API Route: Ask any question about Transformers
  app.post("/api/ask", async (req, res) => {
    try {
      const { question, topic } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({ 
          answer: `Hello! I'm your learning companion. It looks like you're running in offline mode. Here is a conceptual explanation:

In transformers, words talk to each other to figure out their context. It is just like a matchmaking ceremony! Every word has a Query (what it wants), a Key (what it is), and a Value (what it actually means). When Query matches Key, they connect!

*To enable live, conversational answers from me on any topic, please add your **GEMINI_API_KEY** in the Secrets panel!*`
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const topicContext = topic ? `The user is currently on the chapter study topic: "${topic}".` : "";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are the "Transformer Guide", an interactive learning companion explaining transformers. Your teaching style is inspired by Nicky Case (author of Joy of Game Theory, Explorable Explanations).
        
        - Use clear, simple, non-technical analogies.
        - Keep explanations lively, conversational, and split into tiny, highly readable paragraphs or bullet points.
        - Encourage play, interaction, hands-on testing, and curiosity.
        - Focus on conceptual intuition, not mathematics or formulas.
        
        ${topicContext}
        
        The user asks: "${question}"
        
        Provide a lovely, short, and highly insightful response. Use markdown formatting.`,
      });

      res.json({ answer: response.text });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message || "Failed to contact the Transformer Guide." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
