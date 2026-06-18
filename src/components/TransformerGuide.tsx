import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Bot, HelpCircle, User, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ChapterId } from "../types";

interface Message {
  sender: "user" | "guide";
  text: string;
}

interface TransformerGuideProps {
  currentChapter: ChapterId;
}

const CHAPTER_PROMPTS: Record<ChapterId, { welcome: string; questions: string[] }> = {
  intro: {
    welcome: "Hi! I'm Inspector Node, your guide. 🤖 In this explorable, we're going to crack open the Transformer—the secret brain behind ChatGPT, Gemini, and other modern AI.\n\nTry clicking on 'warm' or 'biological' on the left card to see how word representations shift based on neighbors!",
    questions: [
      "Why is context so hard for computers?",
      "How did older models process sentences?",
      "Can't we just use a dictionary?"
    ]
  },
  embeddings: {
    welcome: "Welcome to the Word Map! 🗺️ Here, words are plotted as coordinates. Similar concepts naturally cluster together.\n\nTry dragging the sliders to tweak the concepts, or press 'Subtract Man & Add Woman' to see the legendary Vector Math!",
    questions: [
      "Wait, how does a word map to 1000+ dimensions?",
      "Who teaches computers these coordinates?",
      "What is cosine similarity?"
    ]
  },
  position: {
    welcome: "Look at those waves! 🌊 Since computers read math all at once (in parallel), they are naturally 'anagram blind'. They see 'Dog bites man' and 'Man bites dog' as identical.\n\nToggle the position styles on the left to see how adding waves prevents this confusion!",
    questions: [
      "Why waves (sine/cosine) instead of just numbers 1, 2, 3?",
      "Do positional encodings change the word meaning?",
      "Does the model struggle with very long sentences?"
    ]
  },
  attention: {
    welcome: "Welcome to the Matchmaking Ceremony! ❤️ This is Self-Attention. Here, a word publishes a Query, other words show their Keys, and they merge Values.\n\nClick the toggles to switch sentences, then hover over 'it' to see how it shifts attention from animal to street!",
    questions: [
      "Explain Query, Key, and Value like I'm 5.",
      "How does the model calculate the dot product similarity?",
      "What is 'Softmax' and why is it used here?"
    ]
  },
  multihead: {
    welcome: "Meet the sub-inspectors! 🕵️🕵️🕵️ One head can't do it all. Each Attention Head focuses on a different relationship (who did what, which descriptive adjectives apply).\n\nClick on different head filters on the left to see their custom search nets light up!",
    questions: [
      "How many attention heads does a typical model have?",
      "Are these attention heads hand-designed?",
      "What happens after the heads finish paying attention?"
    ]
  },
  sandbox: {
    welcome: "You made it to the Lab! 🧪 Write any sentence below and watch our synthetic Transformer process it. Click on cells in the heatmap or select single words directly, and I'll explain their connection in real-time!",
    questions: [
      "What does the feed-forward network do afterwards?",
      "How is this different from cross-attention?",
      "Where can I learn more about Nicky Case explorable explanations?"
    ]
  }
};

export default function TransformerGuide({ currentChapter }: TransformerGuideProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message when chapter changes
  useEffect(() => {
    setMessages([
      {
        sender: "guide",
        text: CHAPTER_PROMPTS[currentChapter].welcome
      }
    ]);
  }, [currentChapter]);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { sender: "user", text } as Message];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, topic: currentChapter })
      });

      if (!response.ok) {
        throw new Error("HTTP error");
      }

      const data = await response.json();
      setMessages([...newMessages, { sender: "guide", text: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          sender: "guide",
          text: "Oh no! My neural circuits got crossed. Please ensure your Express dev server is running and try again!"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-stone-200 rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden">
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold relative">
            <Bot size={20} className="relative z-10" />
            <span className="absolute inset-0 rounded-xl bg-amber-100 animate-pulse-ring z-0"></span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-stone-900 text-sm">Transformer Guide</h3>
            <p className="text-xs text-stone-500 font-mono">Inspector Node v1.1</p>
          </div>
        </div>
        <button 
          onClick={() => setMessages([{ sender: "guide", text: CHAPTER_PROMPTS[currentChapter].welcome }])}
          title="Reset Chat"
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-[20]">
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
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === "user"
                    ? "bg-stone-200 text-stone-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-stone-900 text-white rounded-tr-sm"
                    : "bg-stone-100 text-stone-800 rounded-tl-sm border border-stone-200/55"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Bot size={14} />
            </div>
            <div className="p-3 bg-stone-100 text-stone-500 rounded-2xl rounded-tl-sm border border-stone-200/55 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-amber-600" />
              <span className="text-xs font-mono">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-stone-50 border-t border-stone-100/80">
        <p className="text-[11px] font-semibold text-stone-400 mb-1.5 flex items-center gap-1">
          <HelpCircle size={12} /> Click a thought starter:
        </p>
        <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto">
          {CHAPTER_PROMPTS[currentChapter].questions.map((quiz, qidx) => (
            <button
              key={qidx}
              onClick={() => handleSendMessage(quiz)}
              className="text-[11px] text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 py-1 px-2 rounded-full transition-all text-left truncate max-w-full"
              title={quiz}
            >
              {quiz}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(userInput);
        }}
        className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center"
      >
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Ask about this slide...`}
          className="flex-1 bg-stone-50 border border-stone-200 text-stone-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-stone-400"
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isLoading}
          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white disabled:bg-stone-100 disabled:text-stone-300 transition-all shadow-sm shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
