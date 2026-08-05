import { useState, useEffect, useRef } from "react";
import { Send, Bot, HelpCircle, User, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChapterId } from "../types";
import Markdown from "./Markdown";

interface Message {
  sender: "user" | "guide";
  text: string;
}

interface TransformerGuideProps {
  currentChapter: ChapterId;
}

/**
 * Every welcome message below refers to a control that actually exists in that
 * chapter. (The previous copy pointed at buttons like "Subtract Man & Add
 * Woman" and words like 'warm' that were never in the UI.)
 */
const CHAPTER_PROMPTS: Record<ChapterId, { welcome: string; questions: string[] }> = {
  intro: {
    welcome:
      "Hi! I'm Inspector Node, your guide. 🤖 We're going to crack open the Transformer — the architecture behind ChatGPT, Claude and Gemini.\n\nStart on the left: switch between the four scenario cards, then hit **\"Show with no context\"** to see what the word looks like with nobody to lean on.",
    questions: [
      "Why is context so hard for computers?",
      "How did older models handle word meaning?",
      "Can't we just use a dictionary?",
    ],
  },
  embeddings: {
    welcome:
      "Welcome to the word map! 🗺️ Words become coordinates, and similar meanings end up near each other.\n\nPress **Run it** on the Vector math tab to watch king − man + woman, or switch to **Tweak coordinates** and drag the two sliders around.",
    questions: [
      "How can a word have 1000 dimensions?",
      "Who decides these coordinates?",
      "What is cosine similarity?",
    ],
  },
  position: {
    welcome:
      "Look at those waves! 🌊 Attention treats a sentence as an unordered set, so on its own it can't tell \"Dog bites man\" from \"Man bites dog\".\n\nSwitch sentences with the waves **off** and notice nothing moves. Then flip the toggle **on**.",
    questions: [
      "Why waves instead of just numbering words 1, 2, 3?",
      "Do positional encodings change what a word means?",
      "What is RoPE and why did models switch to it?",
    ],
  },
  attention: {
    welcome:
      "The matchmaking ceremony! ❤️ Each word emits a Query, advertises a Key, and offers a Value.\n\nUse the four numbered step buttons at the bottom to walk through the maths, then switch the sentence at the top and run them again.",
    questions: [
      "Explain Query, Key and Value like I'm five.",
      "Why divide by the square root of d_k?",
      "What exactly does softmax do here?",
    ],
  },
  multihead: {
    welcome:
      "Meet the sub-inspectors! 🕵️ One attention pattern has to compromise; several can specialise.\n\nClick the head filters to isolate each one, or **All heads** to see them overlap. Hover a word to fade out the links it isn't part of.",
    questions: [
      "How many heads does a typical model have?",
      "Are these head roles designed by hand?",
      "What happens after the heads finish?",
    ],
  },
  sandbox: {
    welcome:
      "You made it to the lab! 🧪 Type any sentence and a heuristic attention matrix gets built for it.\n\nClick a cell — or two tokens — and I'll explain the link. Don't miss the dark card at the bottom: it lists the parts of the Transformer this guide skipped.",
    questions: [
      "What does the feed-forward network do?",
      "How is self-attention different from cross-attention?",
      "Where can I learn more about explorable explanations?",
    ],
  },
};

export default function TransformerGuide({ currentChapter }: TransformerGuideProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel anything in flight — the answer would belong to the old chapter.
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([{ sender: "guide", text: CHAPTER_PROMPTS[currentChapter].welcome }]);
  }, [currentChapter]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Scroll the chat pane only. scrollIntoView() used to yank the whole page.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const nextMessages: Message[] = [...messages, { sender: "user", text }];
    setMessages(nextMessages);
    setUserInput("");
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, topic: currentChapter }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setMessages([
        ...nextMessages,
        { sender: "guide", text: data.answer ?? "I got an empty answer back — try again?" },
      ]);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error(err);
      setMessages([
        ...nextMessages,
        {
          sender: "guide",
          text: "I couldn't reach the server just now. Check that it's running and give it another go.",
        },
      ]);
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-stone-200 rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden">
      <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center relative">
            <Bot size={20} className="relative z-10" />
            <span className="absolute inset-0 rounded-xl bg-amber-100 animate-pulse-ring z-0" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-stone-900 text-sm">
              Transformer Guide
            </h3>
            <p className="text-xs text-stone-500 font-mono">Inspector Node</p>
          </div>
        </div>
        <button
          onClick={() =>
            setMessages([{ sender: "guide", text: CHAPTER_PROMPTS[currentChapter].welcome }])
          }
          title="Reset chat"
          aria-label="Reset chat"
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.sender === "user"
                    ? "bg-stone-200 text-stone-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-stone-900 text-white rounded-tr-sm whitespace-pre-wrap"
                    : "bg-stone-100 text-stone-800 rounded-tl-sm border border-stone-200/60"
                }`}
              >
                {msg.sender === "user" ? msg.text : <Markdown text={msg.text} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="p-3 bg-stone-100 text-stone-500 rounded-2xl rounded-tl-sm border border-stone-200/60 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-amber-600" />
              <span className="text-xs font-mono">Thinking…</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2 bg-stone-50 border-t border-stone-100/80">
        <p className="text-[11px] font-semibold text-stone-400 mb-1.5 flex items-center gap-1">
          <HelpCircle size={12} /> Click a thought starter:
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto">
          {CHAPTER_PROMPTS[currentChapter].questions.map((question) => (
            <button
              key={question}
              onClick={() => handleSendMessage(question)}
              disabled={isLoading}
              className="text-[11px] text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 py-1 px-2 rounded-full transition-all text-left truncate max-w-full disabled:opacity-50"
              title={question}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(userInput);
        }}
        className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center"
      >
        <label className="sr-only" htmlFor="guide-input">
          Ask the guide a question
        </label>
        <input
          id="guide-input"
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about this chapter…"
          className="flex-1 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-stone-400"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          aria-label="Send question"
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:bg-stone-100 disabled:text-stone-300 transition-all shadow-sm shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
