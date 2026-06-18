import React, { useState } from "react";
import { HelpCircle, ChevronRight, CheckCircle, RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MatchWord {
  text: string;
  queryScore: number; // Simulated query fit for active intent
  keyScore: number;   // Simulated key weight
  value: string;      // The actual semantic cargo
}

export default function ChapterAttention() {
  const [activeSentence, setActiveSentence] = useState<"tired" | "wide">("tired");
  const [calculationStep, setCalculationStep] = useState<"idle" | "similarity" | "softmax" | "mix">("idle");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Set up details for Sentence 1 ("tired" -> animal)
  const tiredWords: MatchWord[] = [
    { text: "The", queryScore: 0, keyScore: 10, value: "[Article]" },
    { text: "animal", queryScore: 10, keyScore: 92, value: "[Animate Entity: Mammal]" },
    { text: "did not", queryScore: 0, keyScore: 15, value: "[Negative Action]" },
    { text: "cross", queryScore: 0, keyScore: 30, value: "[Movement]" },
    { text: "the", queryScore: 0, keyScore: 5, value: "[Article]" },
    { text: "street", queryScore: 0, keyScore: 40, value: "[Physical Road Infrastructure]" },
    { text: "because", queryScore: 0, keyScore: 50, value: "[Causal Connector]" },
    { text: "it", queryScore: 95, keyScore: 10, value: "[Subject Pronoun Reference]" },
    { text: "was", queryScore: 0, keyScore: 10, value: "[Verbal Copula]" },
    { text: "tired", queryScore: 85, keyScore: 88, value: "[Biological State: Needs rest]" }
  ];

  // Set up details for Sentence 2 ("wide" -> street)
  const wideWords: MatchWord[] = [
    { text: "The", queryScore: 0, keyScore: 10, value: "[Article]" },
    { text: "animal", queryScore: 0, keyScore: 14, value: "[Animate Entity: Mammal]" },
    { text: "did not", queryScore: 0, keyScore: 15, value: "[Negative Action]" },
    { text: "cross", queryScore: 0, keyScore: 30, value: "[Movement]" },
    { text: "the", queryScore: 0, keyScore: 5, value: "[Article]" },
    { text: "street", queryScore: 10, keyScore: 94, value: "[Physical Road Infrastructure]" },
    { text: "because", queryScore: 0, keyScore: 50, value: "[Causal Connector]" },
    { text: "it", queryScore: 95, keyScore: 10, value: "[Subject Pronoun Reference]" },
    { text: "was", queryScore: 0, keyScore: 10, value: "[Verbal Copula]" },
    { text: "wide", queryScore: 80, keyScore: 90, value: "[Spatial Dimension: Broad]" }
  ];

  const words = activeSentence === "tired" ? tiredWords : wideWords;

  // Let's compute simulated attention weights of "it" (index 7) paid to all others
  // In Sentence 1 ("tired"), "it" queries "animal" strongly because "tired" is biologic.
  // In Sentence 2 ("wide"), "it" queries "street" strongly because "wide" is spatial.
  const getAttentionWeights = (): Record<string, { similarity: number; softmax: number }> => {
    if (activeSentence === "tired") {
      return {
        "The": { similarity: 12, softmax: 2 },
        "animal": { similarity: 88, softmax: 78 },
        "did not": { similarity: 10, softmax: 1 },
        "cross": { similarity: 20, softmax: 3 },
        "the": { similarity: 8, softmax: 1 },
        "street": { similarity: 35, softmax: 10 },
        "because": { similarity: 15, softmax: 2 },
        "it": { similarity: 20, softmax: 2 },
        "was": { similarity: 10, softmax: 1 },
        "tired": { similarity: 55, softmax: 5 } // attention to active modifier itself has some score
      };
    } else {
      return {
        "The": { similarity: 10, softmax: 2 },
        "animal": { similarity: 32, softmax: 8 },
        "did not": { similarity: 12, softmax: 1 },
        "cross": { similarity: 25, softmax: 3 },
        "the": { similarity: 9, softmax: 1 },
        "street": { similarity: 90, softmax: 80 },
        "because": { similarity: 14, softmax: 2 },
        "it": { similarity: 20, softmax: 2 },
        "was": { similarity: 10, softmax: 1 },
        "wide": { similarity: 50, softmax: 5 }
      };
    }
  };

  const weights = getAttentionWeights();

  return (
    <div className="space-y-6">
      {/* Explanation Header Card */}
      <div className="bg-amber-50 border-2 border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-display font-bold text-amber-900 text-lg flex items-center gap-2">
          🎯 The Core Matchmaker (Self-Attention)
        </h4>
        <div className="text-sm text-stone-700 space-y-3 leading-relaxed">
          <p>
            Self-attention is the heart of the Transformer. To let words exchange context, every word is outfitted with three vectors like a library matchmaking system:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="font-bold text-rose-500 block">🔍 Query (Q)</span>
              <span>"What is my pronoun (or context) looking for?"</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="font-bold text-blue-500 block">🏷️ Key (K)</span>
              <span>"What attributes do I have to offer?"</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="font-bold text-emerald-500 block">📦 Value (V)</span>
              <span>"Who am I actually inside once selected?"</span>
            </div>
          </div>
          <p>
            By matching Queries with Keys, we calculate how much attention they must pay to one another.
          </p>
        </div>
      </div>

      {/* Main Interactive simulation body */}
      <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Toggle options */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="font-display font-semibold text-stone-900 text-base">
              Interactive Matchmaker: Pronoun Resolution
            </h4>
            <p className="text-xs text-stone-500">
              Choose a context. Watch how changing the adjective at the end completely flips the meaning of "it"!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 border border-stone-200 rounded-xl relative z-10 shrink-0">
            <button
              onClick={() => {
                setActiveSentence("tired");
                setCalculationStep("idle");
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeSentence === "tired"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              "...it was tired"
            </button>
            <button
              onClick={() => {
                setActiveSentence("wide");
                setCalculationStep("idle");
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeSentence === "wide"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-900"
              }`}
            >
              "...it was too wide"
            </button>
          </div>
        </div>

        {/* Visual Attention web block */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
          
          {/* Visual connections list */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3.5 relative z-10 w-full max-w-2xl">
            {words.map((item) => {
              const matchesTarget = (activeSentence === "tired" && item.text === "animal") || 
                                    (activeSentence === "wide" && item.text === "street");
              const isPronoun = item.text === "it";
              
              // Compute visual scale/strength based on active calculations
              let connectionOpacity = 0.15;
              let connectionColor = "border-stone-200 text-stone-700";
              const weight = weights[item.text] || { similarity: 0, softmax: 0 };

              if (calculationStep === "similarity") {
                connectionOpacity = 0.2 + (weight.similarity / 140);
                if (matchesTarget) connectionColor = "border-amber-300 bg-amber-50 text-amber-900 ring-1 ring-amber-200/50";
              } else if (calculationStep === "softmax" || calculationStep === "mix") {
                connectionOpacity = 0.1 + (weight.softmax / 100);
                if (matchesTarget) {
                  connectionColor = "border-rose-400 bg-rose-50 text-rose-900 ring-2 ring-rose-400/30 scale-105 shadow-md";
                }
              }

              return (
                <motion.div
                  key={item.text}
                  layout
                  onMouseEnter={() => setHoveredNode(item.text)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`px-2.5 py-2 rounded-xl text-[11px] md:text-xs font-semibold select-none transition-all duration-300 relative ${
                    isPronoun 
                      ? "bg-rose-500 text-white shadow ring-2 ring-rose-300 scale-105 z-20 cursor-pointer" 
                      : `bg-white border border-stone-200 hover:border-stone-400 text-stone-700`
                  }`}
                  style={{
                    opacity: isPronoun ? 1 : connectionOpacity
                  }}
                  id={`attention-node-${item.text}`}
                >
                  <div>{item.text}</div>
                  
                  {/* Floating index tags */}
                  {calculationStep !== "idle" && !isPronoun && (
                    <motion.div 
                      initial={{ scale: 0.8 }} 
                      className="text-[9px] font-mono mt-1 text-stone-400"
                    >
                      {calculationStep === "similarity" ? `Score: ${weight.similarity}` : `Softmax: ${weight.softmax}%`}
                    </motion.div>
                  )}

                  {/* Visual rays connecting IT to targets */}
                  {isPronoun && calculationStep !== "idle" && (
                    <div className="absolute inset-x-0 -bottom-4 flex justify-center pointer-events-none">
                      <motion.div 
                        animate={{ y: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="w-1.5 h-1.5 rounded-full bg-rose-500" 
                      />
                    </div>
                  )}

                  {/* Tooltip detail hover details */}
                  {hoveredNode === item.text && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-40 bg-stone-900 text-white p-2.5 rounded-lg shadow-xl min-w-[150px] pointer-events-none text-[10px] space-y-1 font-mono">
                      <p className="font-bold border-b border-stone-800 pb-1 text-amber-400">"{item.text}"</p>
                      <p className="text-stone-300">Value: {item.value}</p>
                      <p className="text-stone-400">Key Weight: {item.keyScore}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Background visuals showing matchmaking flow graph */}
          {calculationStep === "mix" && (
            <div className="absolute bottom-1 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-1.5 text-[10px] font-mono text-rose-700 flex items-center gap-1.5 animate-bounce z-10">
              <Zap size={11} /> Meaning Blended: Pronoun "it" resolves as &quot;{activeSentence === "tired" ? "Animal" : "Street"}&quot; of next layer!
            </div>
          )}
        </div>

        {/* Calculation Stage timeline controllers */}
        <div className="bg-stone-50 border border-stone-200/50 p-4 rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h5 className="text-xs font-semibold text-stone-800">
                Mathematics Walkthrough: Calculate attention step-by-step
              </h5>
              <p className="text-[10px] text-stone-500">
                Play through Dot-product, Softmax filtering, and Vector Blending.
              </p>
            </div>

            {/* Stepper Buttons */}
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <button
                onClick={() => setCalculationStep("idle")}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                  calculationStep === "idle" ? "bg-stone-900 text-white border-stone-900" : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                1. Reset
              </button>
              <button
                onClick={() => setCalculationStep("similarity")}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 ${
                  calculationStep === "similarity" ? "bg-stone-900 text-white border-stone-900 animate-pulse" : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                2. Dot Product (Similarity)
              </button>
              <button
                onClick={() => setCalculationStep("softmax")}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                  calculationStep === "softmax" ? "bg-stone-900 text-white border-stone-900" : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                3. Softmax filter
              </button>
              <button
                onClick={() => setCalculationStep("mix")}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${
                  calculationStep === "mix" ? "bg-stone-900 text-white border-stone-900" : "bg-white hover:bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                4. Value Blending
              </button>
            </div>
          </div>

          {/* Simple code block or description explaining mathematical matches */}
          <div className="bg-white p-3.5 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-600 leading-relaxed">
            {calculationStep === "idle" && (
              <p>🌱 State: The pronoun <span className="font-bold underline text-rose-500">it</span> needs context. Click **Step 2 (Dot Product)** to cast the Query vector and check similarity with all word Keys!</p>
            )}
            {calculationStep === "similarity" && (
              <p>🔍 Dot Product: $Similarity(Q, K) = Q \cdot K^T$. We test how well the Query fits every word Key. 
              {activeSentence === "tired" ? (
                <span> The word <span className="text-amber-600 font-bold">animal</span> fits the "tired" query perfectly because it's animate! Similarity score is 88.</span>
              ) : (
                <span> The word <span className="text-amber-600 font-bold">street</span> fits the "wide" query perfectly because streets are broad assets! Similarity score is 90.</span>
              )}</p>
            )}
            {calculationStep === "softmax" && (
              <p>🎚️ Softmax Filtering: Softmax(x_i) = exp(x_i) / Sum( exp(x_j) ). Softmax squashes scores into probability distributions. It exponentializes matches, amplifying high scores and making weak connections practically vanish. {activeSentence === "tired" ? "Animal gets boosted to 78% attention weight" : "Street gets boosted to 80% weight"}!</p>
            )}
            {calculationStep === "mix" && (
              <p>🧬 Value Blending: Attention(Q, K, V) = Softmax( Q * K^T / sqrt(d_k) ) * V. We blend all word Value coordinates by their attention weight distribution. The resulting output vector for "it" is now 75%+ enriched with the exact meaning and context of "{activeSentence === "tired" ? "animal" : "street"}"! Truly magical.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
