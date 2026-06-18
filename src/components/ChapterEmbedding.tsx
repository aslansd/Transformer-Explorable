import React, { useState, useEffect } from "react";
import { HelpCircle, Sparkles, RefreshCcw, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { WordVector } from "../types";

// Static mock points for the Word Map
const STATIC_WORDS: WordVector[] = [
  { word: "king", x: 70, y: 75, category: "royal" },
  { word: "queen", x: 75, y: -75, category: "royal" },
  { word: "man", x: -70, y: 80, category: "location" }, // Category is vocabulary based
  { word: "woman", x: -65, y: -70, category: "location" },
  { word: "puppy", x: -80, y: -20, category: "animal" },
  { word: "kitten", x: -85, y: -45, category: "animal" },
  { word: "lion", x: 30, y: 30, category: "animal" },
  { word: "throne", x: 90, y: 10, category: "furniture" },
  { word: "house", x: -10, y: -80, category: "furniture" }
];

export default function ChapterEmbedding() {
  const [inputText, setInputText] = useState("transformer");
  const [activeTab, setActiveTab] = useState<"math" | "map">("math");
  
  // Grid interactive vectors
  const [similarityResult, setSimilarityResult] = useState<string | null>(null);
  const [mathStage, setMathStage] = useState<"idle" | "subtract_man" | "add_woman" | "result">("idle");
  const [customX, setCustomX] = useState(0);
  const [customY, setCustomY] = useState(0);
  const [closestWord, setClosestWord] = useState<string>("house");

  // Calculate tokens of input
  const getSubTokens = (text: string): string[] => {
    const raw = text.toLowerCase().trim();
    if (raw === "transformer") return ["trans", "form", "er"];
    if (raw === "embeddings") return ["em", "bed", "dings"];
    if (raw === "self-attention") return ["self", "-", "at", "ten", "tion"];
    if (raw === "attention") return ["at", "ten", "tion"];
    if (raw === "prediction") return ["pre", "dic", "tion"];
    
    // Fallback simple character-based divider for demonstration
    if (raw.length <= 4) return [raw];
    if (raw.length <= 8) return [raw.slice(0, Math.floor(raw.length/2)), raw.slice(Math.floor(raw.length/2))];
    return [raw.slice(0, 3), raw.slice(3, Math.floor(raw.length*0.7)), raw.slice(Math.floor(raw.length*0.7))];
  };

  const tokens = getSubTokens(inputText);

  // Compute closest static word to custom coordinates
  useEffect(() => {
    let bestWord = "house";
    let minDistance = 999999;
    STATIC_WORDS.forEach((item) => {
      const dist = Math.pow(item.x - customX, 2) + Math.pow(item.y - customY, 2);
      if (dist < minDistance) {
        minDistance = dist;
        bestWord = item.word;
      }
    });
    setClosestWord(bestWord);
  }, [customX, customY]);

  // Vector Arithmetic Animation sequence
  const startVectorMathSequence = () => {
    setMathStage("subtract_man");
    setTimeout(() => {
      setMathStage("add_woman");
      setTimeout(() => {
        setMathStage("result");
      }, 1200);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Learning Context Card */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🗺️ From Text into Numbers (Tokens & Embeddings)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Computers don't read English—they read **math**. To digest a sentence, the Transformer performs two miracles:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-stone-600">
            <li>
              <span className="font-semibold text-stone-800">Tokenization</span>: Splitting words into sub-word fragments (tokens). For example, "transformer" becomes 
              <span className="bg-stone-100 font-mono text-xs px-1 rounded ml-1 border">['trans', 'form', 'er']</span>.
            </li>
            <li>
              <span className="font-semibold text-stone-800">Embedding</span>: Plotting each token as coordinates inside a high-dimensional **Word Map**.
            </li>
          </ul>
          <p>
            Once plotted, we can perform **literally algebra** on human thoughts!
          </p>
        </div>
      </div>

      {/* Main interaction center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tokenizer on left col */}
        <div className="lg:col-span-5 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-stone-900 text-sm">
              1. The Sub-word Tokenizer
            </h4>
            <p className="text-xs text-stone-500 leading-normal">
              Type a word (try "transformer", "attention", "embeddings") to see how sub-word tokens are extracted to handle rare/complex words.
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value.slice(0, 18))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none focus:bg-white text-stone-900 font-medium"
                placeholder="Type compound words..."
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {["transformer", "embeddings", "attention", "prediction"].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setInputText(preset)}
                    className="text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-2 py-1 rounded-md border border-stone-200 transition-colors"
                  >
                    "{preset}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tokens display board */}
          <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-mono tracking-wider text-stone-400 block uppercase">
              Tokenizer output fragments
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {tokens.map((tok, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-semibold ${
                    idx === 0 ? "bg-amber-100 text-amber-800 border-amber-200" :
                    idx === 1 ? "bg-blue-100 text-blue-800 border-blue-200" :
                    "bg-teal-100 text-teal-800 border-teal-200"
                  }`}
                >
                  "{tok}"
                </motion.div>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 leading-normal pt-1.5">
              These sub-words map directly to token IDs in a massive vocabulary lookup dictionary of 50,000+ words!
            </p>
          </div>
        </div>

        {/* Word map playground on right col */}
        <div className="lg:col-span-7 bg-white border-2 border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone-100 pb-2">
            <h4 className="font-display font-semibold text-stone-950 text-sm">
              2. Explore the High-Dimensional Mind
            </h4>
            <div className="flex bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button
                onClick={() => setActiveTab("math")}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "math" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Vector Math
              </button>
              <button
                onClick={() => setActiveTab("map")}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                  activeTab === "map" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Tweak Coordinates
              </button>
            </div>
          </div>

          {/* Interactive coordinate canvas plot */}
          <div className="h-72 w-full bg-stone-950 rounded-2xl relative overflow-hidden border border-stone-800 flex items-center justify-center">
            {/* Draw grid axises */}
            <hr className="absolute inset-x-0 border-t border-stone-800 top-1/2" />
            <hr className="absolute inset-y-0 border-l border-stone-800 left-1/2" />
            <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-stone-600 uppercase tracking-widest">
              Royalty (Y)
            </span>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-stone-600 uppercase tracking-widest">
              Femininity (X)
            </span>

            {/* Print static nodes */}
            {STATIC_WORDS.map((item) => {
              // Highlight based on arithmetic sequence
              let highlighted = false;
              if (mathStage === "subtract_man" && (item.word === "king" || item.word === "man")) highlighted = true;
              if (mathStage === "add_woman" && (item.word === "woman")) highlighted = true;
              if (mathStage === "result" && item.word === "queen") highlighted = true;

              return (
                <motion.div
                  key={item.word}
                  style={{
                    position: "absolute",
                    left: `${(item.x + 100) / 2}%`,
                    bottom: `${(item.y + 100) / 2}%`
                  }}
                  className={`-translate-x-1/2 translate-y-1/2 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-lg border transition-all pointer-events-none ${
                    highlighted
                      ? "bg-amber-400 text-stone-900 border-amber-300 scale-110 shadow-lg shadow-amber-500/20 z-20"
                      : "bg-stone-900 text-stone-400 border-stone-800"
                  }`}
                  id={`embedding-node-${item.word}`}
                >
                  {item.word}
                </motion.div>
              );
            })}

            {/* Custom Interactive Dragger element (only in coordinate slider tab) */}
            {activeTab === "map" && (
              <motion.div
                style={{
                  position: "absolute",
                  left: `${(customX + 100) / 2}%`,
                  bottom: `${(customY + 100) / 2}%`
                }}
                className="w-4 h-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500 border-2 border-white shadow-xl flex items-center justify-center relative group z-30"
                id="embedding-dragger"
              >
                <div className="absolute top-5 bg-blue-600 text-white text-[9px] font-mono font-bold rounded px-1 min-w-[70px] text-center shadow">
                  Your Concept
                </div>
              </motion.div>
            )}

            {/* Visual Vectors drawing representing subtraction/addition math */}
            {activeTab === "math" && mathStage !== "idle" && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {/* SVG connection lines representing subtraction of 'Man' vector and adding of 'Woman' */}
                {mathStage === "subtract_man" && (
                  <line 
                    x1="85%" y1="12.5%" 
                    x2="15%" y2="10%" 
                    stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 4" 
                  />
                )}
                {mathStage === "add_woman" && (
                  <line 
                    x1="15%" y1="10%" 
                    x2="17.5%" y2="85%" 
                    stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 4" 
                  />
                )}
                {mathStage === "result" && (
                  <line 
                    x1="85%" y1="12.5%" 
                    x2="87.5%" y2="87.5%" 
                    stroke="#f43f5e" strokeWidth="3" 
                  />
                )}
              </svg>
            )}
          </div>

          {/* Controls footer depends on tabs chosen */}
          {activeTab === "math" ? (
            <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-3.5">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-semibold text-stone-800">
                    The Legendary: King - Man + Woman = ?
                  </h5>
                  <p className="text-[10px] text-stone-500">
                    Click subtraction to slide through concept equations.
                  </p>
                </div>
                <button
                  onClick={startVectorMathSequence}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg border border-amber-600 shadow transition-all flex items-center gap-1 shrink-0"
                >
                  <Sparkles size={13} /> Compute algebra
                </button>
              </div>

              {/* Display visual math equation states */}
              <div className="flex gap-1.5 items-center justify-around font-mono text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200">
                <span className="font-bold text-stone-800">👑 king</span>
                <span>-</span>
                <span className={`px-1.5 py-0.5 rounded ${mathStage === "subtract_man" ? "bg-amber-100 text-amber-900 border border-amber-200 font-bold" : ""}`}>
                  👨 man
                </span>
                <span>+</span>
                <span className={`px-1.5 py-0.5 rounded ${mathStage === "add_woman" ? "bg-amber-100 text-amber-900 border border-amber-200 font-bold" : ""}`}>
                  👩 woman
                </span>
                <span>=</span>
                <span className={`px-2 py-0.5 rounded-lg ${mathStage === "result" ? "bg-rose-500 text-white font-bold animate-bounce" : "bg-stone-100 text-stone-400"}`}>
                  {mathStage === "result" ? "👸 queen!" : "Calculating..."}
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-3">
              <h5 className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                🎛️ Adjust dimensions of "Your Concept"
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 flex justify-between">
                    <span>Feminine weight (X)</span>
                    <span className="font-bold text-stone-700">{customX}</span>
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={customX}
                    onChange={(e) => setCustomX(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-stone-500 flex justify-between">
                    <span>Royal weight (Y)</span>
                    <span className="font-bold text-stone-700">{customY}</span>
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={customY}
                    onChange={(e) => setCustomY(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200 flex justify-between items-center">
                <span>Closest concept in coordinate dictionary:</span>
                <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200 rounded font-bold uppercase text-[10px]">
                  "{closestWord}"
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
